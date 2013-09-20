var app = {
	modules:{},
	views:{},
	init: function(){
		app.modules.node.init('http://localhost:5337');
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
		app.modules.p2p.init(userid, true);
	}
};