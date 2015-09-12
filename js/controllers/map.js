app.controller('map', ['$scope', 'group', 'map', 'memory', function($scope, group, map, memory){

    $scope.updateMap = function(){
        map.useGroup(group.members);
    };

    var setup = function(){
        if(!memory.name || !(memory.name in group.members)){
            memory.name = prompt('name', '');
            group.joinGroup({
                name: memory.name,
                lat: map.location.lat,
                lng: map.location.lng
            }, function(){
                group.online(memory.name);
                $scope.updateMap();
            });
        }else{
            group.online(memory.name);
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