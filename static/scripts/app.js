(function () {
  var app = angular.module('Places', ['uiGmapgoogle-maps'])
    .config(function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyClGJDuUnPapo-qhzY6iT8aWgAS0MvD_VQ',
        v: '3.17',
        libraries: 'places'
      })
    })

  app.controller('UserInfo', function () {
    this.name = 'Vianney Elq',
    this.photo = 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2014-07-08/2443923572_48.jpg'
  })

  app.controller('UserMap', function () {
    this.places = [
      {
        name: 'Le Café'
      },
      {
        name: 'Le Bar'
      },
      {
        name: 'Le Restaurant'
      }
    ]
  })

  app.controller('mapCtrl', function ($scope, uiGmapGoogleMapApi) {
    $scope.map = { center: { latitude: 48.85941, longitude: 2.34280 }, zoom: 13 }
    $scope.options = {
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    }

    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function (maps) {
      console.log(maps)
    })
  })

  // app.controller('InfoWindow', ['$scope', function ($scope) {
  //   $scope.addAddress = function (e) {
  //     console.log(e.target.id)
  //   }
  // }])


  // app.controller('MapFrame', ['$scope', '$compile', '$rootScope', function ($scope, $compile, $rootScope) {
  //   var paris = new google.maps.LatLng(48.85941, 2.34280)
  //   this.options = {
  //     center: paris,
  //     zoom: 13,
  //     
  //   }
    
  //   var map = new google.maps.Map(document.getElementById('map-canvas'), this.options)

  //   // google.maps.event.addListener(map, 'click', function (event) {
  //   //   $scope.placeMarker({geometry: {location: event.latLng}})
  //   // })

  //   var service = new google.maps.places.PlacesService(map)
  //   $scope.completelist = []
    
  //   function pinSymbol (color) {
  //     return {
  //       path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
  //       fillColor: color,
  //       fillOpacity: 1,
  //       strokeColor: '#000',
  //       strokeWeight: 2,
  //       scale: 1
  //     }
  //   }

  //   $scope.placeMarker = function (place) {
  //     if (typeof place.marker != 'undefined') {
  //       place.marker.setMap(map)
  //       return
  //     }

  //     var marker = new google.maps.Marker({
  //         position: place.geometry.location,
  //         map: map,
  //         icon: pinSymbol('blue')
  //     })

  //     google.maps.event.addListener(marker, 'click', function () {
  //       $scope.clickMarker(place)
  //     })

  //     place.marker = marker
  //     map.panTo(place.geometry.location)
  //     $scope.completelist = []
  //   }

  //   $scope.removeMarker = function (place) {
  //     place.marker.setMap(null)
  //   }

  //   $scope.clickMarker = function (place) {
  //     map.panTo(place.geometry.location)
  //     var infowindow = new google.maps.InfoWindow({
  //         content: infoContent(place)
  //     })
  //     infowindow.open(map, place.marker)
      
  //     window.setTimeout(function () {
  //       $compile(document.getElementById('infowindow'))($rootScope)
  //     }, 100)
  //   }

  //   $scope.addAddress = function () {
  //     console.log("keekoo")
  //   }

  //   function infoContent(place) {
  //     var content = '<div id="infowindow" ng-controller="InfoWindow">'
  //                 + '<span>'+place.name+'</span>'
  //                 + '<div data-id="'+place.place_id+'" ng-click="addAddress($event)" class="add">Add</div>'
  //                 + '<br>'
  //                 + '</div>'

  //     return content
  //   }

  //   $scope.search = function () {
  //     var query = $scope.query

  //     if (query.length < 2) {
  //       $scope.completelist = []
  //       return
  //     }

  //     console.log(query)
  //     var request = {
  //       location: map.center,
  //       radius: '5000',
  //       query: query,
  //       types: ['cafe', 'bar', 'food', 'restaurant', 'meal_delivery', 'meal_takeaway', 'night_club', 'shopping_mall']
  //     }
      
  //     service.textSearch(request, function (results, status) {
  //         console.log(results, status)
  //       if (status == google.maps.places.PlacesServiceStatus.OK) {
  //         $scope.$apply(function () {
  //           $scope.completelist = results
  //         })
  //       }
  //     })
  //   }
  // }])
})()