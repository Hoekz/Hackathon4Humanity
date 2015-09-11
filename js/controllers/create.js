app.controller('create', ['$scope', 'group', 'memory', 'map', '$location', function($scope, group, memory, map, $location){

    var createGroup = function(){
        group.createGroup({
            name: memory.name,
            lat: map.location.lat,
            lng: map.location.lng
        }, function(key){
            $location.path('/group/' + key);
        });
    };

    $scope.create = function(){
        map.requestLocation(function(loc){
            map.createMap();
            map.addPerson(memory.name, loc.lat, loc.lng, true);
            map.centerMap();
            if(group.ready(createGroup)){
                createGroup();
            }
        });
    };

    if(memory.name){
        $scope.create();
    }else{
        memory.name = prompt('name', 'James Hoekzema');
        $scope.create();
    }
}]);