/***********************************
 ***        MelonStock           ***
 ***********************************
 * Author: Aaron Griffin           *
 **********************************/

// app setup

	const express = require('express')
	const app = express()
	var port    =   process.env.PORT || 8080;
	var mongoose = require('mongoose');
	var passport = require('passport');
	var flash    = require('connect-flash');
	const fileUpload = require('express-fileupload');
	var pdfreader = require('pdfreader');

	var morgan       = require('morgan');
	var cookieParser = require('cookie-parser');
	var bodyParser   = require('body-parser');
	var session      = require('express-session');
	var User = require('./models/user.js')

	var configDB = require('./config/database.js');
	// configuration ===============================================================
	mongoose.connect(configDB.url); // connect to our database

	require('./config/passport')(passport); // pass passport for configuration
 // App Settings
	// set up our express application
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(bodyParser()); // get information from html forms
	app.use(fileUpload());


	// setup views
	app.use('/static', express.static('static'));
	app.set('view engine', 'ejs'); 

	// required for passport
	app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session


 // App Routes
	app.get('/', isLoggedIn, function(req, res) {
		res.render('index', 
		{
			user: req.user
		})
	});

	// PROFILE
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile',
		{
			user: req.user
		})
	});

	app.post('/profileEdit', isLoggedIn, function(req, res){
		switch(req.body.field){
			case 'firstName': 
				req.user.info.firstName = req.body.data;
				req.user.save(function(err){
					if(err){
						res.status(500).send();
					}
				});
				res.status(200).send();
				break;
			case 'lastName' :
				req.user.info.lastName = req.body.data;
				req.user.save(function(err){
					if(err){
						res.status(500).send();
					}
				});
				res.status(200).send();
				break;
		}
	});

	app.get('/adminDashboard', isLoggedIn, function(req, res) {
        if (req.user.userType != 'root') {
            res.send('You are NOT authorised for this!')
        } else {
            res.render('adminDashboard', {
                user: req.user,
                text: []
            })
        }
    });

	app.post('/pdfExtract', isLoggedIn, function(req, res) {
		if (!req.files)
			return res.status(400).send('No files were uploaded.');
		 
		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		let file = req.files.fileData;

		file.mv('./pdfFiles/temp.pdf', function(err) {
		    if (err)
		      return res.status(500).send(err);
		 
		    // res.send('File uploaded!');
		  });

		var rows = {};
		var rettt = []
		function printRows() {
			var str = '';
		  	Object.keys(rows) // => array of y-positions (type: float) 
		    	.sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions 
		    	.forEach((y) => str += (rows[y] || []).join('\n')/*console.log((rows[y] || []).join(''))*/);
		    	// console.log(str);
		    return str;
		}
		var retString = '';
		new pdfreader.PdfReader().parseFileItems('./pdfFiles/temp.pdf', function(err, item){
		  if (!item || item.page) {
		    // end of file, or page 
		    if(item.page == 4 || item.page == 5){ 
		    	// retString += printRows();
		    	// console.log(rows)
		    	rettt[item.page] = rows;
		    	console.log(rettt)
			}
		    console.log('PAGE:', item.page);
		    rows = {}; // clear rows for next page 
		  }
		  else if (item.text) {
		    // accumulate text items into rows object, per line 
		    (rows[item.y] = rows[item.y] || []).push(item.text);
		  }
		});
		console.log(retString)

		res.render('adminDashboard', {
			user : req.user,
			text : rettt
		})

	});














    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('rootSignup.ejs', { message: req.flash('signupMessage') });
    }); 
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/userMGMT', isLoggedIn, function (req, res) {
		if(req.user.auth.modifyAllUsers){
            User.find({}, function (err, users) {
                res.render('userManagement.ejs', {
                    user: req.user,
                    userList: users
                })
            })

		} else if(req.user.auth.modifyStoreUsers) {
			// TODO:Render store user management

        }else{
			// Unauth, send error!
			// TODO: Create type based error page
			res.status(500).send();
		}
    });

    app.get('/editUser/:id', isLoggedIn, function (req, res) {
        if(req.user.auth.modifyAllUsers){
            User.findById(req.params.id, function (err, u) {
                res.render('editUser.ejs', {
                    user: req.user,
                    userEdit: u
                })
            })

        } else if(req.user.auth.modifyStoreUsers) {
            // TODO:Render store user management

        }else{
            // Unauth, send error!
            // TODO: Create type based error page
            res.status(500).send();
        }
    })






	// Route API

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    if(req.method == "GET"){
	    	res.redirect('/login');
		}else if(req.method == 'POST'){
			res.status(403).send("User is not authenticated")
		}
	}



// Run App

	app.listen(port, function(){
		console.log('Server Listening on port `port`')
	});
