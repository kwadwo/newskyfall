Bond = (->
  io = require('socket.io').listen(server)
  io.set('log level', 1)
  os = require('os')
  diskspace = require('diskspace')


  sendtoMI6 = (obj, socket) ->
    socket.emit('serverInfo', obj)




  osReport = (obj, socket) ->
    OSOBJ = obj
    OSOBJ.hostname = os.hostname()
    OSOBJ.loadAvg  = os.loadavg()
    OSOBJ.totalMem = os.totalmem()
    OSOBJ.freeMem  = os.freemem()
    OSOBJ.Cpus     = os.cpus()

    sendtoMI6(OSOBJ, socket)


  buildDiskReport = (socket) ->
    diskspace.check(GLOBAL.self.diskchecklocation, (total, free, status) ->
      OSOBJ = {
        'totalDiskSpace' : total
        'freeSpace' : free
        'diskStatus' : status
      }
      osReport(OSOBJ, socket)
    )

  buildReport = (socket) ->
    buildDiskReport(socket)


  repeater = (socket) ->

    setInterval( ->
      buildReport(socket)
    , 2000)

  start = ->
    console.log 'grab info from myself'
    io.sockets.on('connection', (socket) ->
      console.log 'im in the connection'
      repeater(socket)
    )


  spy : start
)



module.exports.Bond = new Bond()