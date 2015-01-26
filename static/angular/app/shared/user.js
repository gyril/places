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
    return promisedRoute('get', '/relations/' + id, function (results) {
      if (results.message === 'OK')
        self.me.places.push(place)
    })
  }

  self.addRelation = function (place) {
    return promisedRoute('post', '/relation/add', {place: place}, function (results) {
      if (results.message === 'OK')
        self.me.places.push(place)
    })
  }

  self.removeRelation = function (place) {
    return promisedRoute('post', '/relation/remove', {place: place}, function (results) {
      if (results.message === 'OK')
        self.me.places.splice(self.me.places.indexOf(place), 1)
    })
  }

  function promisedRoute (method, route, data, done) {
    if (typeof data === 'function') {
      done = data
      data = null
    }

    var deferred = $q.defer()

    $http[method](domains.api.protocol + domains.api.domain + route, data)
      .success(function (results) {
        done(results)
        deferred.resolve(results)
      })
      .error(function (results, status) {
        console.log(status, results)
      })

    return deferred.promise
  }
}