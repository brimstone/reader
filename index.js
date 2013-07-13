var restify = require('restify'),
	connect = require('connect');

// Restify server config here
var server = restify.createServer({
	name: 'restify-test',
	version: '1.0.0',
});

// Redirect /api to /
// This should probably go to /docs or something, for a proper api
server.get("/", function(req, res, next){
	res.header("Location", "/");
	res.send(302);
	return next();
});

// Modelled after http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
// CREATE

// READ

// TODO Returns a list of lists
server.get("/lists", function(req, res, next){
	res.send(200, [{list: "This is a list!"}]);
	return next();
});

// TODO Returns information about a single list

// TODO Returns list of items for a list

// TODO Returns information about an item

// UPDATE

// DELETE

// ...

// Connect config here
var connectApp = connect()
	.use(connect.logger())
	.use(connect.bodyParser())
	.use(connect.query())
	.use(connect.cookieParser())
	.use(connect.static('static'))
	// And this is where the magic happens
	.use("/api", function (req, res) {
		server.server.emit('request', req, res);
	});

connectApp.listen(8080, function(){
	if (process.send) { process.send('online');}
});

process.on('message', function(message) {
	if (message === 'shutdown') {
		process.exit(0);
	}
});
