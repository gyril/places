angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $q, $http, uiGmapGoogleMapApi) {
  var map = this

  uiGmapGoogleMapApi.then(function (maps) {
    map.center = { latitude: 48.85941, longitude: 2.34280 }
    map.zoom = 13
    map.control = {}
    map.options = {
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    }

    map.events = {
      bounds_changed: function (mapObject) {
        var bounds = mapObject.getBounds()
          , sw = bounds.getSouthWest()
          , ne = bounds.getNorthEast()
      }
    }
  })

  map.getCurrentUserInfo = function () {
    var deferred = $q.defer()

    // if we have it already, send all we've got
    if (map.user) {
      deferred.resolve(map.user)
      return deferred.promise
    }

    return promisedRoute('get', '/info/1', function (results) {
      map.user = results
    })
  }

  function promisedRoute (method, route, data, done) {
    if (typeof data === 'function') {
      done = data
      data = null
    }

    var deferred = $q.defer()

    $http[method]('http://airhost.com:9898' + route, data)
      .success(function (results) {
        done(results)
        deferred.resolve(results)
      })
      .error(function (results, status) {
        console.log(status, results)
      })

    return deferred.promise
  }

  map.getCurrentUserInfo().then(function (data) {
    map.user = data
  })
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
