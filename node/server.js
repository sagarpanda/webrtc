var express = require('express');
var app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

server.listen(5337);

/*// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});*/

var usernames = {};
var count = 0;
var rooms = ['room1'];

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', function(username){
		count++;
		socket.userid = "user_"+count;
		socket.room = 'room1';
		usernames[socket.userid] = {"users":socket.userid, "name":username, "rtc":null};
		socket.join('room1');
		//socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		socket.emit('task', 'initInfo', {"users":usernames, "myInfo":usernames[socket.userid]});
		socket.broadcast.to('room1').emit('task', 'onboard', {"msg":username + " has connected to this board."});
	});
	
	socket.on('task', function (action, data) {
		switch(action){
			case 'sendto':
				break;
			case 'sendtoall':
				io.sockets.in(socket.room).emit('task', 'msg', data);
				break;
		};
	});
	
	socket.on('disconnect', function(){
		var name = usernames[socket.userid].name;
		delete usernames[socket.userid];
		//io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('task', 'onboard', name + ' has disconnected.');
		socket.leave(socket.room);
	});
});