
var MI6HQ = new Contra.Yoda({
  Routes: {
    '*' : 'always',
    'allservers' : 'all',
    'typespecific' : 'typespecific'
  },
  always : function(){
    console.log('always started')
  },
  all : function(){
    console.log('all');
    console.log(MI6agent);
    window.MI6 = new Goldeneye.MI6();
    MI6.reportAll(MI6agent);
  },
  typespecific: function(){
    console.log('type specific');
    console.log(MI6agent);
    window.MI6 = new Goldeneye.MI6();
    MI6.reportSpecific(MI6agent);
  }
})