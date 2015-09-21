app.controller('meetings', ["$scope", 'memory', 'categories', 'group', 'map', '$location', function($scope, memory, categories, group, map, $location){

	$scope.isAdding = false;
	$scope.title = "Meetings";
	$scope.newMeetingName = "";
	$scope.locationTypes = categories;

    $scope.meetings = [];
    for(var prop in memory.groups){
        $scope.meetings.push({
            id: prop,
            name: memory.groups[prop].name,
            creator: memory.groups[prop].creator
        });
    }
    $scope.name = memory.name;

	var error = function(str){
		alert(str);
	};

	$scope.toggleAddPage = function() {
		$scope.name = memory.name;
		$scope.isAdding = !$scope.isAdding;
		resetAddPage();
		if($scope.isAdding) {
			$scope.title = "New";
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

	$scope.genUrl = function(){
		if(!$scope.name){
			return error("We need your name to distinguish who's who in the group.");
		}
		for(var i = 0; i < categories.length; i++){
			if(categories[i].approved){
				return map.requestLocation(createGroup);
			}
		}
		return error("You have not selected any categories.");
	};

	var createGroup = function() {
		var types = [];
		for(var i = 0; i < categories.length; i++){
			var subtypes = categories[i].approved ? categories[i].googleId.split(', ') : [];
			types = types.concat(subtypes);
		}
		for(var i = 0; i < types.length; i++) types[i] = types[i].toLowerCase().replace(/ /g, '_');
		memory.name = $scope.name;
		group.createGroup({
			name: memory.name,
			lat: map.location.lat,
			lng: map.location.lng
		}, $scope.newMeetingName, types, function(key){
			if(!memory.groups){
				memory.groups = {};
			}
			memory.groups[key] = {
				name: $scope.newMeetingName || "Group " + key,
				creator: true,
				votes: {}
			};
			for(var i = 0; i < types.length; i++){
                memory.groups[key].votes[types[i]] = true;
            }
			$location.path('/group/' + key);
		});
	};

	var resetAddPage = function() {
		$scope.newMeetingName = "";
		$scope.locationTypes = $scope.locationTypes.map(function(location) {
			location.approved = false;
			return location;
		});
	};
}]);