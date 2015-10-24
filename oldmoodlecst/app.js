var express = require("express"),
	webserver = express(),
	socketServer = require('http').createServer(handler),
	io = require('socket.io').listen(socketServer),
	fs = require('fs'),
	mysql = require('mysql'),
	config = require('./appconfig');

//sockets
socketServer.listen(config.socketServerPort);
//express / html
webserver.listen(config.webServerPort);

//queue of waiting connections
var waiting = Array();

if (typeof config.timezoneEnvironment !== 'undefined'){
	process.env.TZ = config.timezoneEnvironment;
}

webserver.use(express.bodyParser());

//I don't honestly know why I need one of these..  TODO: look that up.
var handler = function(req, res){};

//ROUTING:  set up routes for the paths we want public.
webserver.get("/", function(req, res){
	res.render(__dirname + '/views/index.ejs', {
		layout:false,
		moodle: {sesskey: req.param('sesskey'), activityid: req.param('activityid'), socketport: config.socketServerPort, moodleurl: config.moodleUrl, userid: req.param('userid'), mode: req.param('mode'), seat: req.param('seat'), partnermode: req.param('partnermode')},
		locals: { cacheKey: '?t=' + (new Date()).getTime() }
	});
});
	
webserver.use('/config', express.static(__dirname + '/config'));
webserver.use('/content', express.static(__dirname + '/content'));
webserver.use('/static', express.static(__dirname + '/static'));

webserver.get("/time", function(req, res){
	res.writeHead(200, {
		'Cache-Control': 'no-cache, must-revalidate',
		'Content-type': 'application/json',
		'CSTServerTime': (new Date()).getTime()
	});
	res.end();
});

webserver.post("/submit", function(req, res){

	var connection = mysql.createConnection(config.mysqlConnectionOptions);

	connection.connect();
	
	var results = req.body.output;
	console.log(results);
	
	var progress = [];
	
	
	for (var i=0; i < results.length; i++) {
		results[i]['uts'] = (new Date()).getTime();
		results[i]['hts'] = new Date();


		var query = connection.query('INSERT INTO mdl_moodlecst_attemptitem SET ? ', results[i], function(err, result) {
			debugger;

			if (err) {
				progress.push({
					id: 0,
					success: false,
					error: err
				});
			}else{
				progress.push({
					id: result.insertId,
					success: true
				});
			}
			
			
			latchDone();
		});
	};
	
	var latchDone = function(){
		//do nothing, until all the callbacks have been called.
		if (results.length > progress.length){
			return
		}
		
		res.write(JSON.stringify({ 
			'status': 'success',
			'progress' : progress
			})); 

		connection.end();
		res.end();
		
	};
});


