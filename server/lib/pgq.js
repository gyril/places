var pg = require('pg')
var Q = require('q')

module.exports = function (conString) {
  return {
    connect: function () {
      var deferred = Q.defer()
        , _this = this

      pg.connect(conString, function (err, client, done) {
        if (err) {
          deferred.reject(err)
        } else {
          _this.client = {
            query: function (query, values) {
              var deferred = Q.defer()

              client.query(query, values, function (err, result) {
                if (err) {
                  deferred.reject(err)
                } else {
                  deferred.resolve(result)
                }
              })

              return deferred.promise
            },
            done: done
          }

          deferred.resolve()
        }
      })
      return deferred.promise
    }
  }
}