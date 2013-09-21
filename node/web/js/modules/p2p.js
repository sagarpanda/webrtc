app.modules.p2p = (function(){

	performance.now = performance.now || performance.webkitNow;

	var pc1 = null;
	var sendChannel, receiveChannel;
	
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
		if (isCaller) {
			try {
				// You need to start chrome with  --enable-data-channels flag.
				sendChannel = pc1.createDataChannel("sendDataChannel", {reliable: false});
				trace('Created send data channel');
			} catch (e) {
				alert('Failed to create data channel. ' + 'You need Chrome M25 or later with --enable-data-channels flag');
				trace('Create Data channel failed with exception: ' + e.message);
			}
			sendChannel.onopen = onSendChannelStateChange;
			sendChannel.onclose = onSendChannelStateChange;
		}else{
			pc1.ondatachannel = receiveChannelCallback;
		};
		pc1.onicecandidate = iceCallback1;

		if (isCaller) {
			pc1.createOffer(gotDescription1);
		}else{
			pc1.setRemoteDescription(new RTCSessionDescription(remoteData.desc));
			pc1.createAnswer(gotDescription1);
		};
	};

	function sendData(msg) {
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
	  pc1 = null;
	  trace('Closed peer connections');
	};

	function gotDescription1(desc) {
	  pc1.setLocalDescription(desc);
	  trace(desc.type+' from pc1');
	  jsonData.desc = desc;
	  app.modules.node.sendRtcData(sendto_userid, jsonData);
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
			remoteData = data;
			createConnection(data.from, false);
			return false;
		}

		if (data.desc) {
			pc1.setRemoteDescription(new RTCSessionDescription(data.desc));
		}else{
			pc1.addIceCandidate(new RTCIceCandidate(data.ice));
		};
	};

	function iceCallback1(event) {
	  trace('local ice callback');
	  if (event.candidate) {
	    jsonData.desc = false;
	    jsonData.ice = event.candidate;
	    app.modules.node.sendRtcData(sendto_userid, jsonData);
	    //trace('Local ICE candidate: \n' + event.candidate.candidate);
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
	};

	function onSendChannelStateChange() {
	  var readyState = sendChannel.readyState;
	  trace('Send channel state is: ' + readyState);
	  /*if (readyState == "open") {
	  } else {
	  }*/
	};

	function onReceiveChannelStateChange() {
	  var readyState = receiveChannel.readyState;
	  trace('Receive channel state is: ' + readyState);
	};



	return {
		init: createConnection,
		close: closeDataChannels,
		sendData: sendData,
		setRtcMsg: setRtcMsg
	};
	
})();