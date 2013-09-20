app.modules.node = (function(){
	var socket;
	var myInfo;
	var users;
	var addListener = function(){
	    socket.on('connect', function(){
	    	console.log(arguments);
			//var n = prompt("What's your name?");
			var n = "Sagar"+parseInt(Math.random()*100);
			socket.emit('adduser', n);
			$('.curr_user').html(n);
	    });

	    socket.on('task', taskHandler);
	    socket.on('rtc', rtcHandler);
	    socket.on('rtcmsg', rtcMsgHandler);
	};
	var init = function(servUrl){console.log(servUrl);
		socket = io.connect(servUrl);
		addListener();
	};
	var taskHandler = function(action, data){
		switch(action){

			case 'initInfo':
				console.log('initInfo');
				console.log(data);
				myInfo = data.myInfo;
				users = data.users;
				delete users[myInfo.users];
				app.views.userlist.render(users);
				break;

			case 'adduser':
				console.log('adduser');
				if(myInfo.users != data.users){
					users[data.users] = data;
					app.views.userlist.add(data);
				};
				break;

			case 'deluser':
				console.log('deluser')
				delete users[data.users];
				app.views.userlist.remove(data);
				break;

			case 'onboard':
				console.log('onboard msg: '+ data.msg);
				app.views.onboardmsg.add(data.msg);
				break;

			case 'msg':
				//console.log('from: '+data.from+' - msg: '+ data.msg);
				if(myInfo.users == data.from)
					app.views.onboardmsg.add(myInfo.name+": "+data.msg);
				else
					app.views.onboardmsg.add(users[data.from].name+": "+data.msg);
				break;
		};
	};
	var rtcHandler = function(action, data){
		switch(action){

			case 'remoteinfo':
				console.log('node.js: remoteinfo');
				app.modules.p2p.setRemoteData(data);
				break;

			case 'icecandidate':
				console.log('node.js: icecandidate')
				app.modules.p2p.addCandidate(data);
				break;
		};
	};
	var rtcMsgHandler = function(data){
		app.modules.p2p.setRtcMsg(data);
	};
	var sendTo = function(userid, data){
		data.from = myInfo.userid;
		socket.emit('task', 'sendto', {"to":userid, "data": data});
	};
	var sendToAll = function(data){
		data.from = myInfo.users;
		socket.emit('task', 'sendtoall', data);
	};
	//var sendRtcData = function(userid, infoType, data){//infoType: offerInfo/answerInfo
		//socket.emit('rtc', infoType, {"to":userid, "data": data});
	//};
	var sendRtcData = function(userid, data){//infoType: offerInfo/answerInfo
		socket.emit('rtcmsg', data);
	};

	return {
		init: init,
		sendTo: sendTo,
		send: sendToAll,
		sendRtcData: sendRtcData
	};

})();