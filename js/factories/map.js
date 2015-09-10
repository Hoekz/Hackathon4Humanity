app.factory('map', ['$http', function($http){
    var self = this;
    self.map = null;
    self.useCurrent = true;

    self.createMap = function(){
        if(mapsReady){
            var domMap = document.getElementById("#map");
            var settings = {
                zoom: 4
            };
            if(self.location){
                settings.center = self.location;
            }
            self.map = new google.maps.Map(domMap, settings);
        }else{
            setTimeout(self.createMap, 10);
        }
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
                    self.location = {
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude
                    };
                });
            });
        }
    };

    self.addMarker = function(lat, lng, img){
        //add a marker to the map, if img is not specified, use default
        return "abcdefghijkl";//something unique as an identifier
    };

    self.removeMarker = function(key){
        markers[key].map(null);
        delete markers[key];
    };

    return self;
}]);