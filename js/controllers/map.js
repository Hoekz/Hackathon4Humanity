app.controller('map', ['$scope', 'group', 'map', 'memory', function($scope, group, map, memory){

    $scope.updateMap = function(){
        map.useGroup(group.members);
    };

    var setup = function(){
        if(!(memory.name in group.members)){
            group.joinGroup({
                name: memory.name || prompt('name', ''),
                lat: map.location.lat,
                lng: map.location.lng
            }, $scope.updateMap);
        }else{
            $scope.updateMap();
        }
        group.onNewMember($scope.updateMap);
    };

    map.requestLocation(function(){
        map.createMap();
        if(group.ready(setup)){
            setup();
        }
    });
}]);