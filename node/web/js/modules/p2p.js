app.modules.p2p = (function(){

	performance.now = performance.now || performance.webkitNow;

	var pc1 = null;
	var sendChannel, receiveChannel;
	//startButton.disabled = false;
	//sendButton.disabled = true;
	//closeButton.disabled = true;
	var sendto_userid = null;
	var isCaller = null;
	var remoteData = null;
	var jsonData = {};

	function trace(text) {
	  // This function is used for logging.
	  if (text[text.length - 1] == '\n') {
	    text = text.substring(0, text.length - 1);
	  }
	  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
	};

	function createConnection(userid, caller) {
		sendto_userid = userid;
		isCaller = caller;
		jsonData.to = sendto_userid;
		jsonData.isCaller = caller;
		var servers = null;
		pc1 = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
		trace('Created local peer connection object pc1');

		try {
			// Reliable Data Channels not yet supported in Chrome
			// Data Channel api supported from Chrome M25.
			// You need to start chrome with  --enable-data-channels flag.
			sendChannel = pc1.createDataChannel("sendDataChannel", {reliable: false});
			trace('Created send data channel');
		} catch (e) {
			alert('Failed to create data channel. ' + 'You need Chrome M25 or later with --enable-data-channels flag');
			trace('Create Data channel failed with exception: ' + e.message);
		}
		pc1.onicecandidate = iceCallback1;
		sendChannel.onopen = onSendChannelStateChange;
		sendChannel.onclose = onSendChannelStateChange;

		pc1.ondatachannel = receiveChannelCallback;

		//window.pc2 = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
		//trace('Created remote peer connection object pc2');

		//pc2.onicecandidate = iceCallback2;
		//pc2.ondatachannel = receiveChannelCallback;
		if (isCaller) {
			pc1.createOffer(gotDescription1);
		}else{
			pc1.createAnswer(gotDescription1);
		};
		//startButton.disabled = true;
		//closeButton.disabled = false;
	};

	function sendData(msg) {
	  //var data = document.getElementById("dataChannelSend").value;
	  sendChannel.send(msg);
	  trace('Sent Data: ' + msg);
	};

	function closeDataChannels() {
	  trace('Closing data Channels');
	  sendChannel.close();
	  trace('Closed data channel with label: ' + sendChannel.label);
	  receiveChannel.close();
	  trace('Closed data channel with label: ' + receiveChannel.label);
	  pc1.close();
	  pc2.close();
	  pc1 = null;
	  pc2 = null;
	  trace('Closed peer connections');
	  startButton.disabled = false;
	  sendButton.disabled = true;
	  closeButton.disabled = true;
	  dataChannelSend.value = "";
	  dataChannelReceive.value = "";
	  dataChannelSend.disabled = true;
	  dataChannelSend.placeholder = "Press Start, enter some text, then press Send.";
	};

	function gotDescription1(desc) {
	  pc1.setLocalDescription(desc);
	  //trace('Offer from pc1 \n' + desc.sdp);
	  trace('Offer from pc1');
	  //pc2.setRemoteDescription(desc);
	  //pc2.createAnswer(gotDescription2);
	  jsonData.desc = desc;
	  app.modules.node.sendRtcData(sendto_userid, jsonData);
	  //if (!isCaller) {
	  	//pc1.setRemoteDescription(remoteData.desc);
	  	//setRemoteData(data);
	  //};
	  
	};

	function setRemoteData(data){
		console.log("p2p.js: setRemoteData - from: "+data.from);
		if (!pc1) {
			remoteData = data;
			createConnection(data.from, false);
		};

		if(data.desc){
			pc1.setRemoteDescription(data.desc);
		};
	};

	function addCandidate1(data){
		pc1.addIceCandidate(data.ice);
	};

	function setRtcMsg(data){
		if (!pc1) {
			createConnection(data.from, false);
		}

		if (data.desc) {
			//pc1.setRemoteDescription(data.desc);
			pc1.setRemoteDescription(new RTCSessionDescription(data.desc));
		}else{
			//pc1.addIceCandidate(data.ice);
			pc1.addIceCandidate(new RTCIceCandidate(data.ice));
		};
	};

	function gotDescription2(desc) {
	  pc2.setLocalDescription(desc);
	  trace('Answer from pc2 \n' + desc.sdp);
	  pc1.setRemoteDescription(desc);
	};

	function iceCallback1(event) {
	  trace('local ice callback');
	  if (event.candidate) {
	    //pc2.addIceCandidate(event.candidate);
	    jsonData.desc = false;
	    jsonData.ice = event.candidate;
	    app.modules.node.sendRtcData(sendto_userid, jsonData);
	    trace('Local ICE candidate: \n' + event.candidate.candidate);
	  }
	};

	function iceCallback2(event) {
	  trace('remote ice callback');
	  if (event.candidate) {
	    pc1.addIceCandidate(event.candidate);
	    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
	  }
	};

	function receiveChannelCallback(event) {
	  trace('Receive Channel Callback');
	  receiveChannel = event.channel;
	  receiveChannel.onmessage = onReceiveMessageCallback;
	  receiveChannel.onopen = onReceiveChannelStateChange;
	  receiveChannel.onclose = onReceiveChannelStateChange;
	};

	function onReceiveMessageCallback(event) {
	  trace('Received Message: '+event.data);
	  //document.getElementById("dataChannelReceive").value = event.data;
	};

	function onSendChannelStateChange() {
	  var readyState = sendChannel.readyState;
	  trace('Send channel state is: ' + readyState);
	  if (readyState == "open") {
	    dataChannelSend.disabled = false;
	    dataChannelSend.focus();
	    dataChannelSend.placeholder = "";
	    sendButton.disabled = false;
	    closeButton.disabled = false;
	  } else {
	    dataChannelSend.disabled = true;
	    sendButton.disabled = true;
	    closeButton.disabled = true;
	  }
	};

	function onReceiveChannelStateChange() {
	  var readyState = receiveChannel.readyState;
	  trace('Receive channel state is: ' + readyState);
	};



	return {
		init: createConnection,
		close: closeDataChannels,
		setRemoteData: setRemoteData,
		addCandidate: addCandidate1,
		sendData: sendData,
		setRtcMsg: setRtcMsg
	};
	
})();