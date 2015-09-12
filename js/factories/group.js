app.factory('group', ['$firebaseObject', '$routeParams', '$interval', function($firebaseObject, $routeParams, $interval){
    var self = this;
    var id = $routeParams.id || null;
    var url = "https://centerofus.firebaseio.com/";
    var ref = new Firebase(url);
    var root = $firebaseObject(ref);
    var group = null;
    var userRef = null;
    var ready = false;
    var onReady = function(){};

    self.ready = function(listener){
        if(listener) onReady = listener;
        return ready;
    };

    root.$loaded().then(function(){
        console.log('Model Ready');
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

    self.createGroup = function(creator, success){
        if(!ready) return null;
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
            lat: creator.lat,
            lng: creator.lng,
            online: true,
            creator: true
        };
        userRef = new Firebase(url + id + '/members/' + creator.name + '/online');
        userRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
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
                creator: group.members[person.name].creator || false
            };
            root.$save().then(function(){
                if(success) success();
            });
            return true;
        }
        return false;
    };

    self.online = function(person){
        userRef = new Firebase(url + id + '/members/' + person + '/online');
        userRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        userRef.set(true);
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

    self.onNewMember = function(listener){
        root.$watch(function(){
            group = root[id];
            self.members = group.members;
            listener();
        });
    };

    $interval(function(){
        id = $routeParams.id || null;
    }, 50);

    return self;
}]);