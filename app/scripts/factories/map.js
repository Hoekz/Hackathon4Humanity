app.factory('map', ['memory', function(memory){
    var self = this;
    self.map = null;
    self.useCurrent = true;
    var people = {};

    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    var context = canvas.getContext('2d');
    var generateImageUrl = function(initials){
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
        context.fillText(initials[0] + initials[1], 16, 16, 24);
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
            });
        }else{
            callback(self.location);
        }
    };

    self.useGroup = function(group){
        for(var person in group){
            if(group[person].online === true){
                if ((person in people)) {
                    people[person].setPosition({lat: group[person].lat, lng: group[person].lng});
                } else {
                    self.addPerson(person, group[person].lat, group[person].lng);
                }
            }
        }
        var bounds = new google.maps.LatLngBounds();
        for(var peep in people){
            if(!(peep in group) || group[peep].online !== true){
                self.removePerson(peep);
            }else{
                bounds.extend(people[peep].getPosition());
            }
        }
        self.map.setCenter(bounds.getCenter());
        self.map.fitBounds(bounds);
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
            var initials = key.split(' ');
            initials.forEach(function(e, i, a){a[i] = e[0].toUpperCase();});
            people[key].setIcon(generateImageUrl(initials));
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

    return self;
}]);