io.sockets.on('connection', function (socket) {
		
	var memberChange = function(room){
		mems = {};
		clients = io.sockets.clients(room);
		for (var i = clients.length - 1; i >= 0; i--){
			mems[clients[i].seat] = clients[i].id;
		};
		return mems;
	};
	
	socket.on('join', function(data){
		console.log(data);
	
		
		//If we have no queue start one
		if(typeof waiting[data.activity] == 'undefined'){
			waiting[data.activity]=Array();
			console.log('creating queue for activity:' + data.activity);
		}
		//if noone is on the queue, no point trying to find a partner
		//add to queue and leave
		if(waiting[data.activity].length==0){
			waiting[data.activity].push({socket: socket, data: data});
			console.log('pushed to queue start: ' + waiting[data.activity].length + 'waiting');
			return;
		}

		
		//depending on auto mode (any partner will do)
		// or manual mode (same room partner only)
		//scan queue for a partner, create a unique room, join it,and let everyone know
		//check for bad connections on the way
		
		//waiter is the partner who is waiting for us
		var waiter =false;
		//shouldn't ever get in an endless loop, but it would kill the server, so we add a firebreak
		var loopbuster=0; 
		while(waiter==false && waiting[data.activity].length>0 && loopbuster<1000){
			loopbuster++;
			switch (data.mode){
				//student to student doesn't care about teacher or student(yet)
				case 'studentstudent':
					//auto mode, any partner will do
					if(data.partnermode=='auto'){
							waiter = waiting[data.activity].shift();
					}else{
						//manual mode, check waiter has specified the same room
						for (var waiterindex=0;waiterindex<waiting[data.activity].length;waiterindex++){
							if(data.room==waiting[data.activity][waiterindex].data.room){
										waiter = waiting[data.activity][waiterindex];
										waiting[data.activity].splice(waiterindex, 1);
							}//end of same room check
						}//end of loop
					}
					break;
				//teacher student does care about who is a teacher from the outset
				case 'teacherstudent':
				default:
					for (var waiterindex=0;waiterindex<waiting[data.activity].length;waiterindex++){
						//if auto mode, or waiter has specified the same room, join
						if(data.partnermode=='auto' || 
							data.room==waiting[data.activity][waiterindex].data.room){
								if(waiting[data.activity][waiterindex].data.seat!=data.seat){
									waiter = waiting[data.activity][waiterindex];
									waiting[data.activity].splice(waiterindex, 1);
								}//end of seat check
						}//end of mode check
					}//end of loop
			}
			//if we have a bad connection, drop it and move on
			if(waiter && waiter.socket.disconnected){waiter=false;}
		}
		
		//couldn't find a partner, add self to queue and move on.
		if(waiter==false){
			waiting[data.activity].push({socket: socket, data: data});
			console.log('pushed to queue end: ' + waiting[data.activity].length + 'waiting');
			return;
		}
		
		//got a partner and popped them off teh queue
		//set up the room and other housekeeping
		console.log('popped');
		var socket2 = waiter.socket;
		var data2 = waiter.data;
		var roomname = Math.floor((Math.random() * 1000000) + 1);
		console.log('roomname:' + roomname);

		//if we are in student/student mode, allocate roles 
		//later they can choose, but we need a role to begin with
		if(data.mode.trim() == 'studentstudent'){
			if(data.seat.trim() == 'student'){
				data2.seat='teacher';
				data.seat='student';
			}else{
				data2.seat='student';
				data.seat='teacher';
			}
		}

		//join the rooms, and send out the notifications.
		socket.join(roomname);
		socket2.join(roomname);
		socket['seat'] = data.seat;
		socket2['seat'] = data2.seat;
		console.log('socket1seat:' + socket['seat']);
		console.log('socket2seat:' + socket2['seat']);
		
		socket.emit('joinedRoom', {room: roomname, seat: data.seat, partner: data2.user});
		socket2.emit('joinedRoom', {room: roomname, seat: data2.seat, partner: data.user});
		io.sockets.in(roomname).emit('presenceChange', memberChange(roomname));
	
	});	
	
	socket.on('stateChange', function (data) {
		io.sockets.in(data.room).emit('stateChange', data.syncPayload);
	});
	
	socket.on('newMessage', function (data) {
		console.log('emitting new message');
		io.sockets.in(data.room).emit('newMessage', data.messagePayload);
	});
	
	socket.on('reset', function (data){
		io.sockets.clients().forEach(function(s){
			if (s.seat == 'student' && s.room == socket.room){
				s.emit('reset');
			}
		});
	});

	socket.on('disconnect', function(data){
		
		if (typeof socket.room !== 'undefined'){
			socket.leave(socket.room);
			io.sockets.in(socket.room).emit('presenceChange', memberChange(socket.room));
			delete socket.room;
		}
		//lets also remove it from our list of waiting sockets, if its there
		for (var activity in waiting) {
			var waiterindex = waiting[activity].indexOf(socket);
			if(waiterindex){
				waiting[activity].splice(waiterindex, 1);
console.log('disconnected ok')
			}
		}
	});
	
});
