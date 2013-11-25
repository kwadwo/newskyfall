
var MI6HQ = new Contra.Yoda({
  Routes: {
    '*' : 'always',
    'allservers' : 'all',
    'typespecific' : 'typespecific'
  },
  always : function(){
    havePermission = window.webkitNotifications.checkPermission();
    if(havePermission == 0){
      $('#setNotify').hide();
    }
    window.MI6 = new Goldeneye.MI6();
    console.log('always started')
    $('#setNotify').click(MI6.allowNotify);

  },
  all : function(){
    console.log('all');
    console.log(MI6agent);
    MI6.reportAll(MI6agent);

  },
  typespecific: function(){
    console.log('type specific');
    console.log(MI6agent);
    
    MI6.reportSpecific(MI6agent);
  }
})