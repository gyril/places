var config = require('./config.json')

var app = require('express')()
var http = require('http').Server(app)
var bodyParser = require('body-parser')
var port = Number(process.env.PORT || config.local.PORT)

var pg = require('pg')
var conString = (process.env.DATABASE_URL || config.local.POSTGRES)
var pgq = require('./lib/pgq.js')(conString)

// handle ACAO
app.use('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use( bodyParser.json() )       // to support JSON-encoded bodies