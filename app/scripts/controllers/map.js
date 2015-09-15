app.controller('map', ['$scope', 'group', 'map', 'memory', function($scope, group, map, memory){

    //display link to be sent to group members
    //have menu to access settings (voting, distance, boolean to factor in location)
    //have chat area
    //for creator: have button to find a new location / accept a location
    //for after location chosen, either show directions on map, or offer to open directions in app/google

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
        });
        map.listen();
    };

    map.requestLocation(function(){
        map.createMap();
        if(group.ready(setup)){
            setup();
        }
    });
}]);