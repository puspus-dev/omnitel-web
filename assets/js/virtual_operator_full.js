// ===== FILE: assets/js/virtual_operator_full.js =====


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


// Free csomag limit figyelés
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


setTimeout(function() {
    const reply = document.createElement('div');  // új div létrehozása
    reply.textContent = selectedUser + " → Te: OK!"; // szöveg beállítása
    if (messagesEl) {  // ellenőrizzük, hogy a DOM elem létezik
        messagesEl.appendChild(reply); // hozzáadjuk a messages panelhez
    }
}, 2000 + Math.random() * 1000);