app.controller('meetings', ["$scope", 'memory', function($scope, memory){
	console.log("Loaded Meetings Controller");
	$scope.isAdding = false;
}]);