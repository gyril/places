var config = require('./config.json')

var pg = require('pg')
  , conString = (process.env.DATABASE_URL || config.local.POSTGRES)
  , pgq = require('./lib/pgq.js')(conString)

this.auth = function (email, password, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM places.users WHERE email=$1', [email])
  })
  .then(function (data) {
    pgq.client.done()
    if (data.rows.length == 0) { return done(null, false) }
    if (data.rows[0].password !== password) { return done(null, false) }
    return done(null, data.rows[0])
  })
  .fail(function (error) {
    return done(error)
  })
}

this.fetchUser = function (id, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM places.users WHERE id=$1', [id])
  })
  .then(function (data) {
    pgq.client.done()
    return done(null, data.rows[0] || false)
  })
  .fail(function (error) {
    return done(error)
  })
}

this.fetchUsersFromQuery = function (query, done) {
  var qstar = '%' + query.toLowerCase() + '%'

  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM places.users WHERE LOWER(name) LIKE $1', [qstar])
  })
  .then(function (data) {
    pgq.client.done()
    return done(null, data.rows || false)
  })
  .fail(function (error) {
    console.log(error)
  })
}

this.fetchPlacesFromUser = function (id, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM (SELECT * FROM places.relations WHERE userid=$1 AND active=$2) r, places.locations l WHERE r.placeid=l.id', [id, true])
  })
  .then(function (data) {
    pgq.client.done()
    return done(null, data.rows || false)
  })
  .fail(function (error) {
    return done(error)
  })
}

this.insertPlace = function (place, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('INSERT INTO places.locations (name, id, website, phone, address, latitude, longitude) SELECT $1, $2, $3, $4, $5, $6, $7 WHERE NOT EXISTS (SELECT 1 FROM places.locations WHERE id=$2)', [place.name, place.id, place.website, place.phone, place.address, place.latitude, place.longitude])
  })
  .then(function () {
    pgq.client.done()
    return done(null, true)
  })
  .fail(function (error) {
    return done(error)
  })
  
}

this.upsertRelation = function (userid, placeid, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('UPDATE places.relations SET active=$1 WHERE userid=$2 AND placeid=$3', [true, userid, placeid])
  })
  .then(function () {
    return pgq.client.query('INSERT INTO places.relations (active, userid, placeid) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM places.relations WHERE userid=$2 AND placeid=$3)', [true, userid, placeid])
  })
  .then(function () {
    pgq.client.done()
    return done(null, true)
  })
  .fail(function (error) {
    return done(error)
  })
}

this.removeRelation = function (userid, placeid, done) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('UPDATE places.relations SET active=$1 WHERE userid=$2 AND placeid=$3', [false, userid, placeid])
  })
  .then(function (data) {
    pgq.client.done()
    return done(null)
  })
  .fail(function (error) {
    return done(error)
  })
}

module.exports = this