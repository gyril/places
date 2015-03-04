angular.module('placesApp')
  .controller('Display', Display)


function Display ($scope, userService, peopleService, mapService) {
  var display = this

  display.peopleService = peopleService
  display.user = null

  display.showPlace = function (place) {
    mapService.showPlace(place)
  }

  display.toggleLeftbar = function () {
    display.status = display.status === 'open' ? 'closed' : 'open'
  }

  $scope.$watch('display.peopleService.currentPeople', function (id) {
    if (id) {
      peopleService.getPeopleInfo(id).then(function (results) {
        display.user = results
      })
    } else {
      userService.getCurrentUserInfo().then(function (data) {
        display.user = data
      }) 
    }
  })
}