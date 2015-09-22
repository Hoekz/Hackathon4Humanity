app.controller("meetings",["$scope","memory","categories","group","map","$location",function(e,o,n,t,a,r){e.isAdding=!1,e.title="Meetings",e.newMeetingName="",e.locationTypes=n,e.meetings=[];for(var i in o.groups)e.meetings.push({id:i,closed:o.groups[i].closed,name:o.groups[i].name,creator:o.groups[i].creator,date:o.groups[i].date,members:o.groups[i].members});console.log(o.groups),e.name=o.name;var g=function(e){alert(e)};e.toggleAddPage=function(){e.name=o.name||"",e.isAdding=!e.isAdding,u(),e.isAdding?e.title="New":e.title="Meetings"},e.hideAddPage=function(){e.isAdding=!e.isAdding,u(),e.title="Meetings"},e.toggleAboutPage=function(){document.querySelector("#about-overlay").classList.toggle("open")},e.genUrl=function(){if(!e.name)return g("We need your name to distinguish who's who in the group.");for(var o=0;o<n.length;o++)if(n[o].approved)return s();return g("You have not selected any categories.")};var s=function(){for(var i=[],g=0;g<n.length;g++){var s=n[g].approved?n[g].googleId.split(", "):[];i=i.concat(s)}for(var g=0;g<i.length;g++)i[g]=i[g].toLowerCase().replace(/ /g,"_");o.name||(o.name=e.name),t.createGroup({name:o.name,lat:a.location.lat,lng:a.location.lng},e.newMeetingName,i,function(n){o.groups||(o.groups={}),o.groups[n]={name:e.newMeetingName||"Group "+n,creator:!0,votes:{}};for(var t=0;t<i.length;t++)o.groups[n].votes[i[t]]=!0;r.path("/group/"+n)})},u=function(){e.newMeetingName="",e.locationTypes=e.locationTypes.map(function(e){return e.approved=!1,e})};setTimeout(function(){a.requestLocation(function(e){var o=new google.maps.Map(document.getElementById("map-preview"),{center:e,zoom:16,disableDefaultUI:!0});new google.maps.Marker({map:o,position:o.getCenter()})})},500)}]);