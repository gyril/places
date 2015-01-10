angular.module('placesApp')
  .service('dropdownService', dropdownService)


function dropdownService () {
  var self = this

  self.current = null

  self.open = function (name, items, anchor) {
    self.current = {
      name: name,
      items: items,
      anchor: anchor
    }
  }

  self.close = function () {
    self.current = null;
  }

  self.select = function (item) {
    console.log(item)
  }
}

angular.module('placesApp')
  .directive('dropdown', dropdown)

function dropdown (dropdownService) {
  return function (scope, element) {
    scope.dropdownService = dropdownService
  }
}