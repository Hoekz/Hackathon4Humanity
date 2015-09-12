app.factory('memory', ['$interval', function($interval){
    var self = this;

    self.data = {
        $: self
    };

    self.read = function(){
        self.data = {
            $: self
        };
        for(var i = 0; i < localStorage.length; i++){
            var key = localStorage.key(i);
            self.data[key] = JSON.parse(localStorage.getItem(key));
        }
    };

    self.write = function(){
        localStorage.clear();
        for(var prop in self.data){
            if(prop !== "$")
                localStorage.setItem(prop, JSON.stringify(self.data[prop]));
        }
    };

    self.erase = function(){
        self.data = {
            $: self
        };
        localStorage.clear();
    };

    self.read();

    $interval(self.write, 10);

    return self.data;
}]);