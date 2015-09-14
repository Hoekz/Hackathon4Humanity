app.factory('group', ['$firebaseObject', '$routeParams', '$interval', '$location', function($firebaseObject, $routeParams, $interval, $location){
    var self = this;
    var id = $routeParams.id || null;
    var url = "https://centerofus.firebaseio.com/groups/";
    var ref = new Firebase(url);
    var root = $firebaseObject(ref);
    var group = null;
    var userRef = null;
    var ready = false;
    var delay = 0;
    var onReady = function(){};

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
            },
            chat: []
        };
        root[key].members[creator.name] = {
            lat: creator.lat,
            lng: creator.lng,
            online: true,
            creator: true
        };
        for(var i = 0; i < selections.length; i++){
            root[key].options.types[selections[i]] = 0;
        }
        root.$save().then(function(){
            group = root[key];
            self.members = group.members;
            if(success) success(key);
        });
        return key;
    };

    self.joinGroup = function(person, success){
        if(!ready) return null;
        if(id in root){
            group = root[id];
            group.members[person.name] = {
                lat: person.lat,
                lng: person.lng,
                creator: group.members[person.name] ? group.members[person.name].creator : false
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
                if(val !== true) userRef.set(true);
            });
            userRef.set(true);
        }else{
            $location.path('/');
        }
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
        if(group){
            var groupRef = new Firebase(url + id);
            var groupWatch = $firebaseObject(groupRef);
            groupWatch.$watch(function(){
                if(group){
                    group = root[id];
                    self.members = group.members;
                    clearTimeout(delay);
                    delay = setTimeout(listener, 500);
                }
            });
        }
    };

    $interval(function(){
        id = $routeParams.id || null;
    }, 50);

    return self;
}]);

//Usage:
//createGroup
//description: creates a new group object in Firebase with initial arguments
//creator: {name: "First Last", lat: 123.123, lng: 123.123},
//groupName: (optional, passing in empty string will generate a group name) "Lunch Group",
//selections: ['cafe', 'mosque', 'lawyer'] (selections that will be voted on)

//joinGroup
//description: adds a person to an existing group
//person: {name: "First Last", lat: 123.123, lng: 123.123}

//online
//description: sets user state to online and adds a listener for when you disconnect or when other devices disconnect
//person: "First Last"

//leaveGroup
//description: deletes a person from the current group
//person: "First Last"

//onUpdate
//description: adds a listener to group changes (new members, change in positions, etc.)
//listener: function(){/*do something because the group changed*/}