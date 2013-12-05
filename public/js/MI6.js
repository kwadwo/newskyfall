var Goldeneye = Goldeneye || {};

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
Goldeneye.MI6 = (function(){
  var
  SOCKETS = new Array(),
  w = 270,
  h = 170,
  r = Math.min(270, 250) / 2,
  dur = 750,
  color = ['#c0392b','#ecf0f1'],
  DONUTS = {},
  ARCS = {},
  CPUTIMES = {},
  arc = d3.svg.arc().innerRadius(r - 10).outerRadius(r - 20),
  serverTemp = _.template($('#serverTemp').html()),
  colors = ['#c0392b','#ecf0f1'],
  width = 460,
  height = 300,
  radius = Math.min(width, height) / 2,
  havePermission = window.webkitNotifications.checkPermission(),


  allowNotify = function(e) {
    e.preventDefault();
    if (havePermission == 0) {
      console.log('already have permission')
    }else{
      window.webkitNotifications.requestPermission();
    }
  }
  notifyError = function(box,errormsg) {
    if (havePermission == 0) {
      // 0 is PERMISSION_ALLOWED

      var notification = window.webkitNotifications.createNotification(
        'http://i.stack.imgur.com/dHl0.png',
        'Goldeneye Warning!',
        errormsg
      );
      
      notification.onclick = function () {
        //window.open("http://stackoverflow.com/a/13328397/1269037");
        notification.close();
      }
      notification.show();
    } else {
        window.webkitNotifications.requestPermission();
        console.log('no permission');

    }

  },

  updateChart = function(donut,arcs,value) {
    colors['#2ecc71','#ecf0f1']
    arcs = arcs.data(donut([value, 100 - value])); // recompute angles, rebind data
    arcs.transition().ease("elastic").duration(450).attrTween("d", arcTween);
    console.log(arcs[0]);
    
    
  },
  // Store the currently-displayed angles in this._current.
// Then, interpolate from this._current to the new angles.
  arcTween = function (a) {

      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
          return arc(i(t));
      };
  },

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

  
  calcCoreTimes = function(cpus, id){
    _.each(cpus,function(cpu,i){
      var times = cpu.times;
      console.log(CPUTIMES);
      var TotalTime = (times.user - CPUTIMES[id][i].user) + (times.sys - CPUTIMES[id][i].sys) + (times.idle - CPUTIMES[id][i].idle);
      var total = 0,
          nTotal = (times.user - CPUTIMES[id][i].user)  + (times.sys - CPUTIMES[id][i].sys) ;
      var percent = Math.round(100 * (nTotal) / (TotalTime ));
      console.log(CPUTIMES[id][i])

      var box = $('#' + id ).find('.coresHolder')
      , theCore = box.find('#cpu' + i);
      theCore.html(percent + '%');
      if (percent > 99){
        //notifyError(id,'this core is running hot');
        theCore.addClass('error')
      }else {
        theCore.removeClass('error')
      }
     CPUTIMES[id][i].user = times.user;
     CPUTIMES[id][i].sys = times.sys;
     CPUTIMES[id][i].idle = times.idle;

    })
    

  },

  calcDiskSpace = function(id,disk){
    var parent = $('#' + id),
        parentW = parent.width() - 20,
        diskArea = parent.find('.diskSpace'),
        used = disk.totalDiskSpace - disk.freeSpace,
        percent = used / disk.totalDiskSpace,
        percent = Math.floor(percent * 100);
    diskArea.find('.precent').css('width',parentW -140);
    diskArea.find('.value').css('width',percent + "%");
    diskArea.find('.numPercent').html(percent);
    if(percent > 75 ) {
      diskArea.find('.value').css('background',"#c0392b");
    }else{
      diskArea.find('.value').css('background',"#2ecc71");
    }


  },
  updateView = function(serv,sock,data){
    if(sock.count < 2){
    }
    var parent = $('#' + sock.name ).children('.serverInfo'),
    loadAverage = parent.find('.loadAverage1 .value'),
    svg = $('#' + serv.property).find('.memUsage'),
    latestLoad = parseFloat(data.loadAvg[0]).toFixed(2);
    loadAverage.html(latestLoad);
    freshData = [data.freeMem,data.totalMem];

    var used = data.totalMem - data.freeMem;

    //console.log(data);
    var percent = used / data.totalMem;
    percent = Math.floor(percent * 100);

    //var fill = svg.find('path').last();
    console.log(percent);
    var throttledMsg = _.throttle(function(){notifyError(parent, 'Getting Hot in hurrrr')}, 6000);
    if(percent > 80){
      $('#' + sock.name).find('.serverInfo').addClass('error');
      throttledMsg();


      
    }else{
      
    }
    updateChart(DONUTS[serv.property],ARCS[serv.property],percent);

    calcCoreTimes(data.Cpus,serv.property);
    calcDiskSpace(serv.property,data);
    //setArc(fill, percent/ 100 * 90);
  }

  buildView = function(serv,sock,data) {

    buildBox(serv,data);
    updateView(serv,sock,data);

  }

  buildBox = function(serv,data,info){
    var serv = serv,
      comp = serverTemp(serv),
      rData = data,
      data = [data.freeMem,data.totalMem],
      id = serv.property;
    $('#main .container-fluid').append(comp);
    var parent = $('#' + serv.property)
    ,   pWidth = parent.width()
    ,   svghold = parent.find('.memUsage')
    ,   cpuHold = parent.find('.coresHolder')
    ,   placehold = '#' + serv.property + ' .memUse'
    ,   svg = d3.select(placehold).append("svg:svg")
          .attr("width", w).attr("height", h);

    CPUTIMES[id] = {}
    // calculate the cpu info
    _.each(rData.Cpus,function(cpu,i){
      CPUTIMES[id][i] = {}
      CPUTIMES[id][i].user =  cpu.times.user
      CPUTIMES[id][i].sys  = cpu.times.sys
      CPUTIMES[id][i].idle = cpu.times.idle
      parent.find('.coresHolder').append('<div class="core" id="cpu' + i +'"></div>');
    });

    calcCoreTimes(rData.Cpus,serv.property);
    calcDiskSpace(id,rData);
    DONUTS[serv.property] = d3.layout.pie().sort(null).startAngle(.75 * 2*Math.PI).endAngle(1.25 * 2*Math.PI);
    var arc_grp = svg.append("svg:g")
      .attr("class", "arcGrp")
        .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")")
        .attr("cx", 50)
        .attr("cy", 50);
    ARCS[serv.property] = arc_grp.selectAll("path")
      .data(DONUTS[serv.property]([0, 100]))
      .attr('cx',50);

    ARCS[serv.property].enter().append("svg:path").attr("fill", function(d, i) {
        return color[i];
    }).attr("transform", "translate(-2,50)").attr("d", arc).each(function(d) {
        this._current = d;
    }).transition().duration(dur).ease("elastic").attrTween("d", arcTween);

    ARCS[serv.property].transition().duration(dur).ease("elastic").attrTween("d", arcTween);

    ARCS[serv.property].exit();

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
  },
  init = function(servers, type){
    console.log('MI6 Reporting');
  },
  initSpecific = function(servers){
    console.log(servers);
    $('#main .container-fluid').empty();
    buildObj(servers,'Thrillist');
  },
  initAll = function(servers){
    $('#main .container-fluid').empty();
    var Foundation = servers[0].Foundation_Servers,
        Pinnacle = servers[0].Pinnacle_Servers;

    buildObj(Foundation,MI6agent[0].Property);
    buildObj(Pinnacle,MI6agent[0].Property);


  };

  return {
    report:init,
    reportAll: initAll,
    reportSpecific : initSpecific,
    allowNotify : allowNotify
  }
})