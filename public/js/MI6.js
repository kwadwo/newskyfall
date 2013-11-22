var Goldeneye = Goldeneye || {};

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
Goldeneye.MI6 = (function(){
  var
  SOCKETS = new Array(),
  serverTemp = _.template($('#serverTemp').html()),
  colors = ['#c0392b','#ecf0f1'],
  width = 460,
  height = 300,
  radius = Math.min(width, height) / 2,

  setArc = function(arc, percent) {
    var angle = 75;
    var radius = 75;

    var path = "M200,200";
    for(var i = 0; i <= percent; i++) {
        angle -=3.6;
        angle %= 360;
        var radians= (angle/180) * Math.PI;
        var x = 100 + Math.cos(radians) * -1 * radius;
        var y = 100 + Math.sin(radians) * radius;
        if(i==0) {
            path += ' M ' + x + ' ' + y;
        }
        else {
            path += ' L ' + x + ' ' + y;
        }
    }

    arc.attr('d', path);
  },

  init = function(servers, type){
    console.log('MI6 Reporting');
  },
  initSpecific = function(servers){
    console.log(servers);

  },
  initAll = function(servers){
    $('#main .container-fluid').empty();
    var Foundation = servers[0].Foundation_Servers,
        Pinnacle = servers[0].Pinnacle_Servers;

    buildObj(Foundation,MI6agent[0].Property);
    buildObj(Pinnacle,MI6agent[0].Property);


  },

  updateView = function(serv,sock,data){
    if(sock.count < 2){
    }
    var parent = $('#' + sock.name ).children('.serverInfo'),
    loadAverage = parent.find('.loadAverage1'),
    svg = $('#' + serv.property).find('.memUsage'),
    latestLoad = parseFloat(data.loadAvg[0]).toFixed(2);
    loadAverage.html(latestLoad);
    freshData = [data.freeMem,data.totalMem];

    var used = data.totalMem - data.freeMem;

    //console.log(data);
    var percent = used / data.totalMem;
    percent = Math.floor(percent * 100);
    var fill = svg.find('path').last();
    console.log(percent);

    setArc(fill, percent/ 100 * 90);
  }

  buildView = function(serv,sock,data) {

    buildBox(serv,data);
    updateView(serv,sock,data);

  }
  buildBox = function(serv,data){
    var serv = serv,
      comp = serverTemp(serv),
      data = [data.freeMem,data.totalMem];
    $('#main .container-fluid').append(comp);
    var pWidth = $('#' + serv.property).width()
        svg = $('#' + serv.property).find('.memUsage');
    
    var back = svg.find('path').first();
    var fill = svg.find('path').last();
    setArc(back, 90)
    setArc(fill, 1)

  },
  buildObj = function(list, property){
    _.each(list,function(serv){

      var socket = io.connect("http://" + serv.address + ":3007",
        {
          'force new connection': true,
          'reconnect': true,
          'reconnection delay': 500,
          'max reconnection attempts': 10
        }
      );
      //socket.on('connection'});
      socket.name = property + '-' + serv.name;
      serv.property = property + "-" + serv.name;
      SOCKETS.push(socket);
      socket.count = 0;
      socket.on('serverInfo',function(data){
        if(socket.count === 1){
          updateView(serv,socket,data);
        }else{
          socket.count = socket.count + 1;
          buildView(serv,socket,data);
        }

      });

    });
    

  };

  return {
    report:init,
    reportAll: initAll,
    reportSpecific : initSpecific,
    SOCKETS: SOCKETS
  }
})