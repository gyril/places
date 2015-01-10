angular.module('placesApp')
  .directive('peopleSearch', peopleSearch)

function peopleSearch (peopleService, dropdownService) {
  return function (scope, element, attrs) {
    element.bind("keyup", function (event) {
      peopleService.search(element.val()).then(function (results) {
        if (results && results.length > 0)
          dropdownService.open('people-search', results, {top: element.prop('offsetTop') + element.prop('offsetHeight'), left: element.prop('offsetLeft')})
        else
          dropdownService.close()
      })
    })
  }
}

angular.module('placesApp')
  .service('peopleService', peopleService)

function peopleService ($http, $q, domains) {
  var self = this

  self.search = function (query) {
    var deferred = $q.defer()
    if (query.length == 0) {
      deferred.resolve({})
      return deferred.promise
    }

    $http.get(domains.api.protocol + domains.api.domain + '/search/users/' + query)
      .success(function (data) {
        deferred.resolve(data)
      })
      .error(function (data, status) {
        console.log(status, data)
      })

    return deferred.promise
  }
}