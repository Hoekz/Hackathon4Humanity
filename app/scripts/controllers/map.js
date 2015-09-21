app.controller('map', ['$scope', 'group', 'map', 'memory', '$location', function($scope, group, map, memory, $location){
    //display link to be sent to group members
    //have menu to access settings (voting, distance, boolean to factor in location)
    //have chat area
    //for creator: have button to find a new location / accept a location
    //for after location chosen, either show directions on map, or offer to open directions in app/google
    var objsize = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    $scope.name = memory.name;
    $scope.link = location.href;
    $scope.results = [];

    $scope.updateList = function(){
        $scope.meetingName = group.name;
        $scope.members = [];
        for(var person in group.members){
            $scope.members.push(group.members[person]);
            $scope.members[$scope.members.length - 1].name = person;
        }
        $scope.radius = group.options.radius;
        $scope.types = [];
        if(memory.groups[group.id()]){
            for (var type in group.options.types) {
                $scope.types.push({
                    name: capIt(type.replace(/_/g, " ")),
                    type: type,
                    value: memory.groups[group.id()].votes[type]
                });
            }
        }
        if($scope.isCreator && !group.finalized()) $scope.search();
        if(group.finalized()) map.finalLocation();
    };

    group.onUpdate($scope.updateList);

    group.members = [];
    if(!memory.groups){
        memory.groups = {};
    }
    if(memory.groups[group.id()]){
        $scope.isCreator = memory.groups[group.id()].creator;
    }else{
        $scope.isCreator = false;
    }
    $scope.showingSharing = false;
    $scope.showingSettings = false;

    $scope.expand = function(id) {
        document.querySelector("#" + id).classList.toggle("expand");
    };

    $scope.toggleIgnore = function(name){
        if(group.finalized()) return null;
        if($scope.isCreator && name){
            group.toggleIgnore(name);
        }else{
            group.toggleIgnore(memory.name);
        }
    };

    $scope.search = function(){
        map.search(function(results){
            map.setLocations(results);
            $scope.results = results;
        });
    };

    var setup = function(){
        if(!memory.name) {
            memory.name = prompt('name', '');//don't use prompt, but doe need to check
            $scope.name = memory.name;
        }
        var joined = group.joinGroup({
            name: memory.name,
            lat: map.location.lat,
            lng: map.location.lng
        }, function(){
            group.online(memory.name);
            memory.groups[group.id().toString()] = {
                name: group.name,
                date: group.timestamp,
                members: objsize(group.members),
                creator: group.members[memory.name].creator,
                votes: memory.groups[group.id()] ? memory.groups[group.id()].votes : {}
            };
            console.log(group.members);
            for(var type in group.options.types){
                if(!(type in memory.groups[group.id()].votes)){
                    group.options.types[type]++;
                    memory.groups[group.id()].votes[type] = true;
                }
            }
            $scope.updateList();
            $scope.isCreator = group.members[memory.name].creator;
        });
        if(!joined){
            $location.path('/');
        }
        map.listen();
    };

    map.requestLocation(function(){
        map.createMap();
        if(group.ready(setup)){
            setup();
        }
    });

    $scope.choose = function(id){
        if(group.finalized()) return null;
        for(var i = 0; i < $scope.results.length; i++){
            if($scope.results[i].id == id){
                group.finalLocation($scope.results[i]);
                return null;
            }
        }
    };

    map.onChoose($scope.choose);

    $scope.showGroup = false;
    $scope.members = [];

    $scope.toggleVote = function(i, type){
        if(group.finalized()) return null;
        $scope.types[i].value = !$scope.types[i].value;
        group.updateVotes(type, $scope.types[i].value);
        memory.groups[group.id()].votes[type] = $scope.types[i].value;
    };

    var mapView = document.querySelector('#map-view');
    if(!mapView.hasChildNodes()){
        map.createMap();
    }
}]);

function capIt(str){return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}