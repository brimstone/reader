// Modelled after http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
module.exports = function(server, Feeds) {
// CRUD for Feeds

// CREATE
// New Feed
server.post("/feeds", function(req, res, next){
	if (!req.body.url) {
		res.send(200, "No url in post data");
		return next();
	}
	var feed = new Feeds();
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
	Feeds.all(function(err, feeds){
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
	Feeds.find(req.params.id, function(err, feed){
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

}
