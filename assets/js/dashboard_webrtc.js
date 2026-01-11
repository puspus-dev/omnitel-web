// ===== FILE: assets/js/dashboard_webrtc.js =====


let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let selectedUser = null;


// Signaling egyszerűen WebSocket-szerűen (saját megoldás vagy PeerJS)
// Itt csak frontend demo, valódi P2P kapcsolat WebSocket/signaling kell


async function startCall(user){
if(!user){ alert('Válassz egy felhasználót a listából!'); return; }
selectedUser = user;
localStream = await navigator.mediaDevices.getUserMedia({ audio: true });


peerConnection = new RTCPeerConnection(config);
localStream.getTracks().forEach(track=>peerConnection.addTrack(track, localStream));


// Távoli stream
peerConnection.ontrack = (event)=>{
const audioEl = document.createElement('audio');
audioEl.srcObject = event.streams[0];
audioEl.autoplay = true;
document.body.appendChild(audioEl);
};


const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);


// Demo: itt kellene küldeni a signaling szervernek az offer-t
alert('Hívás indítva '+user+' felé (WebRTC offer elkészült)');
}


async function receiveCall(offer){
localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
peerConnection = new RTCPeerConnection(config);
localStream.getTracks().forEach(track=>peerConnection.addTrack(track, localStream));


peerConnection.ontrack = (event)=>{
const audioEl = document.createElement('audio');
audioEl.srcObject = event.streams[0];
audioEl.autoplay = true;
document.body.appendChild(audioEl);
};


await peerConnection.setRemoteDescription(offer);
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);


// Demo: itt kellene küldeni a signaling szervernek az answer-t
alert('Hívás fogadva! (WebRTC answer elkészült)');
}


function endCall(){
if(peerConnection){
peerConnection.close();
peerConnection = null;
alert('Hívás vége');
}
}