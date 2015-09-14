app.controller('create', ['$scope', 'group', 'memory', 'map', '$location', function($scope, group, memory, map, $location){

    //1) ask user name and preferences (prepopulated by localStorage if any, access through memory factor)
    //2) on button press, create new group (add second parameter that specifies preferences
    //3) redirect to url (already happening)

    var createGroup = function(){
        group.createGroup({
            name: memory.name,
            lat: map.location.lat,
            lng: map.location.lng
        }, "Group", ['cafe', 'cemetery'], function(key){
            $location.path('/group/' + key);
        });
    };

    $scope.create = function(){
        //makes sure you have a location
        map.requestLocation(function(){
            if(group.ready(createGroup)){
                createGroup();//if the firebase data is ready/run when ready, create the group
            }
        });
    };

    //don't do this anymore, force user to use interface
    if(memory.name){
        $scope.create();
    }else{
        memory.name = prompt('name', 'James Hoekzema');
        $scope.create();
    }
}]);