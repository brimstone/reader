// Modelled after http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
module.exports = function(server, Feeds, Items) {
// CRUD for Feeds

// CREATE
// New Item
server.put("/items", function(req, res, next){
	res.send(200, "stub");
	return next();
});

// READ
// Returns a list of items
server.get("/items", function(req, res, next){
	console.log(req.query);
	res.send(200, "stub");
	return next();
});

// Returns information about a single feed
server.get("/items/:item", function(req, res, next){
	res.send(200, "stub");
	return next();
});

// UPDATE
// TODO the feed checker should call this and update the title of the feed as well as the last_checked item
server.put("/items/:id", function(req, res, next){
	// make sure we have an id
	if (!req.params.id) {
		res.send(500, "ID of feed required");
		return next();
	}
	res.send(200, "stub");
	return next();
});

// DELETE
server.del("/items/:id", function(req, res, next){
	// make sure we have an id
	if (!req.params.id) {
		res.send(500, "ID of feed required");
		return next();
	}
	res.send(200, "stub");
	return next();
});

}
