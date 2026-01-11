// ===== FILE: assets/js/webrtc_signaling_demo.js =====

// Current user ellenőrzés
let currentUser = localStorage.getItem('currentUser');
if(!currentUser){
    alert('Nincs belépett felhasználó!');
    window.location.href='myomnitel.html';
}

// WebRTC alapbeállítás
let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Kiválasztott felhasználó a híváshoz
let selectedUser = null;

// Egyszerű frontend-only signaling localStorage alapokon (demo)
const signalingChannel = 'webrtc-signaling-demo';

// Signaling üzenet küldés
function sendSignal(message){
    // message = {from, to, type, sdp}
    let signals = JSON.parse(localStorage.getItem(signalingChannel) || '[]');
    signals.push(message);
    localStorage.setItem(signalingChannel, JSON.stringify(signals));
}

// Signaling ellenőrzése és feldolgozása
function checkSignals(){
    let signals = JSON.parse(localStorage.getItem(signalingChannel) || '[]');
    signals.forEach(async msg => {
        if(msg.to === currentUser){
            if(msg.type==='offer'){
                await receiveCall(msg.from, msg.sdp);
            } else if(msg.type==='answer' && peerConnection){
                await peerConnection.setRemoteDescription(msg.sdp);
            }
        }
    });
    // Feldolgozott üzenetek törlése
    signals = signals.filter(msg => msg.to !== currentUser);
    localStorage.setItem(signalingChannel, JSON.stringify(signals));
}

// Ellenőrzés 1 másodpercenként
setInterval(checkSignals, 1000);

// Hívás indítása
async function startCall(user){
    if(!user){ alert('Válassz felhasználót!'); return; }
    selectedUser = user;

    // Mikrofon hozzáférés
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(config);

    // Saját stream hozzáadása
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Távoli stream megjelenítése
    peerConnection.ontrack = event => {
        const audioEl = document.createElement('audio');
        audioEl.srcObject = event.streams[0];
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
    };

    // Offer létrehozása
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Signaling üzenet küldése
    sendSignal({from: currentUser, to: user, type: 'offer', sdp: offer});
    alert('Hívás indítva ' + user + ' felé');
}

// Hívás fogadása
async function receiveCall(fromUser, offer){
    selectedUser = fromUser;

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(config);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        const audioEl = document.createElement('audio');
        audioEl.srcObject = event.streams[0];
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Válasz elküldése a signaling csatornán
    sendSignal({from: currentUser, to: fromUser, type: 'answer', sdp: answer});
    alert('Hívás fogadva ' + fromUser + '-től');
}

// Hívás befejezése
function endCall(){
    if(peerConnection){
        peerConnection.close();
        peerConnection = null;
        alert('Hívás vége');
        removeCallIcons();
    }
}

// Ikonok a dashboardon a hívások jelzésére
function showIncomingCallIcon(user){
    let el = document.getElementById('call-icon-'+user);
    if(!el){
        el = document.createElement('div');
        el.id = 'call-icon-'+user;
        el.textContent = '📞 Hívás '+user+'-től';
        el.style.color = 'green';
        document.body.appendChild(el);
    }
}

// Ikonok a dashboardon az SMS-ek jelzésére
function showIncomingSmsIcon(user){
    let el = document.getElementById('sms-icon-'+user);
    if(!el){
        el = document.createElement('div');
        el.id = 'sms-icon-'+user;
        el.textContent = '📩 SMS érkezett '+user+'-től';
        el.style.color = 'blue';
        document.body.appendChild(el);
    }
}

// Minden ikon eltávolítása hívás végén
function removeCallIcons(){
    document.querySelectorAll('[id^="call-icon-"]').forEach(e=>e.remove());
    document.querySelectorAll('[id^="sms-icon-"]').forEach(e=>e.remove());
}

// Exportálhatjuk a hívás funkciókat a dashboardon használathoz
window.startCall = startCall;
window.endCall = endCall;
window.showIncomingCallIcon = showIncomingCallIcon;
window.showIncomingSmsIcon = showIncomingSmsIcon;