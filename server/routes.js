var config = require('./config.json')

var passport = require('passport')
  , async = require('async')
  , _ = require('underscore')
  , sql = require('./sql')

var pg = require('pg')
  , conString = (process.env.DATABASE_URL || config.local.POSTGRES)
  , pgq = require('./lib/pgq.js')(conString)

exports.mount = function (app) {
  app.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login.html',
    successRedirect: '/angular/'
  }))

  app.get('/me', function (req, res) {
    if (!req.user) {
      res.redirect('401').send({message: 'Unauthorized'})
    } else {
      sql.fetchPlacesFromUser(req.user.id, function (err, results) {
        if (err)
          return console.log(err)

        var user = _.omit(req.user, 'password')
        user.places = results

        res.send(user)
      })
    }
  })

  app.get('/relations/:userid', function (req, res) {
    sql.fetchPlacesFromUser(req.params.userid, function (err, results) {
      if (err)
        return console.log(err)

      res.send(results)
    })
  })

  app.post('/relation/add', function (req, res) {
    async.series({
      insertPlace: function (done) {
        sql.insertPlace(req.body.place, done)
      },
      upsertRelation: function (done) {
        sql.upsertRelation(req.user.id, req.body.place.id, done)
      }
    }, function (err, results) {
      if (err)
        return console.log(err)

      res.send({message: "OK"})
    })
  })

  app.post('/relation/remove', function (req, res) {
    sql.removeRelation(req.user.id, req.body.place.id, function (err) {
      if (err)
        return console.log(err)

      res.send({message: "OK"})
    })
  })

  app.get('/search/users/:q', function (req, res) {
    sql.fetchUsersFromQuery(req.params.q, function (err, results) {
      if (err)
        return console.log(err)

      var users = _.map(results, function (user) {
        return _.omit(user, 'password')
      })

      res.send(users)
    })
  })
}