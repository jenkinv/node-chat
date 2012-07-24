//dependcy module
var express = require('express'),
	    app = express.createServer(),
	     io = require('./socket.io.js');

var PORT = 80;//http server port

io.init(app);

//config for all env
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
});

//config for development env
app.configure('development', function(){
	app.use(express.errorHandler({dumpExceptions:true, showStack: true}));
});

//config for production env
app.configure('production', function(){
	app.use(express.errorHandler());
});

//server router
app.get('/:id', function(req, res) {
	res.send('path : ' + req.params.id);
});

//server listen start
app.listen(PORT);
console.log('Express server listening on port %d in %s mode', PORT, app.settings.env);
