angular.module('placesApp')
  .service('dropdownService', dropdownService)


function dropdownService () {
  var self = this

  self.current = null

  self.open = function (name, items, anchor, handler) {
    self.current = {
      name: name,
      items: items,
      anchor: anchor,
      handler: handler
    }
  }

  self.close = function () {
    self.current = null;
  }

  self.select = function (item) {
    self.current.handler(item)
  }
}

angular.module('placesApp')
  .directive('dropdown', dropdown)

function dropdown (dropdownService) {
  return function (scope, element) {
    scope.dropdownService = dropdownService
  }
}