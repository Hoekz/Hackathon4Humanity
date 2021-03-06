var app = angular.module('app', ['ngRoute', 'firebase']);

app.config(["$routeProvider", function($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'home',
            templateUrl: 'templates/home.html'
        })
        .when('/about', {
            controller: 'about',
            templateUrl: 'templates/about.html'
        })
        .when('/create', {
            controller: 'create',
            templateUrl: 'templates/create.html'
        })
        .when('/group/:id', {
            controller: 'map',
            templateUrl: 'templates/map.html'
        })
        .when('/meetings', {
            controller: 'meetings',
            templateUrl: 'templates/meetings.html'
        })
        .when('/flush', {
            controller: 'flush',
            templateUrl: 'templates/blank.html'
        })
        .otherwise('/');
}]);