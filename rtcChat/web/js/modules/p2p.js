app.modules.rtcCon = (function(){

	var con = {};//{ user_11:{caller: rtcCamOffer, callee: rtcCamAnswer} }

	function init(){

	};

	function addOffer(userid){
		con[userid].caller = new app.modules.rtcCam();
		con[userid].caller.init(userid, true);
	};

	function remoteResponse(data){
		con[userid].callee = new app.modules.rtcCam();
		con[userid].callee.init(userid, false);
	};

	return {
		add: addOffer
	};

})();