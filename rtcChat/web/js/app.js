var app = {
	modules:{},
	views:{},
	plugins:{},
	init: function(){
		app.modules.node.init('http://172.16.100.124:5337');
	},
	keyPress: function(e){
		if (!e) e = window.event;
		if (e.keyCode == 13){
			//console.log($('#user_text').val());
			app.modules.node.send({msg: $('#user_text').val()});
			$('#user_text').val('');
		}
		return false;
	},
	rtcCall: function(userid){
		console.log(userid);
		//app.modules.p2p.init(userid, true);
		app.modules.p2pCam.init(userid, true);
	}
};