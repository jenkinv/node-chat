var sio = require('socket.io'),io;
var redis = require('redis'),
    client= redis.createClient();
var users = ['jenkinv', 'flora'];
var cache = [];//msg cached
var cacheUsers = [];//login users cached
var COUNT = 100;//max msg count
//init socket.io 
exports.init = function(app){
	io = sio.listen(app);
	io.sockets.on('connection', function(socket) {

		socket.on('msg', function(data) {
            if(!socket.name) return;
            var item = {type: 'msg', name: socket.name, msg: data, time: new Date().getTime()};
            append(item)
			io.sockets.emit('msg', item);//send msg to everyone connected except socket created current connection
		});

		socket.on('join', function(name, fn) {
            if(users.indexOf(name) == -1 /*|| cacheUsers.indexOf(name) != -1*/) return;
            if(cacheUsers.indexOf(name) == -1) {
                cacheUsers.unshift(name);
            }
            
            socket.name = name;
            var item = {type: 'join', name: name, time: new Date().getTime()};
            socket.emit('history', cache);//send history data when user join
            append(item);
			if(fn instanceof Function) fn(name);
            client.get('note.' + name, function(err, _note){
                socket.emit('noteUpdate', _note);
            });
            io.sockets.emit('join', {item: item, onlines: cacheUsers}); //send msg to everyone connected
		});
        
        //disconnect
        socket.on('disconnect', function() {
            var name = socket.name;
            var onlineIndex = cacheUsers.indexOf(name);
            if(!name || users.indexOf(name) == -1 || onlineIndex == -1) return;
            cacheUsers.splice(onlineIndex, 1);
            var item = {type: 'leave', name: name, time: new Date().getTime()};
            append(item);
            io.sockets.emit('leave', {item: item, onlines: cacheUsers});
        });
        socket.on('noteUpdate', function(note) {
            var _eachSocket;
            if(!socket.name) return;
            client.set('note.' + socket.name, note);
            for(_socketName in io.sockets.sockets) {
                var _socket = io.sockets.sockets[_socketName];
                if(socket.name == _socket.name) _socket.emit('noteUpdate', note);
            }
        });
	});
    
};

function append(item) {
    cache.push(item);
    if(cache.length > COUNT) {
        cache.shift();
    }
}

client.get('p', redis.print);

for(var i = 0; i < 100; users.push('test' + (++i)));
