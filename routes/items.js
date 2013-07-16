// Modelled after http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
module.exports = function(rest, Feeds, Items) {
// CRUD for Feeds

// TODO CREATE
rest.put("/items", function(req, content, callback){
	return callback(null, "stub");
});

// READ
// Returns a list of items
rest.get("/items", function( req, content, callback ){
	// validate req.parameters.feed is only a number
	Items.all({where: {feed_id: req.parameters.feed}}, function(err, items) {
		callback(null, items);
	});
});

// TODO Returns information about a single item
rest.get("/items/:item", function(req, content, callback){
	return callback(null, "stub");
});

// TODO UPDATE
rest.put("/items/:id", function(req, content, callback){
	// make sure we have an id
	if (!req.params.id) {
		return callback(null, "ID of feed required");
	}
	return callback(null, "stub");
});

// TODO DELETE
rest.del("/items/:id", function(req, content, callback){
	// make sure we have an id
	if (!req.params.id) {
		return callback(null, "ID of feed required");
	}
	return callback(null, "stub");
});

}
