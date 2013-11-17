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
	
	var progress = [];
	
	
	for (var i=0; i < results.length; i++) {
		results[i]['uts'] = (new Date()).getTime();
		results[i]['hts'] = new Date();


		var query = connection.query('INSERT INTO response SET ? ', results[i], function(err, result) {
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
	}
	
	socket.on('join', function(data){
		socket.join(data.room);
		socket['seat'] = data.seat;
		socket['room'] = data.room;		//used mostly to tell the room that you left
		io.sockets.in(data.room).emit('presenceChange', memberChange(data.room));
	});	
	
	socket.on('stateChange', function (data) {
		io.sockets.in(data.room).emit('stateChange', data.syncPayload);
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
	});
	
});
