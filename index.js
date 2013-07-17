var connect = require('connect'),
	rest = require('connect-rest'),
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
	guid:			{ type: String, length: 255 }, // this needs to be a hash or something
	feed_id:		{ type: Number },
	title:			{ type: String, length: 255 },
	link:			{ type: Schema.Text },
	author:			{ type: String, length: 255 },
	added:			{ type: Date,		default: Date.now },
	text:			{ type: Schema.Text }
});

Items.belongsTo(Feeds, {foreignKey: 'feed_id'});

// taken from http://jugglingdb.co/schema.3.html
schema.isActual(function(err, actual) {
	if (!actual) {
		schema.autoupdate();
	}
});

var restoptions = {
	logger: { name: 'connect-rest', level: 'error' },
	context: '/api'
}

// Connect config here
var connectApp = connect()
	.use(connect.logger())
	.use(connect.bodyParser())
	.use(connect.query())
	.use(connect.cookieParser())
	.use(connect.static('static'))
	.use(rest.rester(restoptions))
	.listen(8080, function(){
		// this is for naught
		if (process.send) { process.send('online');}
	});

require("./routes/feeds")(rest, Feeds);
require("./routes/items")(rest, Feeds, Items);

// this is for naught
process.on('message', function(message) {
	if (message === 'shutdown') {
		process.exit(0);
	}
});

function update_feeds() {
	// get all feeds
	Feeds.all(function(err, feeds){
		// loop through all of them
		for(var feed_id in feeds) {
			feed=feeds[feed_id];
			// reach out and grab the feed
			console.log("Checking %s", feed.link);
			request(feed.link)
			.pipe(new FeedParser())
			// when we get the meta information about the feed
			.on('meta', function (meta) {
				// check to see if we have a title for our feed
				if (feed.title == null) {
					// save it if we didn't
					feed.title = meta.title;
					feed.save(function(err){
						// TODO handle failure to update
						console.log("Updating Feed with title");
					});
				}
			})
			// this event is each article we find
			.on('readable', function() {
				var stream = this, item;
				while (item = stream.read()) {
					// add item to database
					// this function is a closure, and is needed to pass item into the results of the database lookup
					(function(item) {
						Items.findOne({where: {guid: item.guid}}, function(err, res) {
							// if we already have the item, bail on this one
							if (res != null)
								return;
							console.log('Got article:', item);
							newitem = new Items();
							newitem.feed_id = feed.id;
							newitem.guid = item.guid;
							newitem.title = item.title;
							newitem.author = item.author;
							newitem.pubdate = item.pubdate;
							newitem.link = item.link;
							newitem.text = item.description;
							newitem.save(); // I don't think I care if this fails
						});
					})(item);
				}
			});
		}
	});
};
update_feeds();
//setInterval(update_feeds, 60000);
