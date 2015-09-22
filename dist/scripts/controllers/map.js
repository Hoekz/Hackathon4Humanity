function capIt(e){return e.replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()})}app.controller("map",["$scope","group","map","memory","$location",function(e,o,t,r,n){var a=function(e){var o,t=0;for(o in e)e.hasOwnProperty(o)&&t++;return t};e.name=r.name,e.link=location.href,e.results=[],e.updateList=function(){e.meetingName=o.name,e.members=[];for(var n in o.members)e.members.push(o.members[n]),e.members[e.members.length-1].name=n;if(e.radius=o.options.radius,e.types=[],r.groups[o.id()])for(var a in o.options.types)e.types.push({name:capIt(a.replace(/_/g," ")),type:a,value:r.groups[o.id()].votes[a]});e.isCreator&&!o.finalized()&&e.search(),o.finalized()&&t.finalLocation()},o.onUpdate(e.updateList),o.members=[],r.groups||(r.groups={}),r.groups[o.id()]?e.isCreator=r.groups[o.id()].creator:e.isCreator=!1,e.showingSharing=!1,e.showingSettings=!1,e.expand=function(e){document.querySelector("#"+e).classList.toggle("expand")},e.toggleIgnore=function(t){return o.finalized()?null:void(e.isCreator&&t?o.toggleIgnore(t):o.toggleIgnore(r.name))},e.search=function(){t.search(function(o){t.setLocations(o),e.results=o})};var s=function(){r.name||(r.name=prompt("name",""),e.name=r.name);var s=o.joinGroup({name:r.name,lat:t.location.lat,lng:t.location.lng},function(){o.online(r.name),r.groups[o.id().toString()]={name:o.name,closed:o.closed,date:new Date(o.timestamp).toISOString().substr(5,5).replace("-","/"),members:a(o.members),creator:o.members[r.name].creator,votes:r.groups[o.id()]?r.groups[o.id()].votes:{}};for(var t in o.options.types)t in r.groups[o.id()].votes||(o.options.types[t]++,r.groups[o.id()].votes[t]=!0);e.updateList(),e.isCreator=o.members[r.name].creator});s||n.path("/"),t.listen()};t.requestLocation(function(){t.createMap(),o.ready(s)&&s()}),e.choose=function(t){if(o.finalized())return null;for(var r=0;r<e.results.length;r++)if(e.results[r].id==t)return o.finalLocation(e.results[r]),s(),null},t.onChoose(e.choose),e.showGroup=!1,e.members=[],e.toggleVote=function(t,n){return o.finalized()?null:(e.types[t].value=!e.types[t].value,o.updateVotes(n,e.types[t].value),void(r.groups[o.id()].votes[n]=e.types[t].value))};var i=document.querySelector("#map-view");i.hasChildNodes()||t.createMap()}]);