angular.module('placesApp')
  .service('domains', domains)


function domains () {
  var self = this

  self.api = { domain: window.location.host, protocol: window.location.protocol+"//" }
}