// Modelled after http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
module.exports = function(rest, Feeds) {
// CRUD for Feeds

// CREATE
// New Feed
rest.post("/feeds", function( req, content, callback ){
	if (!req.body.url) {
		// TODO what's an error?
		return callback(200, "No url in post data");
	}
	var feed = new Feeds();
	feed.link = req.body.url;
	feed.save(function(err){
		if (!err) {
			return callback(null, "success");
		}
		else {
			return callback(err);
		}
	});
});

// READ
// Returns a list of feeds
rest.get("/feeds", function( req, content, callback ){
	Feeds.all(function(err, feeds){
		callback(null, feeds);
	});
});

// UPDATE
// TODO the feed checker should call this and update the title of the feed as well as the last_checked item

// DELETE
rest.del("/feeds/:id", function( req, content, callback ){
	// make sure we have an id
	if (!req.params.id) {
		return callback("ID of feed required");
	}
	// find the feed
	Feeds.find(req.params.id, function(err, feed){
		if (err) {
			return callback(err);
		}
		// delete the feed
		feed.destroy(function(err) {
			if (err) {
				return callback(err);
			}
			return callback(null, "deleted");
		});
	});
});

}
