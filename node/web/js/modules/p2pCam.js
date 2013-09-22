app.modules.p2pCam = (function(){

	var pc = null;
	var selfView = document.getElementById('selfView');
	var remoteView = document.getElementById('remoteView');
	var sendto = null;

	function start(sendto_userid, isCaller) {
		sendto = sendto_userid;
	    //pc = new RTCPeerConnection(configuration);
	    var servers = null;
	    pc = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});

	    // send any ice candidates to the other peer
	    pc.onicecandidate = function (evt) {
	        //signalingChannel.send(JSON.stringify({ "candidate": evt.candidate }));
	        app.modules.node.sendRtcData(sendto_userid, { "ice": evt.candidate });
	    };

	    // once remote stream arrives, show it in the remote video element
	    pc.onaddstream = function (evt) {
	        remoteView.src = URL.createObjectURL(evt.stream);
	    };

	    navigator.getUserMedia_ = (   navigator.getUserMedia
                           || navigator.webkitGetUserMedia 
                           || navigator.mozGetUserMedia 
                           || navigator.msGetUserMedia);

	    // get the local stream, show it in the local video element and send it
	    navigator.getUserMedia_({ "audio": true, "video": true }, function (stream) {
	        selfView.src = URL.createObjectURL(stream);
	        pc.addStream(stream);

	        if (isCaller)
	            pc.createOffer(gotDescription);
	        else
	            pc.createAnswer(pc.remoteDescription, gotDescription);

	        function gotDescription(desc) {
	            pc.setLocalDescription(desc);
	            //signalingChannel.send(JSON.stringify({ "sdp": desc }));
	            app.modules.node.sendRtcData(sendto_userid, { "desc": desc });
	        }
	    });
	};


	function setRtcMsg(data){
		if (!pc1) {
			//remoteData = data;
			start(data.from, false);
			//return false;
		}

		if (data.desc) {
			pc1.setRemoteDescription(new RTCSessionDescription(data.desc));
		}else{
			pc1.addIceCandidate(new RTCIceCandidate(data.ice));
		};
	};


	return {
		init: start,
		//close: closeDataChannels,
		//sendData: sendData,
		setRtcMsg: setRtcMsg
	};

})();