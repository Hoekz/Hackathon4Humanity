app.factory('group', ['$firebaseObject', '$routeParams', '$interval', function($firebaseObject, $routeParams, $interval){
    var self = this;
    var id = $routeParams.id || null;
    var url = "https://centerofus.firebaseio.com/";
    var ref = new Firebase(url);
    var root = $firebaseObject(ref);
    var group = null;

    root.$loaded().then(function(){
        if(id && id in root){
            group = root[id];
        }
    });

    var generateKey = function(){
        var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var key = "";
        for(var i = 0; i < 8; i++){
            key += str[Math.floor(Math.random() * str.length)];
        }
        return key;
    };

    self.createGroup = function(creator, success){
        var key = generateKey();
        while(key in root) key = generateKey();
        root[key] = {
            timestamp: (new Date()).getTime(),
            members: {},
            options: {
                radius: 5,
                type: 'all'
            },
            chat: []
        };
        root[key].members[creator.name] = {
            lat: creator.lat || null,
            lng: creator.lng || null,
            lastSeen: (new Date()).getTime(),
            creator: true
        };
        root.$save().then(function(){
            group = root[key];
            if(success) success(key);
        });
        return key;
    };

    self.joinGroup = function(person, success){
        if(id in root){
            group = root[id];
            group.members.push({
                name: person.name,
                lat: person.lat || null,
                lng: person.lng || null,
                lastSeen: (new Date()).getTime(),
                creator: false
            });
            root.$save().then(function(){
                if(success) success();
            });
        }
    };

    self.leaveGroup = function(person, success){
        if(group){
            delete group.members[person];
        }
        root.$save().then(function(){
            if(success) success();
        });
    };

    $interval(function(){
        id = $routeParams.id || null;
    }, 50);
    
    return self;
}]);