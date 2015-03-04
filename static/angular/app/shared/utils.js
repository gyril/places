angular.module('placesApp')
  .service('utils', utils)


function utils ($http, $q, domains) {
  var self = this

  self.promisedRoute = function promisedRoute (method, route, data, done) {
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