app.factory('group', ['$firebaseObject', '$routeParams', '$interval', '$location', function($firebaseObject, $routeParams, $interval, $location){
    var self = this;
    var id = $routeParams.id || null;
    var url = "https://centerofus.firebaseio.com/groups/";
    var ref = new Firebase(url);
    var root = $firebaseObject(ref);
    var group = null;
    var userRef = null;
    var ready = false;
    var final = false;
    var onReady = function(){console.log("Ready Function not specified yet");};

    self.members = [];

    self.ready = function(listener){
        if(listener) onReady = listener;
        return ready;
    };

    root.$loaded().then(function(){
        ready = true;
        if(id && id in root){
            group = root[id];
            self.members = group.members;
        }
        onReady();
    });

    var generateKey = function(){
        var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var key = "";
        for(var i = 0; i < 8; i++){
            key += str[Math.floor(Math.random() * str.length)];
        }
        return key;
    };

    self.createGroup = function(creator, groupName, selections, success){
        if(!ready) return null;
        var key = generateKey();
        while(key in root) key = generateKey();
        root[key] = {
            timestamp: (new Date()).getTime(),
            members: {},
            name: groupName || "Group " + key,
            options: {
                radius: 5,
                types: {}
            }
        };
        root[key].members[creator.name] = {
            lat: creator.lat,
            lng: creator.lng,
            online: true,
            creator: true,
            ignore: false
        };
        for(var i = 0; i < selections.length; i++){
            root[key].options.types[selections[i]] = 1;
        }
        root.$save().then(function(){
            group = root[key];
            self.members = group.members;
            if(success) success(key);
        });
        return key;
    };

    self.updateVotes = function(type, state){
        root[id].options.types[type] += state ? 1 : -1;
        root.$save();
    };

    self.joinGroup = function(person, success){
        id = $routeParams.id;
        if(!ready) return false;
        if(id in root){
            group = root[id];
            if(!group.members[person.name] && final) return false;//don't let people join closed groups
            group.members[person.name] = {
                lat: person.lat,
                lng: person.lng,
                creator: group.members[person.name] ? group.members[person.name].creator : false,
                online: true,
                ignore: group.members[person.name] ? group.members[person.name].ignore : false
            };
            root.$save().then(function(){
                if(success) success();
            });
            return true;
        }
        return false;
    };

    self.online = function(person){
        //only allow valid groups and only allow a timestamp be set when not logged in
        id = $routeParams.id || null;
        if(id && (id in root)){
            userRef = new Firebase(url + id + '/members/' + person + '/online');
            userRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
            userRef.on('value', function(val){
                if(val !== true && id) userRef.set(true);
            });
            userRef.set(true);
        }else{
            $location.path('/');
        }
    };

    self.toggleIgnore = function(person){
        group.members[person].ignore = !group.members[person].ignore;
        group.$save();
    };

    self.updateRadius = function(r){
        root[id].options.radius = r;
        root.$save();
    };

    self.leaveGroup = function(person, success){
        if(!ready) return null;
        if(group){
            delete group.members[person];
        }
        root.$save().then(function(){
            if(success) success();
        });
    };

    self.onUpdate = function(listener){
        id = $routeParams.id || null;
        if(id){
            var delay = 0;
            var groupRef = new Firebase(url + id);
            var groupWatch = $firebaseObject(groupRef);
            groupWatch.$watch(function(){
                if(group){
                    group = groupWatch;
                    self.closed = group.closed;
                    self.name = group.name;
                    self.members = group.members;
                    self.options = group.options;
                    self.location = group.location;
                    self.timestamp = group.timestamp;
                    final = !!group.location;
                    clearTimeout(delay);
                    delay = setTimeout(listener, 500);
                }
            });
        }
    };

    self.finalized = function(){
        return final;
    };

    self.id = function(){
        return id;
    };

    self.finalLocation = function(floc){
        console.log(floc);
        root[id].location = {
            lat: floc.geometry.location.H,
            lng: floc.geometry.location.L,
            name: floc.name
        };
        root[id].closed = true;
        root.$save();
    };

    $interval(function(){
        id = $routeParams.id || null;
    }, 50);

    return self;
}]);