// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngResource'])

.config(function () {
  openFB.init({appId: '346135978909744'});
})

.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.service('userService', function ($resource) {
  var self = this;

  self.user = JSON.parse(window.localStorage.getItem('user'));

  self.sync = function () {
    $resource('http://airhost.com:9898/api/me', {}, {
      get: {
        method: "GET",
        headers: { "Authorization": "Basic "+btoa(self.user.id+":null") }
      }
    }).get({}, function (res) {
      self.user.places = res.places;
    });
  }
})

.controller('MapController', function ($scope, userService) {

  google.maps.event.addDomListener(window, 'load', function() {
    var myLatlng = new google.maps.LatLng(37.7833, -122.4167);

    var mapOptions = {
      center: myLatlng,
      zoom: 17,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    $scope.geoloc = function () {
      navigator.geolocation.getCurrentPosition(function (pos) {
        var coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(coords);
        map.setZoom(17);
        $scope.meMarker.setPosition(coords);
      });
    }

    $scope.userService = userService;

    var dot = {
      path: 'M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0',
      fillColor: 'rgb(168, 207, 216)',
      fillOpacity: .9,
      scale: 1,
      strokeColor: '#4B5DAC',
      strokeWeight: 2
    };

    $scope.meMarker = new google.maps.Marker({
      icon: dot,
      map: map
    });

    $scope.geoloc();

    $scope.map = map;
    $scope.leftBarStatus = '';
    $scope.rightBarStatus = '';

    $scope.showLeftBar = function () {
      $scope.leftBarStatus = 'swiped';
      $scope.rightBarStatus = '';
    }

    $scope.hideLeftBar = function () {
      $scope.leftBarStatus = '';
    }

    $scope.showRightBar = function () {
      $scope.rightBarStatus = 'swiped';
      $scope.leftBarStatus = '';
    }

    $scope.hideRightBar = function () {
      $scope.rightBarStatus = '';
    }
  });
 
})

.controller('LoginController', function ($scope, userService) {

  $scope.userService = userService;
  userService.sync();

  $scope.facebookLogin = function() {
    openFB.login(
      function (response) {
        if (response.status === 'connected') {
          console.log('Facebook login succeeded');
          openFB.api({
            path: '/me',
            params: {fields: 'id, name'},
            success: function(user) {
              $scope.$apply(function() {
                window.localStorage.setItem('user', JSON.stringify(user));
                $scope.userService.user = user;
                console.log(user);
              });
            },
            error: function(error) {
              alert('Facebook error: ' + error.error_description);
            }
          });
        } else {
          alert('Facebook login failed');
        }
      },
      {scope: 'email'});
  }

})