app.controller('create', ['$scope', 'group', 'memory', function($scope, group, memory){
    $scope.name = memory.name;
}]);