app.controller('map', ['$scope', 'group', 'map', 'memory', function($scope, group, map, memory){
    //display link to be sent to group members
    //have menu to access settings (voting, distance, boolean to factor in location)
    //have chat area
    //for creator: have button to find a new location / accept a location
    //for after location chosen, either show directions on map, or offer to open directions in app/google
    $scope.results = [];
    if(!memory.groups){
        memory.groups = {};
    }
    if(memory.groups[group.id()]){
        $scope.isCreator = memory.groups[group.id()].creator;
    }else{
        $scope.isCreator = false;
    }
    $scope.mode = 'map';

    $scope.toggleLocationMode = map.toggleLocationMode;

    $scope.toggleIgnore = function(name){
        if(group.members[memory.name].creator && name){
            group.toggleIgnore(name);
        }else{
            group.toggleIgnore(memory.name);
        }
    };

    $scope.search = function(){
        map.search(function(results){
            $scope.results = results;
        });
    };

    var setup = function(){
        if(!memory.name || !(memory.name in group.members)) {
            memory.name = prompt('name', '');//don't use prompt, but doe need to check
        }
        group.joinGroup({
            name: memory.name,
            lat: map.location.lat,
            lng: map.location.lng
        }, function(){
            group.online(memory.name);
            if(!memory.groups){
                memory.groups = [];
            }
            memory.groups[group.id()] = {
                name: group.name(),
                creator: group.members[memory.name].creator
            };
            $scope.updateList();
            $scope.isCreator = group.members[memory.name].creator;
        });
        map.listen();
    };

    map.requestLocation(function(){
        map.createMap();
        if(group.ready(setup)){
            setup();
        }
    });

    $scope.showGroup = false;
    $scope.members = [];

    $scope.updateList = function(){
        $scope.members = [];
        for(var person in group.members){
            $scope.members.push({
                name: person,
                online: group.members[person].online
            });
        }
    };

    $scope.showResult = map.setLocation;

    group.onUpdate($scope.updateList);
}]);