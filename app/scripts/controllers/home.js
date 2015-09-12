app.controller('home', ["$scope", 'memory', function($scope, memory){
    $scope.message = "This is home";
    memory.$.erase();
}]);