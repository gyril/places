angular.module('placesApp')
  .controller('Map', Map)

function Map ($scope, uiGmapGoogleMapApi, mapService, userService) {
  var map = this

  map.currentMarker = { id: 0 }


  map.mapService = mapService
  map.searchbox = { 
    template: './templates/searchbox.tpl.html', 
    events: { places_changed: function (searchbox) {
        var location = searchbox.getPlaces()[0]
        mapService.showPlace(new googleLocationToPlace(location))
      }
    }, 
    options: {}
  }

  map.showPlace = function (item) {
    mapService.showPlace(item.model)
  }

  map.addCurrentRelation = function () {
    userService.addRelation(map.mapService.currentPlace).then(function (data) {
      if (data.message === "OK")
        mapService.hidePlace()
    })
  }

  map.removeCurrentRelation = function () {
    userService.removeRelation(map.mapService.currentPlace).then(function (data) {
      if (data.message === "OK")
        mapService.hidePlace()
    })
  }

  $scope.$watch('map.mapService.currentPlace', function (place) {
    map.currentPlace = place
    
    if (place) {
      map.currentMarker = {
        coords: {
          latitude: place.latitude,
          longitude: place.longitude
        }
      }

      userService.getCurrentUserInfo().then(function (data) {
        map.currentPlace.added = ( _.find(data.places, function (item) { return _.contains(item, place.id) }) ) ? true : false
      })
      map.zoom = 17
      map.center = { latitude: place.latitude, longitude: place.longitude }
    } else {
      map.currentMarker = { id: 0 }
    }
  })
  
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

        map.searchbox.options.bounds = new maps.LatLngBounds(sw, ne)
      }
    }
  })

  function googleLocationToPlace (obj) {
    this.id = obj.place_id
    this.name = obj.name
    this.address = [
        (obj.address_components[0] && obj.address_components[0].short_name || ''),
        (obj.address_components[1] && obj.address_components[1].short_name || ''),
        (obj.address_components[2] && obj.address_components[2].short_name || '')
      ].join(' ')
    var coords = obj.geometry.location.toUrlValue().split(",")
    this.latitude = coords[0]
    this.longitude = coords[1]
    this.phone = obj.international_phone_number
    this.website = obj.website
  }
}

angular.module('placesApp')
  .service('mapService', mapService)

function mapService () {
  var self = this

  self.places = []
  self.currentPlace = null

  self.showPlace = function (place) {
    self.currentPlace = place
  }

  self.hidePlace = function () {
    self.currentPlace = null
  }

  self.togglePlace = function () {
    if (self.currentPlace !== null)
      self.hidePlace()
  }
}