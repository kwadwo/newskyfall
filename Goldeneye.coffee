Goldeneye = (->

  express = require('express')
  GLOBAL.app = express()
  routes = require('./routes/all')
  http = require('http')
  path = require('path')
  GLOBAL.server = http.createServer(app)
  exec = require('child_process').exec
  util = require('util')
  engine = require('ejs-locals')
  James = require('./Modules/Bond.coffee')
  fs = require('fs')
  fs.exists = fs.exists || require('path').exists;
  fs.existsSync = fs.existsSync || require('path').existsSync;


  buildServerList = ->
    console.log 'building server list'
    file = 'config/default.coffee'
    fs.exists(file, (list) ->
      if list
        servers = require('./config/default').servers
        self = require('./config/default').current
        GLOBAL.serverlist = servers
        GLOBAL.self = self
      else
        console.log '!!! no server config file brah'
        process.exit(1)
    )
    

  setupRoutes = ->
    app.get('/', routes.index)
    app.get('/login',routes.login)
    app.get('/logout',routes.logout)
    app.post('/login',routes.signin)

    app.get('/watch/:company/:type?*',routes.companyspecific)


  configServer = ->
    app.configure(() ->
      app.set('port', process.env.PORT || 3007);
      app.engine('ejs', engine);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser('skyfall'));
      app.use(express.session());
      app.use(app.router);
      app.use(express.static(path.join(__dirname, 'public')));
    )
    app.configure('development', () ->
      app.use(express.errorHandler());
    )
    server.listen(app.get('port'), () ->
      console.log("Skyfall server listening on port " + app.get('port'));
    )
    do setupRoutes
    return
  buildServer = ->
    do buildServerList
    do configServer
    do James.Bond.spy

  init = ->
    do buildServer

  start:init
)






module.exports.Monitor = new Goldeneye()