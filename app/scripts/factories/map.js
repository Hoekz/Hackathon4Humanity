app.factory('map', ['group', 'memory', function(group, memory){
    var self = this;
    self.map = null;
    var useCurrent = memory.useCurrent = memory.useCurrent || true;
    var people = {};
    var loc = [];
    var iWindow = null;

    var rad = function(x){return x * Math.PI / 180;};
    var distance = function(p1, p2){
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    var context = canvas.getContext('2d');
    var generateImageUrl = function(name, flag){
        var str = name.toUpperCase().split(' ');
        if(str.length > 1){
            str = str[0].substr(0, 1) + str[1].substr(0, 1);
        }else{
            str = str[0];
        }
        context.clearRect(0, 0, 32, 48);
        context.fillStyle = getNewColor(flag ? 'blue' : 'orange');
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
            for(var person in people){
                people[person].setMap(self.map);
            }
            updatePeople();
        }
    };

    self.centerMap = function(lat, lng){
        lat = lat || self.location.lat;
        lng = lng || self.location.lng;
        self.map.setCenter({lat: lat, lng: lng});
    };

    self.requestLocation = function(callback){
        if(!self.location && useCurrent){
            navigator.geolocation.getCurrentPosition(function(loc){
                self.location = {
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude
                };
                callback(self.location);
                navigator.geolocation.watchPosition(function(loc){
                    if(useCurrent){
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
        var count = 0;
        for(var person in members){
            if(!members[person].ignore){
                if ((person in people)) {
                    people[person].setPosition({lat: members[person].lat, lng: members[person].lng});
                } else {
                    self.addPerson(person, members[person].lat, members[person].lng);
                }
            }
        }
        var bounds = new google.maps.LatLngBounds();
        for(var person in people){
            if(!(person in members) || members[person].ignore){
                self.removePerson(person);
            }else{
                bounds.extend(people[person].getPosition());
                count++;
            }
        }
        if(count){
            self.map.setCenter(bounds.getCenter());
            self.map.fitBounds(bounds);
        }
    };

    self.search = function(callback){
        var totalVotes = 0;

        var tempMap = new google.maps.Map(document.createElement('div'), {
            location: self.location,
            zoom: 18
        });

        var score = function(place){
            var s = 0;
            for(var i = 0; i < place.types.length; i++){
                s += group.options.types[place.types[i]] || 0;
            }
            var d = distance(search.location, place.geometry.location);
            place.score = s * search.radius / (totalVotes * d);
        };

        var bounds = new google.maps.LatLngBounds();
        for(var person in group.members){
            var peep = group.members[person];
            if(peep && !peep.ignore){
                bounds.extend(new google.maps.LatLng(peep.lat, peep.lng));
            }
        }
        var search = {
            location: bounds.getCenter(),
            radius: 1619 * group.options.radius || 1619,
            types: []
        };
        for(var type in group.options.types){
            search.types.push(type);
            totalVotes += group.options.types[type];
        }
        search.types.sort(function(a, b){return group.options.types[a] < group.options.types[b];});
        search.types.splice(3, search.types.length);

        var service = new google.maps.places.PlacesService(tempMap);

        service.nearbySearch(search, function(results){
            for(var i = 0; i < results.length; i++) score(results[i]);
            results.sort(function(a, b){return b.score - a.score;});
            results.splice(5, results.length);
            callback(results);
        });
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
            google.maps.event.addListener(people[key], 'dragend', function(){
                if(!useCurrent){
                    group.members[key].lat = people[key].getPosition().lat();
                    group.members[key].lng = people[key].getPosition().lng();
                }
            });
        }
    };

    self.setLocations = function(locations){
        if(!iWindow){
            iWindow = new google.maps.InfoWindow({content: "", maxWidth: 300});
        }
        var listener = function(e){
            iWindow.setContent("");
        };

        for(var i = 0; i < loc.length; i++){
            loc[i].setMap(null);
        }
        loc = [];
        for(var i = 0; i < locations.length; i++) {
            loc.push(new google.maps.Marker({
                title: locations[i].name,
                position: locations[i].geometry.location,
                map: self.map,
                icon: generateImageUrl(i + 1 + "", true)
            }));
        }
    };

    self.finalLocation = function(floc){
        self.map.setCenter(floc.getPosition());
        floc.setIcon('images/location.png');

        google.maps.event.addListener(floc, 'click', function(){
            var url = 'https://www.google.com/maps/dir/';
            var userLocation = {
                lat: group.members[memory.name].lat,
                lng: group.members[memory.name].lng
            };
            url += userLocation.lat + ',' + userLocation.lng;
            url += '/' + location.name.replace(/ /g, '+');
            window.open(url);
        });
        if(!group.finalized())
            group.finalLocation(floc);
    };

    self.removePerson = function(key){
        people[key].setMap(null);
        delete people[key];
    };

    self.toggleLocationMode = function(){
        if(memory.name) {
            useCurrent = !useCurrent;
            memory.useCurrent = useCurrent;
            people[memory.name].setDraggable(!people[memory.name].getDraggable());
        }
    };

    self.listen = function(){
        group.onUpdate(updatePeople);
    };

    return self;
}]);

function getNewColor(hue){
    if(!this.colors){
        this.colors = {};
        this.count = {};
    }
    if(!this.colors[hue]){
        this.colors[hue] = randomColor({hue: hue, count: 18, luminosity: 'dark'});
        this.count[hue] = 0;
    }
    var color = this.colors[hue][this.count[hue]];
    this.count[hue] = (this.count[hue] + 1) % 18;
    console.log(this.colors);
    return color;
}