app.controller('flush', ['$scope', function($scope){
	console.log("Flushing Local Storage");
	localStorage.removeItem('data');
	console.log(localStorage.getItem('data'));
	alert("Please refresh the page");
}]);
