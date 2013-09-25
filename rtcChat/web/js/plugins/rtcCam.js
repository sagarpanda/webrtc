app.plugins.rtcCam = (function(){

	var pc = null;
	var selfView = document.getElementById('selfView');
	var remoteView = document.getElementById('remoteView');
	var sendto = null;

	function start(sendto_userid, isCaller) {
		sendto = sendto_userid;
	    var servers = null;
	    pc = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});

	    pc.onicecandidate = function (evt) {
	        app.modules.node.sendRtcData(sendto, { "ice": evt.candidate });
	    };

	    pc.onaddstream = function (evt) {
	        remoteView.src = URL.createObjectURL(evt.stream);
	    };

	    navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

	    navigator.getUserMedia_({ "audio": true, "video": true }, function (stream) {
	        //selfView.src = URL.createObjectURL(stream);
	        pc.addStream(stream);

	        if (isCaller){
	            pc.createOffer(gotDescription);
	        }else{
	            pc.createAnswer(gotDescription);
	        }
	        function gotDescription(desc) {
	            pc.setLocalDescription(desc);
	            app.modules.node.sendRtcData(sendto, { "desc": desc });
	        }
	    });
	};


	function setRtcMsg(data){
		if (!pc) {
			start(data.from, false);
		}

		if (data.desc) {
			pc.setRemoteDescription(new RTCSessionDescription(data.desc));
		}else if(data.ice){
			pc.addIceCandidate(new RTCIceCandidate(data.ice));
		};
	};


	return {
		init: start,
		//close: closeDataChannels,
		//sendData: sendData,
		setRtcMsg: setRtcMsg
	};

});