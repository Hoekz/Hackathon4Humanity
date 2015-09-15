app.factory('map', ['group', function(group){
    var self = this;
    self.map = null;
    self.useCurrent = true;
    var people = {};

    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    var context = canvas.getContext('2d');
    var generateImageUrl = function(name){
        var str = name.toUpperCase().split(' ');
        if(str.length > 1){
            str = str[0].substr(0, 1) + str[1].substr(0, 1);
        }else{
            str = str[0];
        }
        context.clearRect(0, 0, 32, 48);
        context.fillStyle = randomColor({luminosity: 'dark'});
        context.beginPath();
        context.arc(16, 16, 16, 0, Math.PI, true);
        context.bezierCurveTo(0, 32, 16, 32, 16, 48);
        context.bezierCurveTo(16, 32, 32, 32, 32, 16);
        context.closePath();
        context.fill();
        context.font = "bold 18px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(str.substr(0, 2), 16, 16, 24);
        return canvas.toDataURL();
    };

    self.createMap = function(){
        if(!self.map){
            if(mapsReady){
                var domMap = document.getElementById("map-view");
                var settings = {
                    zoom: 18,
                    maxZoom: 18
                };
                if(self.location){
                    settings.center = self.location;
                }
                self.map = new google.maps.Map(domMap, settings);
            }else{
                setTimeout(self.createMap, 10);
            }
        }
    };

    self.centerMap = function(lat, lng){
        lat = lat || self.location.lat;
        lng = lng || self.location.lng;
        self.map.setCenter({lat: lat, lng: lng});
    };

    self.requestLocation = function(callback){
        if(!self.location && self.useCurrent){
            navigator.geolocation.getCurrentPosition(function(loc){
                self.location = {
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude
                };
                callback(self.location);
                navigator.geolocation.watchPosition(function(loc){
                    if(self.useCurrent){
                        self.location.lat = loc.coords.latitude;
                        self.location.lng = loc.coords.longitude;
                    }
                });
            }, function(err){
                //handle error. properties: code, message
                console.log(err);
            });
        }else{
            callback(self.location);
        }
    };

    var updatePeople = function(){
        var members = group.members;
        console.log(members);
        for(var person in members){
            if(members[person].online === true){
                if ((person in people)) {
                    people[person].setPosition({lat: members[person].lat, lng: members[person].lng});
                } else {
                    self.addPerson(person, members[person].lat, members[person].lng);
                }
            }
        }
        var bounds = new google.maps.LatLngBounds();
        for(var person in people){
            if(!(person in members) || members[person].online !== true){
                self.removePerson(person);
            }else{
                bounds.extend(people[person].getPosition());
            }
        }
        self.map.setCenter(bounds.getCenter());
        self.map.fitBounds(bounds);
    };

    self.search = function(callback){
        //for example of what to do with callback: https://developers.google.com/maps/documentation/javascript/examples/place-search
        var bounds = new google.maps.LatLngBounds();
        for(var person in group.members){
            var peep = group.members[person];
            if(!peep.ignore){
                bounds.extend(google.maps.LatLng(peep.lat, peep.lng));
            }
        }
        var search = {
            location: bounds.getCenter(),
            radius: 1619 * group.options.radius || 1619,
            types: []
        };

        for(var type in group.options.type) search.types.push(type);
        search.types.sort(function(a, b){return group.options.type[a] > group.options.type[b];});
        search.types.splice(3, search.types.length);

        var service = new google.maps.places.PlacesService(map);

        service.nearbySearch(search, callback);
    };

    self.addPerson = function(key, lat, lng){
        if(key in people){
            people[key].setPosition({lat: lat, lng: lng});
        }else{
            people[key] = new google.maps.Marker({
                position: {
                    lat: lat,
                    lng: lng
                },
                map: self.map,
                title: key,
                animation: google.maps.Animation.DROP
            });
            people[key].setIcon(generateImageUrl(key));
        }
    };

    self.removePerson = function(key){
        people[key].setMap(null);
        delete people[key];
    };

    self.movePerson = function(key, lat, lng){
        if(key in people){
            people[key].setPosition({lat: lat, lng: lng});
        }
    };

    self.listen = function(){
        group.onUpdate(updatePeople);
    };

    return self;
}]);

//Usage:
//createMap: ensures that map is inserted into DOM. should call requestLocation first so as to center map on self

//centerMap: center the map on a given lat and lng. if no arguments passed, centers on user

//requestLocation: initiates request for location and adds a watcher.  returns position to a callback

//listen: activate group listening

//addPerson: add a person to the map, used by useGroup and probably should stay that way
//removePerson: remove a person from the map, used by useGroup and probably should stay that way
//movePerson: moves a person on the map (probably deprecate in future)