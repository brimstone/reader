var restify = require('restify'),
	connect = require('connect');

var Schema = require('jugglingdb').Schema;
var schema = new Schema('mysql', {
	database: 'reader',
	username: 'root'
});

var Feed = schema.define('Feeds', {
	id:				{ type: Number},
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	lastchecked:	{ type: Date,		default: Date.now },
	added:			{ type: Number,		default: Date.now },
});

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

// New feed
server.post("/feeds/create", function(req, res, next){
	if (req.body.url) {
		var feed = new Feed;
		feed.link = req.body.url;
		feed.save(console.log);
		res.send(200, "success");
	}
	res.send(200, "No url in post data");
	return next();
});

// READ

// TODO Returns a list of feeds
server.get("/feeds", function(req, res, next){
	res.send(200, "poop");
	return next();
});

// TODO Returns information about a single feed
server.get("/feeds/:feed", function(req, res, next){
	res.send(200, [{feed: req.params.feed}]);
	return next();
});

// TODO Returns list of items for a feed

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
