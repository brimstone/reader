angular.module( 'ReaderApp', [ 'ngResource' ] )


angular.module('ReaderApp').controller('FeedCtlr', function($scope, $resource) {
	var Feeds = $resource('/api/feeds/:action');
	$scope.feeds = Feeds.query({}, function(data) {
	}, function(err){
		console.log(err);
	});
});
