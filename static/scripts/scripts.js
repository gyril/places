window.Places = {
  config: {},

  init: function () {
    Places.config.env = 'dev'
    Places.config.APIdomain = 'airhost.com:9898'
    Places.User.auth()
  },

  Map: {
    options: { 
      center: { lat: 48.85941, lng: 2.34280 }, 
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    },

    map: {},
    marker: {},
    modal: {
      update: function (place) {
        var modal = document.getElementById('map-modal')
        modal.innerHTML = Places.UI.Templates.map_modal(place)
        modal.style.display = 'block'
      }
    },

    init: function () {
      Places.Map.map = new google.maps.Map(document.getElementById('map-canvas'), Places.Map.options)
      Places.Map.marker = new google.maps.Marker({
        map: Places.Map.map,
        icon: {
          url: 'http://www.localspot.fr/images/icons/restaurant.png',
          anchor: new google.maps.Point(15, 45)
        }
      })

      var map = Places.Map.map

      var input = document.getElementById('pac-input')
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)

      var autocomplete = new google.maps.places.Autocomplete(input)
      autocomplete.bindTo('bounds', map)

      var infowindow = new google.maps.InfoWindow()
        , marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -0)
        })

      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        infowindow.close()
        marker.setVisible(false)
        var place = autocomplete.getPlace()
        Places.Locations.selected = new Places.Locations.Model(place)

        if (!place.geometry) {
          return
        }

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport)
        } else {
          map.setCenter(place.geometry.location)
          map.setZoom(17)
        }

        marker.setPosition(place.geometry.location)
        // marker.setVisible(true)

        var address = ''
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ')
        }

        var add = '<button onclick="Places.User.relations.add();">Add to my map</button>'

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address + '<br>' + add + '<br></div>')
        infowindow.open(map, marker)

      })
    }
  },

  User: {
    info: {
      id: null,
      email: null,
      name: null,
      photo: null
    },

    auth: function () {
      Places.Server.call('GET', '/me', null, function (data) {
        Places.User.info = data
        Places.User.relations.fetch()
        Places.UI.updateUser()
      })
    },

    relations: {
      add: function (location) {
        if (typeof location == 'undefined')
          location = Places.Locations.selected

        if (Places.User.relations.get(location.place_id))
          return
        
        this.array.push(location)
        
        Places.Server.call('POST', '/relation/add', {location: location, user: Places.User.info}, function () {
          console.log(location.name + ' relation added.')
        })

        Places.UI.updatePlaces()
      },

      remove: function (location) {
        if (typeof location == 'undefined')
          location = Places.Locations.selected

        if (!Places.User.relations.get(location.place_id))
          return
        
        this.array.splice(this.array.indexOf(location), 1)
        
        Places.Server.call('POST', '/relation/remove', {location: location, user: Places.User.info}, function () {
          console.log(location.name + ' relation removed.')
        })

        Places.UI.updatePlaces()
      },

      fetch: function () {
        Places.Server.call('GET', '/relations/'+Places.User.info.id, null, function (data) {
          for (var i = 0; i < data.length; i++) {
            Places.User.relations.array.push(data[i])
          }
          
          Places.UI.updatePlaces()
        })
      },

      show: function (place_id) {
        var place = Places.User.relations.get(place_id)
          , latLng = Places.Locations.getLatLng(place)

        if (!place)
          return

        Places.Locations.selected = place

        Places.Map.map.setCenter(latLng)
        Places.Map.map.setZoom(17)

        Places.Map.marker.setPosition(latLng)
        Places.Map.marker.setVisible(true)

        Places.Map.modal.update(place)
      },

      get: function (place_id) {
        for (var i=0; i < Places.User.relations.array.length; i++) {
          if (Places.User.relations.array[i].place_id == place_id)
            return Places.User.relations.array[i]
        }

        return false
      },

      array: []
    }
  },

  UI: {
    updatePlaces: function () {
      document.getElementById('places-list').innerHTML = Places.UI.Templates.places_list(Places.User.relations.array)
      for (var i = 0; i < Places.User.relations.array.length; i++) 
      (function (rel) {
        var mar = new google.maps.Marker({
          map: Places.Map.map,
          position: Places.Locations.getLatLng(rel),
          icon: {
            url: 'http://www.localspot.fr/images/icons/restaurant.png',
            anchor: new google.maps.Point(15, 45)
          }
        })
        mar.addListener('click', function () {
          Places.User.relations.show(rel.place_id)
        })
      })(Places.User.relations.array[i])
    },

    updateUser: function () {
      document.getElementById('user-name').innerHTML = Places.User.info.name

      document.getElementById('user-photo').getElementsByTagName('img')[0].src = './assets/' + Places.User.info.photo
    },

    setActive: function (el) {
      for (var i = 0; i < el.parentElement.getElementsByTagName('li').length; i++) {
        var li = el.parentElement.getElementsByTagName('li')[i]
        li.classList.remove('active')
      }

      el.classList.add('active')
    },

    Templates: {
      places_list: function (places) {
        var res = ''
        for (var i = 0; i < places.length; i++) {
          var place = places[i]
          res += '<li onclick="Places.User.relations.show(\''+place.place_id+'\'); Places.UI.setActive(this);">'+place.name+'</li>'
        }
        return res
      },

      map_modal: function (place) {
        var res =''
        place.comment = place.comment || ''
        return '<div class="closer" onclick="this.parentElement.style.display = \'none\'">X</div>'
              +'<div><h2>'+place.name+'</h2><p>'+place.address+'</p><p>'+place.comment+'</p><button class="remover" onclick="Places.User.relations.remove()">Remove from map</button></div>'
      }
    }
  },

  Locations: {
    Model: function (place) {
      this.name = place.name
      this.place_id = place.place_id
      this.address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ')
      this.website = place.website
      this.phone = place.international_phone_number
      this.coords = place.geometry.location.toUrlValue().split(",")
    },

    getLatLng: function (place) {
      return {lat: parseFloat(place.coords[0]), lng: parseFloat(place.coords[1])}
    },

    selected: {}
  },

  Server: {
    call: function (method, route, data, callback) {
      var req = new XMLHttpRequest()
      req.withCredentials = true
      req.open(method, 'http://' + Places.config.APIdomain + route, true)

      req.onload = function(e) {
        if (this.status.toString()[0] == '2') {
          callback(JSON.parse(this.responseText))
        } else {
          console.log(this.status, this.responseText)
        }
      }

      if (method == 'POST') {
        req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
        req.send(JSON.stringify(data))
      } else {
        req.send()
      }
    }
  }
}

google.maps.event.addDomListener(window, 'load', Places.Map.init)
google.maps.event.addDomListener(window, 'load', Places.init)