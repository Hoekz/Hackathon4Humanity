app.factory('memory', ['$interval', function($interval){
    var self = this;
    self.data = {};

    self.read = function(){
        var data = JSON.parse(localStorage.getItem('data') || "{}");
        for(var prop in data){
            self.data[prop] = data[prop];
        }
    };

    self.write = function(){
        localStorage.setItem('data', JSON.stringify(self.data));
    };

    self.erase = function(){
        for(var prop in self.data){
            delete self.data[prop];
        }
        localStorage.removeItem('data');
    };

    self.read();

    $interval(self.write, 100);

    return self.data;
}]);

//Usage:
//passes the data object to any controller/caller, simply manipulate data on the memory
//variable and it will be written to localStorage under the key 'data' (used to do all of localStorage)