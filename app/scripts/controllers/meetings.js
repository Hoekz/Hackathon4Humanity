app.controller('meetings', ["$scope", 'memory', function($scope, memory){

	$scope.isAdding = false;
	$scope.title = "Meetings";
	$scope.newMeetingName = "";
	$scope.locationTypes = [{name: "school", googleId:"schoolio", approved: false},
							{name: "park", googleId:"parkio", approved: false},
							{name: "food", googleId:"foodio", approved: false}];

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