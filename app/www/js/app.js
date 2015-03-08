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
      StatusBar.styleLightContent();
      // StatusBar.hide();
    }
  });
})

.service('userService', function ($rootScope, $http, iconFactory) {
  var self = this;
  var fbid = window.localStorage.getItem('fbid');

  self.sync = function () {
    $http({
      method: "GET",
      url: 'http://places-1.herokuapp.com/api/me',
      headers: { "Authorization": "Basic "+btoa(fbid+":null") }
    }).success(function (me) {
      self.user = me;
    });
  }

  if (fbid !== null) {
    self.logged = true;
    self.sync();
  }

  self.fbLogin = function () {
    openFB.login(function (response) {
      if (response.status === 'connected') {
        openFB.api({
          path: '/me',
          params: {fields: 'id, name'},
          success: function(user) {
            fbid = user.id;
            window.localStorage.setItem('fbid', fbid);
            self.sync();
            $rootScope.$apply(function () {
              self.logged = true;
            });
          },
          error: function(error) {
            alert('Facebook error: ' + error.error_description);
          }
        });
      } else {
        alert('Facebook login failed');
      }
    }, {scope: 'email'});
  }
})

.service('mapService', function ($rootScope, iconFactory) {
  var self = this;

  self.map = null;
  self.meMarker = null;
  self.placeMarker = null;
  self.currentPlace = null;

  google.maps.event.addDomListener(window, 'load', function() {
    var mapOptions = {
      center: new google.maps.LatLng(37.7833, -122.4167),
      zoom: 13,
      disableDefaultUI: true
    };

    self.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $rootScope.$emit('mapReady');

    self.meMarker = new google.maps.Marker({
      icon: iconFactory.dot('#4271D0'),
      map: self.map
    });

    self.placeMarker = new google.maps.Marker({
      icon: iconFactory.dot('#E2D92F'),
      map: self.map
    });

    google.maps.event.addListener(self.placeMarker, 'click', function () {
      self.map.setZoom(17);
      self.map.panTo(self.placeMarker.getPosition());
      $rootScope.$emit('openRight');
    });
  });

  self.displayPlaces = function (places) {
    for (var i = 0; i < places.length; i++) {
      if (!places[i].marker) {
        places[i].marker = new google.maps.Marker({
          icon: iconFactory.dot('#2FE283'),
          map: self.map,
          position: new google.maps.LatLng(places[i].latitude, places[i].longitude)
        });
      }
    }
  }

  self.geoloc = function () {
    navigator.geolocation.getCurrentPosition(function (pos) {
      var coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      self.map.panTo(coords);
      self.map.setZoom(17);
      self.meMarker.setPosition(coords);
    });
  }

  self.showPlace = function (place) {
    self.currentPlace = place;

    var coords = new google.maps.LatLng(place.latitude, place.longitude);
    
    self.placeMarker.setPosition(coords);
    self.placeMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
    
    self.map.panTo(coords);
    self.map.setZoom(17);
  }
})

.service('searchPlaceService', function ($rootScope, mapService, placeFactory) {
  var self = this;

  self.initAutocomplete = function (autocomplete) {
    autocomplete.bindTo('bounds', mapService.map);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      var gmapplace = autocomplete.getPlace();
      $rootScope.$apply(function () {
        mapService.showPlace(placeFactory.fromGoogleMaps(gmapplace));
      });
    });
  }
})

.factory('iconFactory', function () {
  return {
    dot: function (color) {
      return {
        path: 'M-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0',
        fillColor: color,
        fillOpacity: 1,
        scale: 1,
        strokeColor: color,
        strokeWeight: 2
      };
    }
  }
})

.factory('placeFactory', function () {
  return {
    fromGoogleMaps: function (gmapplace) {
      return {
        name: gmapplace.name,
        id: gmapplace.place_id,
        address: [
          (gmapplace.address_components[0] && gmapplace.address_components[0].short_name || ''),
          (gmapplace.address_components[1] && gmapplace.address_components[1].short_name || ''),
          (gmapplace.address_components[2] && gmapplace.address_components[2].short_name || '')
        ].join(' '),
        website: gmapplace.website,
        phone: gmapplace.international_phone_number,
        latitude: gmapplace.geometry.location.toUrlValue().split(",")[0],
        longitude: gmapplace.geometry.location.toUrlValue().split(",")[1]
      }
    }
  }
})

.controller('MapController', function ($scope, userService, mapService) {
  $scope.userService = userService;
  
  $scope.$watch('userService.user.places', function (places) {
    if (places) {
      mapService.displayPlaces(places);
    }
  });

  $scope.geoloc = mapService.geoloc;
  $scope.geoloc();
})

.controller('ViewsController', function ($scope, $rootScope, userService) {
  $scope.userService = userService;
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

  $scope.openExternal = function (link) {
    var myURL = encodeURI(link);
    window.open(myURL, '_system');
  }

  $rootScope.$on('openRight', function () {
    $scope.$apply(function () {
      $scope.showRightBar();
    });
  });
})

.controller('LeftBarController', function ($scope, mapService) {
  $scope.showPlace = function (place) {
    mapService.showPlace(place);
    $scope.$parent.hideLeftBar();
  }
})

.controller('RightBarController', function ($scope, mapService) {
  $scope.mapService = mapService;
  $scope.currentPlace = null;

  $scope.$watch('mapService.currentPlace', function (place) {
    $scope.currentPlace = place;
  });
})

.controller('SearchPlaceController', function ($scope, $rootScope, searchPlaceService) {
  var input = document.getElementById('search-place-input');
  var autocomplete = new google.maps.places.Autocomplete(input);

  $rootScope.$on('mapReady', function () {
    searchPlaceService.initAutocomplete(autocomplete);
  });
})

.controller('LoginController', function ($scope, userService) {
  $scope.userService = userService;

  $scope.facebookLogin = function() {
    userService.fbLogin();
  }
})