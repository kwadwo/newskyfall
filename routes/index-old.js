
/*
 * GET home page.
 */
var goldmember = 'money'
,		crypto = require('crypto')
, 	oddjob = crypto.createHash('sha512').update(goldmember).digest('hex')


exports.index = function(req, res){

	var cookie = req.cookies.bond;
  if (cookie === undefined){
  	res.redirect('/login');
  }else{
  	console.log(req.route.path);
		var fs = require('fs');
		fs.exists = fs.exists || require('path').exists;
		fs.existsSync = fs.existsSync || require('path').existsSync;
		var file = 'config/default.js';
		fs.exists(file, function(exists){
			var servers = exists ? require('../config/default').servers : {};
			res.render('index', {title: 'Skyfall', servers: servers, body_class: 'home'});
		});
	}
};


/*
 * GET stack page
 */

exports.stack = function(req, res){
	var stack = req.params.stack;
	var fs = require('fs');
	fs.exists = fs.exists || require('path').exists;
	fs.existsSync = fs.existsSync || require('path').existsSync;
	var file = 'config/' + stack + '.js';
	fs.exists(file, function(exists){
		if(exists){
			var config = require('../config/' + stack);
			if(config.servers){
				res.render('index', {title: 'Skyfall', servers: config.servers});
			}else{
				var header = stack + ' not properly configured';
				res.render('404', { status: 404, url: req.url, header: header });
			}
		}else{
			var header = stack + ' stack not found';
			res.render('404', { status: 404, url: req.url, header: header });
		}
	});
};


/*
 * GET server page
 */

exports.server = function(req, res){
	var split = req.params.server.split(':');
	var address = split[0];
	var port = split.length > 1 ? split[1] : 3007;
	res.render('server', {address: address, port: port});
};


exports.login = function(req, res){
	var cookie = req.cookies.bond;
  if (cookie === undefined){
  	res.render('login', {title: 'Skyfall', body_class: 'login', errors:''});
  }else {
  	res.redirect('/');
  }
};
exports.logout = function(req,res) {
	var cookie = req.cookies.bond;
  if (cookie === undefined){
  	res.render('login', {title: 'Skyfall', body_class: 'login', errors:''});
  }else {
  	res.clearCookie('bond');
  	res.redirect('/login');

  }
}
exports.signin = function(req,res){

	var username = req.body.username
	,		password = req.body.password
	,		reggy = '.+@(thrillist|jackthreads)\.com$'
	,		pattern = new RegExp(reggy)
	,		un = pattern.test(username)
	,		pw   = crypto.createHash('sha512').update(password).digest('hex')
	,   hun = crypto.createHash('sha512').update(username).digest('hex')

	if(un) {

		if(pw === oddjob){
			console.log('yes!');
			res.cookie('bond', hun , { maxAge: 900000, httpOnly: true });
			res.redirect('/');
		}else{
			console.log('fuck you scumbag');
			res.render('login', {title: 'Skyfall', body_class: 'login', errors: 'oh you dun fucked up now'});
		}

	}else{
		console.log('fuck you scumbag');
		res.render('login', {title: 'Skyfall', body_class: 'login', errors: 'badun'});
	}

}