var Contra;

Contra = Contra || {};

Contra.Yoda = (function() {
  "use strict";
  var nativeKeys;

  function Yoda(info) {
    this.process(info);
  }

  nativeKeys = Object.keys;

  Yoda.prototype.keys = nativeKeys || function(obj) {
    var key, keys;

    if (obj !== Object(obj)) {
      throw new TypeError("Invalid object");
    }
    keys = [];
    for (key in obj) {
      if (_.has(obj, key)) {
        keys[keys.length] = key;
      }
    }
    return keys;
  };

  Yoda.prototype.process = function(info) {
    this.methods = info;
    this.RouteVals = _.keys(this.methods.Routes);
    this.Routes = this.methods.Routes;
    return this.Router();
  };

  Yoda.prototype.findMethod = function(theRoute) {
    var obj;

    obj = this.Routes[theRoute];
    return this.methods[obj];
  };

  Yoda.prototype.routeReg = function(route) {
    var escapeRegExp, namedParam, splatParam;

    namedParam = /:\w+/g;
    splatParam = /\*\w+/g;
    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^/]+)").replace(splatParam, "(.*?)");
    if (route === '*') {
      return new RegExp('.*');
    } else {
      return new RegExp("^" + route + "$");
    }
  };

  Yoda.prototype.Router = function() {
    var action, i, pagetype, param, reggy, results, routes, _results;

    pagetype = $('body').attr('class');
    routes = this.RouteVals;
    i = 0;
    _results = [];
    while (i < routes.length) {
      reggy = this.routeReg(routes[i]);
      if (reggy.test(pagetype)) {
        results = reggy.exec(pagetype);
        action = this.findMethod(routes[i]);
        param = results;
        action(param);
      }
      _results.push(i++);
    }
    return _results;
  };

  return Yoda;

})();

/*
Router Boiler Plate :

// Instantiate a new yoda
Somevar = new Contra.Yoda({
  // Pass some Routes or in the contra terms of page type
     this is a key value system in which the key is the Contra.Settings.page  (the type of page)
     the value of this hash is a string representation of the method later defined in the instantiation
  //

  Routes: {
    'homepage': 'homeinit',
    'sale/:id/product/:saleid' : 'productPageinit'
  }

  homeinit : function (param){
    dosomething(param)
    $(function(){
      // I will only run when homepage is the type you are currently on!
      // Pass me a splat or param and i I will be sent back
      // By default i return the pagetype!
    });

  },

  productPageinit: function(id,saleid) {
    // I will now know what id and what saleid you asked for!
    // this part is not fully tested and may need to be expanded upon
  }

})
*/
