angular.module('placesApp')
  .service('userService', userService)

function userService ($q, utils) {
  var self = this

  self.me = null

  self.getCurrentUserInfo = function () {
    var deferred = $q.defer()

    // if we have it already, send all we've got
    if (self.me) {
      deferred.resolve(self.me)
      return deferred.promise
    }

    return utils.promisedRoute('get', '/me', function (results) {
      self.me = results
    })
  }

  self.addRelation = function (place) {
    return utils.promisedRoute('post', '/relation/add', {place: place}, function (results) {
      if (results.message === 'OK')
        self.me.places.push(place)
    })
  }

  self.removeRelation = function (place) {
    return utils.promisedRoute('post', '/relation/remove', {place: place}, function (results) {
      if (results.message === 'OK')
        self.me.places.splice(self.me.places.indexOf(place), 1)
    })
  }
}