var config = require('./config.json')

var path = require('path')
  , express = require('express')
  , app = express()
  , http = require('http').Server(app)
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , sql = require('./sql')
  , port = Number(process.env.PORT || config.local.PORT)


passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (email, password, done) {
    sql.auth(email, password, done)
  }
))

passport.serializeUser(function (user, done) {
  done(null, {id: user.id})
})

passport.deserializeUser(function (blob, done) {
  sql.fetchUser(blob.id, done)
})

app.disable('x-powered-by')
app.use(cookieParser())
app.use(session({
  secret: 'come at me break my secret bro',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false
  }
}))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.resolve(__dirname, '..', 'static')))

require('./routes').mount(app)

http.listen(port, function(){
  console.log('listening on *:'+port)
})