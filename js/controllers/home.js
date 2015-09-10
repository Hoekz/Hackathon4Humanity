app.controller('home', ["$scope", "group", "map", function($scope, group, map){
    $scope.message = "This is home";
    group.ready(function(){
        group.createGroup({
            name: "James Hoekzema",
            lat: 123.123,
            lng: 123.123
        });
    });
}]);