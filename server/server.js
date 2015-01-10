var config = require('./config.json')

var express = require('express')
var app = express()
var http = require('http').Server(app)
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var port = Number(process.env.PORT || config.local.PORT)

var pg = require('pg')
var conString = (process.env.DATABASE_URL || config.local.POSTGRES)
var pgq = require('./lib/pgq.js')(conString)

// handle ACAO
app.use('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", config.local.STATIC)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Credentials", "true");
  next()
})

app.use( cookieParser() )
app.use( session({
  secret: '321PLACESPLACES123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false
  }
}) )

app.use( bodyParser.json() )       // to support JSON-encoded bodies

app.post('/login', function (req, res) {
  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM places.users WHERE email=$1 AND password=$2', [req.body.email, req.body.password])
  })
  .then(function (data) {
    if (data.rows.length == 0) {
      res.status(401).send({message: 'Unauthorized'})
    } else {
      req.session.user = data.rows[0].id
      res.send()
    }
    
    return pgq.client.done()
  })
})

app.get('/me', function (req, res) {
  console.log(req.session.user)

  req.session.user = 1
  
  if (!req.session.user) {
    res.status(401).send({message: 'Unauthorized'})
  } else {
    var userid = parseInt(req.session.user)
      , user = {}

    pgq.connect()
    .then(function () {
      return pgq.client.query('SELECT * FROM places.users WHERE id=$1', [userid])
    })
    .then(function (data) {
      user = { 
        id: userid,
        name: data.rows[0].name,
        email: data.rows[0].email,
        photo: data.rows[0].photo,
        places: []
      }

      return pgq.client.query('SELECT * FROM (SELECT * FROM places.relations WHERE userid=$1 AND active=$2) r, places.locations l WHERE r.placeid=l.place_id', [userid, true])
    })
    .then(function (data) {
      for (var i = 0; i < data.rows.length; i++) {
        user.places.push(data.rows[i])
      }

      res.send(user)
      return pgq.client.done()
    })
  }
})

app.get('/relations/:userid', function (req, res) {
  var userid = req.params.userid

  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT * FROM (SELECT * FROM places.relations WHERE userid=$1 AND active=$2) r, places.locations l WHERE r.placeid=l.place_id', [userid, true])
  })
  .then(function (data) {
    res.send(JSON.stringify(data.rows))
    return pgq.client.done()
  })
  .fail(function (error) {
    console.log(error)
  })
})

app.post('/relation/add', function (req, res) {
  console.log(req.body)
  var place = req.body.location
    , user = req.body.user

  pgq.connect()
  .then(function () {
    return pgq.client.query('INSERT INTO places.locations (name, place_id, website, phone, address, coords) SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM places.locations WHERE place_id=$2)', [place.name, place.place_id, place.website, place.phone, place.address, place.coords])
  })
  .then(function () {
    return pgq.client.query('UPDATE places.relations SET active=$1 WHERE userid=$2 AND placeid=$3', [true, user.id, place.place_id])
  })
  .then(function () {
    return pgq.client.query('INSERT INTO places.relations (active, userid, placeid) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM places.relations WHERE userid=$2 AND placeid=$3)', [true, user.id, place.place_id])
  })
  .then(function () {
    res.send({message: "OK"})
    return pgq.client.done()
  })
  .fail(function (error) {
    console.log(error)
  })
})

app.post('/relation/remove', function (req, res) {
  console.log(req.body)

  var place = req.body.location
    , user = req.body.user

  pgq.connect()
  .then(function () {
    return pgq.client.query('UPDATE places.relations SET active=$1 WHERE userid=$2 AND placeid=$3', [false, user.id, place.place_id])
  })
  .then(function () {
    res.send({message: "OK"})
    return pgq.client.done()
  })
  .fail(function (error) {
    console.log(error)
  })
})

app.get('/search/users/:q', function (req, res) {
  var qstar = '%' + req.params.q.toLowerCase() + '%'

  pgq.connect()
  .then(function () {
    return pgq.client.query('SELECT name, photo FROM places.users WHERE LOWER(name) LIKE $1', [qstar])
  })
  .then(function (data) {
    res.send(JSON.stringify(data.rows))
    return pgq.client.done()
  })
  .fail(function (error) {
    console.log(error)
  })
})

http.listen(port, function(){
  console.log('listening on *:'+port)
})