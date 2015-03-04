angular.module('placesApp')
  .service('domains', domains)


function domains () {
  var self = this

  self.api = { domain: "places-.herokuapp.com", protocol: "http://" }
}