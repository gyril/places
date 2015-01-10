angular.module('placesApp')
  .controller('Map', Map)

function Map ($scope, uiGmapGoogleMapApi, mapService, userService) {
  var map = this

  map.mapService = mapService
  map.searchbox = { 
    template: './templates/searchbox.tpl.html', 
    events: { places_changed: function (searchbox) {
        var place = searchbox.getPlaces()[0]
        mapService.showPlace(place)
      }
    }, 
    options: {}
  }

  $scope.$watch('map.mapService.currentPlace', function (place) {
    if (place) {
      map.zoom = 17
      map.center = { latitude: place.latitude, longitude: place.longitude }
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

    userService.getCurrentUserInfo().then(function (data) {
      map.places = _(data.places).map(function (place) {
          place.latitude = place.coords[0]
          place.longitude = place.coords[1]
          place.id = place.place_id

          return place
        }).value()
    })
  })
}

angular.module('placesApp')
  .service('mapService', mapService)

function mapService () {
  var self = this

  self.currentPlace = null

  self.showPlace = function (place) {
    self.currentPlace = place
  }

  self.hidePlace = function () {
    self.currentPlace = null
  }
}