var Reader_App = angular.module( 'Reader_App', [ 'ngResource' ] );

Reader_App.factory("Feed_Service", function($rootScope, $resource) {
	document.onkeyup = function(e) {
		var key = (window.event) ? event.keyCode : e.keyCode;
		//if (e.shiftKey && 65 <= key && key <= 90)
		//	key =+ 32;
		console.log(key);
	}
	// build our service object and return it
	return {
		current: {feed: 0, article: 0},
		// I wonder if there's a more... angular way of doing this setter
		select: function(key, value) {
			this.current[key] = value;
			$rootScope.$broadcast('updated_' + key);
		},
		Feeds: $resource('/api/feeds/:action'),
		Items: $resource('/api/items/:action'),
	};
});

function Feed_Ctlr($scope, Feed_Service) {
	$scope.feeds = Feed_Service.Feeds.query({}, function(data) {
	}, function(err){
		console.log(err);
	});
	$scope.select = function(feed) {
		Feed_Service.select('feed', feed);
	};
};

function List_Ctlr($scope, Feed_Service) {
	$scope.articles = Feed_Service.Items.query({feed: 1});
	$scope.$on('updated_feed', function(){
		feed = Feed_Service.current.feed;
		$scope.articles = Feed_Service.Items.query({feed: feed.id}, function(data){
			console.log($scope.articles);
		}, function(err) {
			console.log(err);
		});
	});
	$scope.select = function(article) {
		Feed_Service.select('article', article);
	};
}

function Article_Ctlr($scope, Feed_Service) {
	$scope.$on('updated_article', function(){
		$scope.article = Feed_Service.current.article;
	});
}

