app.controller('meetings', ["$scope", 'memory', 'categories', function($scope, memory, categories){
	if(!memory.groups){
		memory.groups = [];
	}
	$scope.groups = memory.groups;
	$scope.isAdding = false;
	$scope.title = "Meetings";
	$scope.newMeetingName = "";
	$scope.locationTypes = categories;

	$scope.toggleAddPage = function() {
		$scope.isAdding = !$scope.isAdding;
		resetAddPage();
		if($scope.isAdding) {
			$scope.title = "Create New Meeting";
		}
		else {
			$scope.title = "Meetings";
		}
	};
	$scope.hideAddPage = function() {
		$scope.isAdding = !$scope.isAdding;
		resetAddPage();
		$scope.title = "Meetings";
	};
	$scope.genUrl = function() {
		$scope.toggleAddPage();
	};

	var resetAddPage = function() {
		$scope.newMeetingName = "";
		$scope.locationTypes = $scope.locationTypes.map(function(location) {
			location.approved = false;
			return location;
		});
	};
}]);