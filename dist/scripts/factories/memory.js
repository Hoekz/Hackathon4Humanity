app.factory("memory",["$interval",function(a){var t=this;return t.data={},t.read=function(){var a=JSON.parse(localStorage.getItem("data")||"{}");for(var e in a)t.data[e]=a[e]},t.write=function(){localStorage.setItem("data",JSON.stringify(t.data))},t.erase=function(){for(var a in t.data)delete t.data[a];localStorage.removeItem("data")},t.read(),a(t.write,100),t.data}]);