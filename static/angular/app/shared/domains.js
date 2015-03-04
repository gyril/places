angular.module('placesApp')
  .service('domains', domains)


function domains () {
  var self = this

  self.api = { domain: "places-1.herokuapp.com", protocol: "http://" }
}