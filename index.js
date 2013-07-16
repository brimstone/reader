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

var Feeds = schema.define('Feeds', {
	id:				{ type: Number },
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	last_checked:	{ type: Date,		default: Date.now },
	added:			{ type: Date,		default: Date.now },
});
var Items = schema.define('Items', {
	id:				{ type: Number },
	feed_id:		{ type: Number },
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	author:			{ type: String, length: 255 },
	added:			{ type: Date,		default: Date.now },
});

Item.belongsTo(Feeds, {foreignKey: 'feed_id'});

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

require("./routes/feeds")(server, Feeds);
require("./routes/items")(server, Feeds, Items);

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
	Feeds.all(function(err, feeds){
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
