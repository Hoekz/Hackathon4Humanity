app.controller('map', ['$scope', 'group', 'map', 'memory', function($scope, group, map, memory){
    //display link to be sent to group members
    //have menu to access settings (voting, distance, boolean to factor in location)
    //have chat area
    //for creator: have button to find a new location / accept a location
    //for after location chosen, either show directions on map, or offer to open directions in app/google
    $scope.meetingName = "WhatisthisMeetingCalled???";
    $scope.link = location.href;
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
    $scope.showingSharing = true;
    $scope.showingSettings = false;

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
                memory.groups = {};
            }
            memory.groups[group.id()] = {
                name: group.name(),
                creator: group.members[memory.name].creator,
                votes: memory.groups[group.id()] ? memory.groups[group.id()].votes : {}
            };
            for(var type in group.options.types){
                if(!(type in memory.groups[group.id()].votes)){
                    group.options.types[type]++;
                    memory.groups[group.id()].votes[type] = true;
                }
            }
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
    $scope.members.push({name: "I changed Shite"});

    $scope.updateList = function(){
        memory.groupSubPage = $scope.mode;
        $scope.members = [];
        for(var person in group.members){
            $scope.members.push({
                name: person,
                online: group.members[person].online
            });
        }
        $scope.radius = group.options.radius;
        $scope.types = [];
        for(var type in group.options.types){
            $scope.types.push({
                name: capIt(type.replace(/_/g, " ")),
                type: type,
                value: memory.groups[group.id()].votes[type]
            });
        }
    };

    $scope.toggleVote = function(i, type){
        $scope.types[i].value = !$scope.types[i].value;
        group.updateVotes(type, $scope.types[i].value);
        memory.groups[group.id()].votes[type] = $scope.types[i].value;
    };

    $scope.showResult = function(result){
        $scope.mode = 'map';
        map.setLocation(result);
    };

    group.onUpdate($scope.updateList);
}]);

function capIt(str){return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}