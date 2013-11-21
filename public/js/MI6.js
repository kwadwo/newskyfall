var Goldeneye = Goldeneye || {};

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
Goldeneye.MI6 = (function(){
  var
  SOCKETS = new Array(),
  serverTemp = _.template($('#serverTemp').html())
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
  updateView = function(sock,data){
    if(sock.count < 2){
      console.log(sock.count);
    }
    var parent = $('#' + sock.name ).children('.serverInfo'),
    loadAverage = parent.find('.loadAverage1'),
    latestLoad = parseFloat(data.loadAvg[0]).toFixed(2);
    loadAverage.html(latestLoad);

    //console.log(data);
  }

  buildView = function(serv,sock,data) {
    console.log(data);
    
    buildBox(serv);
    updateView(sock,data);

  }
  buildBox = function(serv){
    var serv = serv,
      comp = serverTemp(serv);
    $('#main .container-fluid').append(comp);

  },
  buildObj = function(list, property){
    _.each(list,function(serv){

      var socket = io.connect("http://" + serv.address + ":3007", {'force new connection': true});
      //socket.on('connection'});
      socket.name = property + '-' + serv.name;
      serv.property = property + "-" + serv.name;
      SOCKETS.push(socket);
      socket.count = 0;
      socket.on('serverInfo',function(data){
        if(socket.count === 1){
          console.log('secondtime around')
          updateView(socket,data)
        }else{
          socket.count = socket.count + 1;
          buildView(serv,socket,data)
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