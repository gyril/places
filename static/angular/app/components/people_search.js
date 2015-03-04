angular.module('placesApp')
  .directive('peopleSearch', peopleSearch)

function peopleSearch (peopleService, dropdownService) {
  function getOffset (t, el) { var s = 'offset'+t, o = el.prop(s); while (typeof el.parent().prop(s) !== 'undefined') { el = el.parent(); o += el.prop(s); }; return o }
  
  return function (scope, element, attrs) {
    element.bind("keyup", function (event) {
      window.a = element
      peopleService.search(element.val()).then(function (results) {
        if (results && results.length > 0)
          dropdownService.open('people-search', results, 
            {top: getOffset('Top', element) + element.prop('offsetHeight'), left: getOffset('Left', element)},
            function (item) {
              dropdownService.close()
              peopleService.currentPeople = item.id
            })
        else
          dropdownService.close()
      })
    })
  }
}

angular.module('placesApp')
  .service('peopleService', peopleService)

function peopleService ($q, utils) {
  var self = this

  self.currentPeople = null

  self.search = function (query) {
    var deferred = $q.defer()
    if (query.length == 0) {
      deferred.resolve({})
      return deferred.promise
    }

    return utils.promisedRoute('get', '/search/users/' + query, function (results) {})
  }


  self.getPeopleInfo = function (id) {
    return utils.promisedRoute('get', '/info/' + id, function (results) {})
  }

  self.getPeoplePlaces = function (id) {
    return utils.promisedRoute('get', '/relations/' + id, function (results) {})
  }
}