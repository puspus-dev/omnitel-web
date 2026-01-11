// ===== FILE: assets/js/dashboard.js =====
let currentUser = localStorage.getItem('currentUser');
let users = JSON.parse(localStorage.getItem('users')||'{}');


if(!currentUser || !users[currentUser]){
alert('Nincs belépett felhasználó!');
window.location.href='myomnitel.html';
}


// Alap csomagok
const packages = {
'Klasszik 2009': {percek:100, sms:100, fee:3990},
'Omni Plus': {percek:300, sms:200, fee:6990},
'OmniTel Free': {percek:50, sms:50, fee:0}
};


// Current user csomag
let userPackage = localStorage.getItem('userPackage') || 'OmniTel Free';
let usage = {percek:0, sms:0};


// Dashboard elemek
document.getElementById('dash-phone').textContent = currentUser;
document.getElementById('dash-package').textContent = userPackage;
document.getElementById('total-minutes').textContent = packages[userPackage].percek;
document.getElementById('total-sms').textContent = packages[userPackage].sms;
document.getElementById('messages').textContent = '';


// Felhasználói lista (kivéve a saját)
const userListEl = document.getElementById('user-list');
for(const u in users){
if(u!==currentUser){
const li = document.createElement('li');
li.textContent = u;
li.onclick = ()=>{ selectedUser = u; alert('Hívás / SMS a következő felhasználónak: '+u); };
userListEl.appendChild(li);
}
}


let selectedUser = null;


// Real-time usage update (2s)
setInterval(()=>{
if(usage.percek<packages[userPackage].percek){ usage.percek += Math.floor(Math.random()*3); if(usage.percek>packages[userPackage].percek) usage.percek = packages[userPackage].percek; }
if(usage.sms<packages[userPackage].sms){ usage.sms += Math.floor(Math.random()*2); if(usage.sms>packages[userPackage].sms) usage.sms = packages[userPackage].sms; }
document.getElementById('usage-minutes').textContent = usage.percek;
document.getElementById('usage-sms').textContent = usage.sms;


// Free csomag limit alert
if(userPackage==='OmniTel Free'){
if(usage.percek>=packages[userPackage].percek*0.8 || usage.sms>=packages[userPackage].sms*0.8){
document.getElementById('usage-minutes').style.color='red';
document.getElementById('usage-sms').style.color='red';
}
}
},2000);


// SMS küldés szimuláció
function sendSMS(){
const msgInput = document.getElementById('sms-input');
const msg = msgInput.value.trim();
const messagesEl = document.getElementById('messages');
if(!selectedUser){ alert('Válassz egy felhasználót a listából!'); return; }
if(msg===''){ alert('Írj üzenetet!'); return; }


// Növeljük a felhasználás
usage.sms +=1; if(usage.sms>packages[userPackage].sms) usage.sms=packages[userPackage].sms;


// Megjelenítés
const p = document.createElement('div');
p.textContent = `Te → ${selectedUser}: ${msg}`;
messagesEl.appendChild(p);
msgInput.value='';
}


// Logout
function logout(){
localStorage.removeItem('currentUser');
alert('Kijelentkeztél!');
window.location.href='myomnitel.html';
}