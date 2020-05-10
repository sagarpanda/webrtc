const offerField = document.querySelector('#offer-field');
const offerCandField = document.querySelector('#offer-cand-field');
const startBtn = document.querySelector('#start');
const answerField = document.querySelector('#answer-field');
const answerCandField = document.querySelector('#answer-cand-field');
const joinBtn = document.querySelector('#join');

const chat = document.querySelector('#chat');
const chatField = document.querySelector('#chat-field');
const send = document.querySelector('#send');

const configuration = { iceServers: [{ "url": "stun:stun.1.google.com:19302" }] }; 
let pc = new webkitRTCPeerConnection(configuration, {optional: [{ RtpDataChannels: true }]});;
let sendChannel = null;
let receiveChannel = null;
let whoiam = null;


const gotDescription1 = (desc) => {
   pc.setLocalDescription(desc);
   console.log('Offer from pc', desc);
   offerField.value = JSON.stringify(desc);
 }


const createConnection = () => {
   if (!whoiam) { whoiam = 'local'; }
   try {
     sendChannel = pc.createDataChannel("sendDataChannel", { reliable: false });
   } catch (e) {
     alert('Failed to create data channel. ' +
           'You need Chrome M25 or later with --enable-data-channels flag');
     trace('Create Data channel failed with exception: ' + e.message);
   }
   pc.onicecandidate = (event) => {
      if (event.candidate) {
         offerCandField.value = JSON.stringify(event.candidate);
      }
   };
   sendChannel.onmessage = onReceiveMessageCallback;
   sendChannel.onopen = onSendChannelStateChange;
   sendChannel.onclose = onSendChannelStateChange;
 
   pc.createOffer((desc) => {
      pc.setLocalDescription(desc);
      offerField.value = JSON.stringify(desc);
   }, error => console.log('error pc1', error));
   console.log('createOffer');
}


const joinConnection = () => {
   if (!whoiam) { whoiam = 'remote'; }
   const sdpOption = JSON.parse(answerField.value);
   const rtcSessionDesc = new RTCSessionDescription(sdpOption);

   const candOption = JSON.parse(answerCandField.value);
   const candidate = new RTCIceCandidate(candOption);
   console.log('rtcSessionDesc', rtcSessionDesc);

   if(whoiam === 'remote') {
      pc.onicecandidate = (event) => {
         console.log('local ice callback');
         if (event.candidate) {
            offerCandField.value = JSON.stringify(event.candidate);
            console.log('Local ICE candidate: \n' + event.candidate.candidate);
         }
      };
      pc.ondatachannel = () => {
         console.log('ondatachannel');
         receiveChannel = event.channel;
         receiveChannel.onmessage = onReceiveMessageCallback;
         receiveChannel.onopen = onReceiveChannelStateChange;
         receiveChannel.onclose = onReceiveChannelStateChange;
      };
   }
   pc.setRemoteDescription(rtcSessionDesc);
   pc.addIceCandidate(candidate);

   if(whoiam === 'remote') {
      pc.createAnswer((desc) => {
         pc.setLocalDescription(desc);
         //trace('Offer from pc1 \n' + desc.sdp);
         console.log('Offer from pc2', desc);
         offerField.value = JSON.stringify(desc);
      }, error => console.log('error pc2', error));
   }
};


function onReceiveMessageCallback(event) {
   console.log('Received Message', event.data);
   const sneder = { local: 'remote', remote: 'local'};
   const elm = document.createElement('div');
   elm.textContent = sneder[whoiam] + ': ' + event.data;
   chat.appendChild(elm);
 }

function onSendChannelStateChange() {
   var readyState = sendChannel.readyState;
   console.log('Send channel state is: ' + readyState);
   if (readyState == "open") {
     startBtn.disabled = true;
     joinBtn.disabled = true;
     send.disabled = false;
     chatField.disabled = false;
   } else {
     startBtn.disabled = false;
     joinBtn.disabled = false;
     send.disabled = true;
     chatField.disabled = true;
   }
 }

function onReceiveChannelStateChange() {
   var readyState = receiveChannel.readyState;
   console.log('Receive channel state is: ' + readyState);
   if (readyState == "open") {
     startBtn.disabled = true;
     joinBtn.disabled = true;
     send.disabled = false;
     chatField.disabled = false;
   } else {
     startBtn.disabled = false;
     joinBtn.disabled = false;
     send.disabled = true;
     chatField.disabled = true;
   }
 }

const startOffer = (evt) => {
   evt.target.disabled = true;
   //joinBtn.disabled = true;
   createConnection();
}

const joinAnswer = (evt) => {
   evt.target.disabled = true;
   startBtn.disabled = true;
   joinConnection();
}

const senData = () => {
   const message = chatField.value;
   if(whoiam === 'remote') {
      receiveChannel.send(message);
   } else {
      sendChannel.send(message);
   }

   const elm = document.createElement('div');
   elm.textContent = whoiam + ': ' + message;
   chat.appendChild(elm);

   chatField.value = '';
}

startBtn.addEventListener('click', startOffer);
joinBtn.addEventListener('click', joinAnswer);
send.addEventListener('click', senData);
chatField.addEventListener('keydown', (event) => {
   if(event.key === 'Enter')
   senData();
});

