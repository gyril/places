angular.module('placesApp')
  .controller('User', User)


function User (userService, mapService) {
  var self = this

  userService.getCurrentUserInfo().then(function (data) {
    self.me = data
  })

  self.showPlace = function (place) {
    mapService.showPlace(place)
  }
}

angular.module('placesApp')
  .service('userService', userService)

function userService ($http, $q, domains) {
  var self = this

  self.me = null

  self.getCurrentUserInfo = function () {
    var deferred = $q.defer()

    // if we have it already, send all we've got
    if (self.me) {
      deferred.resolve(self.me)
      return deferred.promise
    }

    $http.get(domains.api.protocol + domains.api.domain + '/me')
      .success(function (data) {
        self.me = data
        deferred.resolve(data)
      })
      .error(function (data, status) {
        console.log(status, data)
      })

    return deferred.promise
  }

  self.getUserPlaces = function (id) {
    var deferred = $q.defer()

    $http.get(domains.api.protocol + domains.api.domain + '/relations/' + id)
      .success(function (data) {
        deferred.resolve(data)
      })
      .error(function (data, status) {
        console.log(status, data)
      })

    return deferred.promise
  }
}