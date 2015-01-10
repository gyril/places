angular.module('placesApp')
  .service('domains', domains)


function domains () {
  var self = this

  self.api = { domain: "airhost.com:9898", protocol: "http://" }
  self.web = { domain: "airhost.com:3475/angular", protocol: "http://" }
}