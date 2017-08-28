const User = require('./models/user');
const assert = require('assert');


module.exports = function(app, passport){
// render the main index page
app.get('/', function(req, res) {
        res.render('pages/index')
    });

// render the contact page
app.get('/contact', function(req, res) {
        res.render('pages/contact')
        });
//Local login routes
app.get('/login', function(req, res){
  		res.render('pages/login.ejs', { message: req.flash('loginMessage') });
  	  });
app.post('/login', passport.authenticate('local-login', {
  		successRedirect: '/profile',
  		failureRedirect: '/login',
  		failureFlash: true
  	  }));
//logout
app.get('/logout', function(req, res){
      		req.logout();
      		res.redirect('/');
      	});
// show the signup form
app.get('/signup', function(req, res) {
         res.render('pages/signup.ejs', { message: 'Get signed up!' });
     });
app.post('/signup',  passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true
    }),function(req, res){
      console.log(req.body.city);
      console.log(req.body.state);
    });
//Update get local only
app.get('/user', isLoggedIn, function(req, res){
      var user = req.user;
      res.render('pages/user.ejs', { message: 'Update location!' , user: req.user });
    });

//Update local user post
    app.post('/user', isLoggedIn, function(req, res){
      var user = req.body;
      var id = req.user._id;
      console.log(id);
      User.findOne({_id: id}, function(err, user){
        var newUser = user;
        console.log(user);
        user.local.username = req.body.email;
        user.local.city = req.body.city;
        user.state = req.body.state;

        user.save(function(err){
          if(err)
          throw err;
          console.log(user);
          res.render('pages/profile.ejs', { user: req.user  });
        })
      })
    });

//profile page
app.get('/profile', /*isLoggedIn,*/ function(req, res){
		res.render('pages/profile.ejs', { user: req.user });
});

//facebook login
app.get('/auth/facebook',  passport.authenticate('facebook', { scope: [ 'email' ] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/profile',
                                      failureRedirect: '/' }));

//twitter auth
app.get('/auth/twitter', passport.authenticate('twitter'));
//twitter callback
app.get('/auth/twitter/callback',
       passport.authenticate('twitter', { successRedirect : '/profile',
                                          failureRedirect : '/' }));

//google login
app.get('/auth/google',  passport.authenticate('google', { scope: [ 'profile', 'email' ] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect:'/profile',
                                    failureRedirect: '/' }));

// connect all sign in pages
app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

app.get('/connect/profile', passport.authenticate('twitter'));

app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

app.get('/connect/local', function(req, res){
	res.render('pages/connect-local.ejs', { message: req.flash('signupMessage')});
});

app.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect: '/profile',
	failureRedirect: '/connect/local',
	failureFlash: true
}));

//unlink all pages
app.get('/unlink/facebook', function(req, res){
		var user = req.user;
		user.facebook.token = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		})
	});

app.get('/unlink/twitter', function(req, res){
		var user = req.user;
		user.twitter.token = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		})
	});

	app.get('/unlink/local', function(req, res){
		var user = req.user;
    var city = req.city;
    var state = req.state;
    user.local.username = null;
		user.local.password = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		});
});

app.get('/unlink/google', function(req, res){
		var user = req.user;
		user.google.token = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		});
	});
  // render the settings page
  app.get('/myInfo',isLoggedIn, function(request, response) {
    request.user.getCustomData(function(err, data) {
      response.render('pages/settings');
    });
  });

  app.post('/updateInfo', isLoggedIn, function(request, response) {
    request.user.getCustomData(function(err, data) {
      data.city = request.body.city;
      data.state = request.body.state;
      data.save(function() {
        request.user.givenName = request.body.firstname;
        request.user.surname = request.body.lastname;
        request.user.save();
        response.redirect("/myInfo?updated=true");
      });
    });
  });
  //If logged in
  function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  };
  // render the add image page
  app.get('/add', isLoggedIn, function(req, res){
    console.log('Add image page');
    var user = req.user;
    if (req.user) {
      res.render('pages/add', { user : req.user });
    }});
    // clear the session
  app.get('/clearSession', function(req, res) {
    req.session.destroy(function(err) {
      // cannot access session here
    });
    res.json({"data":"cleared"});
    });
}
