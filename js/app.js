var Reader_App = angular.module( 'Reader_App', [ 'ngResource' ] );

Reader_App.factory("Feed_Service", function($rootScope) {
		var Feed_Service = {};
		Feed_Service.current_feed = 0;
		Feed_Service.update_feed = function(feed) {
			this.current_feed = feed;
			$rootScope.$broadcast('updated_feed');
		}
		return Feed_Service;
});

function Feed_Ctlr($scope, $resource, Feed_Service) {
	var Feeds = $resource('/api/feeds/:action');
	$scope.feeds = Feeds.query({}, function(data) {
	}, function(err){
		console.log(err);
	});
	$scope.update_feed = function(feed) {
		Feed_Service.update_feed(feed);
	};
};

function Item_Ctlr($scope, $resource, Feed_Service) {
	$scope.items = [];
	$scope.$on('updated_feed', function(){
		console.log("We should go grab items based on", Feed_Service.current_feed);
	});
}

// I may not need this
// Feed_Ctlr.$inject = ['$scope', 'Feed_Service'];

