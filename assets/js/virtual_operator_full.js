// ===== FILE: assets/js/virtual_operator_dashboard_full.js =====


// === Felhasználói adatok ===
let currentUser = localStorage.getItem('currentUser');
let users = JSON.parse(localStorage.getItem('users')||'{}');


if(!currentUser || !users[currentUser]){
alert('Nincs belépett felhasználó!');
window.location.href='myomnitel.html';
}


// Csomagok és usage
const packages = {
'Klasszik 2009': {percek:100, sms:100, fee:3990},
'Omni Plus': {percek:300, sms:200, fee:6990},
'OmniTel Free': {percek:50, sms:50, fee:0}
};
let userPackage = localStorage.getItem('userPackage') || 'OmniTel Free';
let usage = {percek:0, sms:0};


// Dashboard elemek
const dashPhoneEl = document.getElementById('dash-phone');
const dashPackageEl = document.getElementById('dash-package');
const usageMinutesEl = document.getElementById('usage-minutes');
const usageSmsEl = document.getElementById('usage-sms');
const messagesEl = document.getElementById('messages');
const userListEl = document.getElementById('user-list');


dashPhoneEl.textContent = currentUser;
dashPackageEl.textContent = userPackage;
usageMinutesEl.textContent = usage.percek;
usageSmsEl.textContent = usage.sms;
messagesEl.textContent='';


// === Felhasználói lista ===
let selectedUser = null;
userListEl.innerHTML='';
for(const u in users){
if(u!==currentUser){
const li = document.createElement('li');
li.textContent = u;
li.onclick = ()=>{
selectedUser = u;
showIncomingCallIcon(u);
alert('Hívás / SMS a következő felhasználónak: '+u);
};
userListEl.appendChild(li);
}
}


// === Real-time usage frissítés ===
setInterval(()=>{
if(usage.percek<packages[userPackage].percek){ usage.percek += Math.floor(Math.random()*3); if(usage.percek>packages[userPackage].percek) usage.percek = packages[userPackage].percek; }
if(usage.sms<packages[userPackage].sms){ usage.sms += Math.floor(Math.random()*2); if(usage.sms>packages[userPackage].sms) usage.sms = packages[userPackage].sms; }
usageMinutesEl.textContent = usage.percek;
usageSmsEl.textContent = usage.sms;


if(userPackage==='OmniTel Free'){
if(usage.percek>=packages[userPackage].percek*0.8 || usage.sms>=packages[userPackage].sms*0.8){
usageMinutesEl.style.color='red';
usageSmsEl.style.color='red';
} else { usageMinutesEl.style.color='black'; usageSmsEl.style.color='black'; }
}
},2000);


// === SMS küldés ===
function sendSMS(){
const msgInput = document.getElementById('sms-input');
const msg = msgInput.value.trim();
if(!selectedUser){ alert('Válassz egy felhasználót!'); return; }
if(msg===''){ alert('Írj üzenetet!'); return; }


usage.sms +=1; if(usage.sms>packages[userPackage].sms) usage.sms=packages[userPackage].sms;


const p = document.createElement('div');
p.textContent = `Te → ${selectedUser}: ${msg}`;
messagesEl.appendChild(p);
msgInput.value='';


showIncomingSmsIcon(selectedUser);


setTimeout(function(){
const reply = document.createElement('div');
reply.textContent = selectedUser + ' → Te: OK!';
if(messagesEl){ messagesEl.appendChild(reply); }
}, 2000 + Math.random()*1000);
}


// === WebRTC hívás integráció ===
let localStream, peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };


async function startCall() {
  if (!selectedUser) { 
    alert('Válassz felhasználót!'); 
    return; 
  }
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
      const audioEl = document.createElement('audio');
      audioEl.srcObject = event.streams[0];
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    let signals = JSON.parse(localStorage.getItem('webrtc-signaling-demo') || '[]');
    signals.push({ from: currentUser, to: selectedUser, type: 'offer', sdp: offer });
    localStorage.setItem('webrtc-signaling-demo', JSON.stringify(signals));

    showIncomingCallIcon(selectedUser);
    alert('Hívás indítva ' + selectedUser + ' felé');
  } catch(err) {
    console.error('Hiba a hívás indításakor:', err);
    alert('Hiba történt a hívás indításakor!');
  }
} // <-- a startCall itt lezárva

// Top-level exportok külön
window.startCall = startCall;
window.endCall = endCall;
window.showIncomingCallIcon = showIncomingCallIcon;
window.showIncomingSmsIcon = showIncomingSmsIcon;
window.sendSMS = sendSMS;
window.logout = logout;