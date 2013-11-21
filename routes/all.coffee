


goldmember = 'money'
crypto = require('crypto')

oddjob = crypto.createHash('sha512').update(goldmember).digest('hex')
capitaliseFirstLetter = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)

# Intro Page

exports.index = (req,res) ->
  cookie = req.cookies.bond
  console.log serverlist
  servObj = JSON.stringify(serverlist)

  res.render('index', {title: 'GoldenEye', body_class: 'home', servers: serverlist, serverObj: servObj})


### Starts Login Logic ###

exports.login = (req, res) ->
  cookie = req.cookies.bond
  if cookie is undefined

    res.render('login', {title: 'GoldenEye', body_class: 'login', errors:''});
  else

    res.redirect('/')

exports.logout = (req ,res) ->
  cookie = req.cookies.bond
  if cookie is undefined
    res.render('login',
      {
        title: 'GoldenEye'
        body_class: 'login'
        errors:''
      }
    )
  else
    res.clearCookie('bond');
    res.redirect('/login');

exports.signin = (req,res) ->

  username = req.body.username
  password = req.body.password
  reggy = '.+@(thrillist|jackthreads)\.com$'
  pattern = new RegExp(reggy)
  un = pattern.test(username)
  pw   = crypto.createHash('sha512').update(password).digest('hex')
  hun = crypto.createHash('sha512').update(username).digest('hex')

  if un

    if pw is oddjob
      console.log 'yes!'
      res.cookie('bond', hun ,
        {
          maxAge: 900000,
          httpOnly: true
        }
      )
      res.redirect('/')

    else

      console.log 'fuck you scumbag'
      res.render('login',
        {
          title: 'GoldenEye'
          body_class: 'login'
          errors: '/images/newman.gif'
        }
      )

  else
    console.log 'fuck you scumbag'
    res.render('login',
      {
        title: 'GoldenEye'
        body_class: 'login'
        errors: '/images/newman.gif'
      }
    )

### Ends Login Logic ###


### Starts Company Specific stuff ###

exports.companyspecific = (req,res) ->
  company = req.route.params.company
  type = req.route.params.type
  Soldiers = _.where(serverlist,{'Property': company})

  if type is undefined
    console.log Soldiers
    servObj = JSON.stringify(Soldiers)
    res.render('propertyindex',{title: company, body_class: 'allservers', errors:'',serverObj: servObj})
  else
    type = capitaliseFirstLetter(type)
    servObj = JSON.stringify(Soldiers[0][type + '_Servers'])
    res.render('propertyindex',{title: company + ' : ' + type, body_class: 'typespecific', errors:'',serverObj: servObj})


