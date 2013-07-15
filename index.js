var restify = require('restify'),
	connect = require('connect'),
	FeedParser = require('feedparser'),
	request = require('request');



var Schema = require('jugglingdb').Schema;
var schema = new Schema('mysql', {
	database: 'reader',
	username: 'root'
});

// TODO do some sort of db sanity checking

var Feed = schema.define('Feeds', {
	id:				{ type: Number },
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	last_checked:	{ type: Date,		default: Date.now },
	added:			{ type: Date,		default: Date.now },
});
var Item = schema.define('Items', {
	id:				{ type: Number },
	feed_id:		{ type: Number },
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	author:			{ type: String, length: 255 },
	added:			{ type: Date,		default: Date.now },
});

Item.belongsTo(Feed, {foreignKey: 'feed_id'});

// taken from http://jugglingdb.co/schema.3.html
schema.isActual(function(err, actual) {
	if (!actual) {
		schema.autoupdate();
	}
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

// CRUD for Feeds

// CREATE
// New Feed
server.put("/feeds", function(req, res, next){
	if (!req.body.url) {
		res.send(200, "No url in post data");
		return next();
	}
	var feed = new Feed();
	feed.link = req.body.url;
	feed.save(function(err){
		if (!err) {
			res.send(200, "success");
		}
		else {
			res.send(500, err);
		}
	});
});

// READ
// Returns a list of feeds
server.get("/feeds", function(req, res, next){
	Feed.all(function(err, feeds){
		res.send(200, feeds);
		return next();
	});
});

// Returns information about a single feed
server.get("/feeds/:feed", function(req, res, next){
	res.send(200, [{feed: req.params.feed}]);
	return next();
});

// UPDATE
// TODO the feed checker should call this and update the title of the feed as well as the last_checked item

// DELETE
server.del("/feeds/:id", function(req, res, next){
	// make sure we have an id
	if (!req.params.id) {
		res.send(500, "ID of feed required");
		return next();
	}
	// find the feed
	Feed.find(req.params.id, function(err, feed){
		if (err) {
			res.send(500, err);
			return next();
		}
		// delete the feed
		feed.destroy(function(err) {
			if (err) {
				res.send(500, err);
				return next();
			}
			res.send("deleted");
			return next();
		});
	});
});

// CRUD for Items
// TODO CREATE
// TODO READ
// TODO UPDATE
// TODO DELETE

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

function update_feeds() {
	// get all feeds
	Feed.all(function(err, feeds){
		// loop through all of them
		for(var feed in feeds) {
			// reach out and grab the feed
			request(feeds[feed].link)
			.pipe(new FeedParser())
			// when we get the meta information about the feed
			.on('meta', function (meta) {
				// check to see if we have a title for our feed
				if (feeds[feed].title == null) {
					// save it if we didn't
					feeds[feed].title = meta.title;
					feeds[feed].save(function(err){
						// TODO handle failure to update
						console.log("Updating Feed with title");
					});
				}
			})
			// this event is each article we find
			.on('readable', function() {
				var stream = this, item;
				while (item = stream.read()) {
					console.log('Got article:', item.guid, item.title, item.link, item.author, item.pubdate);
					// TODO add item to database
					// TODO handle failures to add items
				}
			});
		}
	});
};

setInterval(update_feeds, 60000);
