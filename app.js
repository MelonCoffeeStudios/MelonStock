/***********************************
 ***        MelonStock           ***
 ***********************************
 * Author: Aaron Griffin           *
 **********************************/

// app setup

	const express = require('express')
	const app = express()
	var port    =   process.env.PORT || 8080;
    var server = require("http").createServer(app);
	var mongoose = require('mongoose');
	var passport = require('passport');
	var flash    = require('connect-flash');
	const fileUpload = require('express-fileupload');
	var pdfreader = require('pdfreader');

	var morgan       = require('morgan');
	var cookieParser = require('cookie-parser');
	var bodyParser   = require('body-parser');
	var session      = require('express-session');
	var User = require('./models/user.js');
	var Stock = require("./models/stock.js");
	var Sale = require("./models/sale");
	var Department = require("./models/department.js");
    var Barcode = require('barcode');
    var SimulateData = require("./simulateData");
    var io = require("socket.io")(server, {
        pingTimeout: 5000,
        pingInterval:1000
    });
    var async = require('async');



    var configDB = require('./config/database.js');
	// configuration ===============================================================
	mongoose.connect(configDB.url, {useMongoClient:true}); // connect to our database

	require('./config/passport')(passport); // pass passport for configuration
 // App Settings
	// set up our express application
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	// app.use(bodyParser()); // get information from html forms
	app.use(fileUpload());

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

	// setup views
	app.use('/static', express.static('static'));
	app.set('view engine', 'ejs'); 

	// required for passport
	app.use(session({ secret: 'BigLoveForAllThingsNode' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

    var printUsers = function () {
        console.log("ACTIVE USERS:")
        Object.keys(ACTIVE_USERS).forEach(function (user) {
            var U = ACTIVE_USERS[user];
            console.log("\tUSER:\n" +
                "\t\tSocketID:\t" + U.socket.id + "\n" +
                "\t\tUserID\t:\t" + (typeof U._id == "undefined"?"NONE":U._id) + "\n" +
                "\t\tStore\t:\t" + (typeof U.store == "undefined"?"NONE":U.store))
        })
    }

    var getUsersPerStore = function (clientStore) {
        var temp = {};
        if(clientStore == 0 || typeof clientStore == "undefined"){
            return ACTIVE_USERS_SEND;
        }else {
            Object.keys(ACTIVE_USERS_SEND).forEach(function (user) {
                if (ACTIVE_USERS_SEND[user].store == clientStore) {
                    temp[user] = ACTIVE_USERS_SEND[user];
                }
            })
            return temp;
        }
    }

    var ACTIVE_USERS = {};
    var ACTIVE_USERS_SEND = {}

    io.on("connection", function (client) {
        client.emit("authNow");
        ACTIVE_USERS[client.id] = {socket:client};
        ACTIVE_USERS_SEND[client.id] = {};

        client.on("joinStore", function (room) {
            if(ACTIVE_USERS[client.id].user) {
                if (ACTIVE_USERS[client.id].user.info.store == room) {
                    client.join(room)
                    ACTIVE_USERS[client.id].store = String(room);
                    ACTIVE_USERS_SEND[client.id].store = String(room);
                    printUsers()
                    client.broadcast.to(ACTIVE_USERS[client.id].store).emit("activeUsers", JSON.stringify(getUsersPerStore(room)))
                }
            }
        })

        client.on("setID", function (_id) {
            ACTIVE_USERS[client.id]._id = _id;
            ACTIVE_USERS_SEND[client.id]._id = _id;
            console.log("All Good");
            User.findById(_id, function (err, doc) {
                if(err){"Error Retrieving User from Socket _id"}
                ACTIVE_USERS[client.id].user = doc;
                ACTIVE_USERS_SEND[client.id].user = doc;
                ACTIVE_USERS[client.id].socket.emit("AuthSuccess")
                printUsers()
            })
        })

        client.on("update", function () {

            var clientStore = ACTIVE_USERS[client.id].store;
            var temp = getUsersPerStore(clientStore);
            client.emit("activeUsers", JSON.stringify(temp));

        })

        client.on("join", function (room) {
            client.join(room )
        })


        client.on("disconnect", function () {
            console.log("User: " + client.id +", disconnected");
            var store = ACTIVE_USERS_SEND[client.id].store;
            delete ACTIVE_USERS[client.id];
            delete ACTIVE_USERS_SEND[client.id];
            client.broadcast.to(store).emit("activeUsers", JSON.stringify(getUsersPerStore(store)))
            printUsers()
        })
        printUsers()
    })




 // App Routes
	app.get('/', isLoggedIn, function(req, res) {
		res.render('index', {
			user: req.user
		})
	});

	app.get('/pos', isLoggedIn, function (req, res) {
	    if(!req.user.currentSale){
            var sale = new Sale({
                userID  :   req.user.info.userID,
                userName:   req.user.info.firstName
            });
            sale.save(function (err) {
                if(err){console.log(err);}else{
                    req.user.currentSale = sale._id;
                    req.user.save(function (err2) {
                        if(err2){console.log(err2)}else{
                            res.render('pos', {
                                user:	req.user
                            });
                        }
                    })

                }
            });

        }else {

            res.render('pos', {
                user: req.user
            });
        }

    });
	
	app.post('/sale/subTotal', isLoggedIn, function (req, res) {
        if(req.user.currentSale === req.body._id) {
            Sale.subTotal(req.body, function (err, doc) {

            })
        }
    });

	app.post('/sale/retrieve', isLoggedIn, function (req, res) {
        if(req.body._id === req.user.currentSale){
            Sale.findOne({_id:req.user.currentSale}, function (err, doc) {
                res.send(err?{err:true, errMsg: err}: doc);
            })
        }
    });

	app.get("/supplier/dashboard", isLoggedIn, function (req, res) {
       res.render("supplier", {
           user :   req.user
       })
    });

	app.get("/supplier/add", isLoggedIn, function (req, res) {
       res.render("addSupplier", {
           user :   req.user
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

            case 'store' :
                req.user.info.store = req.body.data;
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
		// noinspection JSAnnotator
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

            // Object.keys(rows).sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
		    	// .forEach((y) => str += (rows[y] || []).join('\n')/*console.log((rows[y] || []).join(''))*/);
		    	// // console.log(str);
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

	app.get('/editUser/:id', isLoggedIn, function (req, res) {
        User.findById(req.params.id, function (err, u) {
            res.render('editUser.ejs', {
                user: req.user,
                userEdit: u
            })
        })
});

	app.get('/addUser', isLoggedIn, function (req, res) {
		auth('user', req.user, function (level) {
            res.render('addUser', {
            	user	: req.user,
				level	: level
			})
        })
    });


	app.get('/error/:code', function (req, res) {
		switch(req.params.code){
			case '401':
				res.render('error', {
					code: 401,
					text: 'You are unauthorised to access this area! Please contact your system administrator.'
				});
				break;
		}
    });


	app.get('/userManagement', isLoggedIn, function (req, res) {
		// if(req.user.auth.modifyAllUsers){
			User.find({}, function (err, users) {
				res.render('userManagement.ejs', {
					user: req.user,
					userList: users
				})
			})

		// } else if(req.user.auth.modifyStoreUsers) {
			// TODO:Render store user management

		// }else{
			// Unauth, send error!
			// TODO: Create type based error page
			// res.status(500).send();
		// }
	});

	app.get("/ranging", isLoggedIn, function (req, res) {
		if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
		    Stock.find({}, function (err, stock) {
		        if(!err) {
                    res.render("ranging.ejs", {
                        user: req.user,
                        stock: stock
                    })
                }else{
                    res.render("ranging.ejs", {
                    user        :   req.user,
                        stock   :   null
                    })
                }
            });
		}
    });

    app.get("/addStock", isLoggedIn, function (req, res) {
        if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
            Department.find({}, function (err, docs) {
                if(!err){
                    if(!req.query.good) {
                        res.render("addStock.ejs", {
                            user: req.user,
                            deps: docs
                        })
                    }else {
                        res.render("addStock.ejs", {
                            user: req.user,
                            deps: docs,
                            action  :   {
                                type: notify
                            }
                        })
                    }
                }else {throw err;}
            })

        }
    });

    app.post("/stock/genSKU", isLoggedIn, function (req, res) {
        if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
            var newStock = new Stock({shortTitle:"EMPTY", empty: true}); // CREATE Empty Stock (SKU should be auto genned)
            newStock.save(function (err, saved) {
                res.send({sku: saved.sku, id: saved._id});
            });

        }
    });

    app.post("/stock/get", isLoggedIn, function (req, res) {
        var page = 1;
        var pageLimit = 25;
        if(req.body.pageLimit){
            pageLimit = req.body.pageLimit;
        }
        if(req.body.page){
            page = req.body.page;
        }
        
        Stock.findPaginated({},function (err, docs) {
            // docs.documents.forEach(function (doc, i, arr) {
            //     arr[i].barcodeImg = [];
            //     doc.barcode.forEach(function (b) {
            //         console.log(b);
            //         var code128 = Barcode('code128', {
            //             data:   "" + b,
            //             width: 600,
            //             height: 125
            //         });
            //         code128.getBase64(function (err, b64) {
            //             if(!err){
            //                 console.log(b64);
            //                 arr[i].barcodeImg.push(b64)
            //             }else {
            //                 console.log(err);
            //             }
            //
            //
            //         })
            //     })
            // });

            res.send(err?{err:true, errMsg:err}:docs);
        },pageLimit, page);
    });

    app.post("/stock/genBarcode/:sku", isLoggedIn, function (req, res) {
        Stock.findOne({sku:req.params.sku}, function (err, doc) {
            if(!err) {
                var code128 = Barcode('code128', {
                    data: "" + doc.barcode[0],
                    width: 400,
                    height: 100
                });
                code128.getBase64(function (err, b64) {
                    if (!err) {
                        console.log(b64);
                        doc.barcodeImg = b64;

                        doc.save(function (err) {
                            res.send(err?{err:true, errMsg:err}:doc);
                        })
                    } else {
                        console.log(err);
                    }
                })
            }
        })
    });

    app.post("/stock/get/:query", isLoggedIn, function (req, res) {
        var q = req.params.query;
        var query = /q/i;
        var page = 1;
        var pageLimit = 25;
        if(req.body.pageLimit){
            pageLimit = req.body.pageLimit;
        }
        if(req.body.page){
            page = req.body.page;
        }
        console.log("Query: " + q);

        Stock.findPaginated({
            fullTitle   :   {
                $regex  :   req.params.query,
                $options:   "i"
            }
        }, function (err, docs) {
            console.log(docs);
            res.send(err?{err:true, errMsg: err}: docs);
        }, pageLimit, page)
    });

    app.post("/stock/barcode/:barcode", isLoggedIn, function (req, res) {
        Stock.findOne({barcode:req.params.barcode}, function (err, doc) {
            console.log(doc);
            if(err){
                res.send({err:true,errMsg:err});
            }else if(doc == null){
                res.send({err:true, errMsg:"Stock not found"})
            }else{
                Sale.addItem(req.user.currentSale, doc, req.params.barcode, function (err, sale) {
                    res.send(err?{err:true, errMsg: err}:sale);
                })
            }
        })
    });

    app.post("/stock/add", isLoggedIn, function (req, res) {
        if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
            console.log(req.body);
            if(req.body._id) {   // IF AUTO-GEN
                Stock.findById(req.body._id, function (err, stock) {
                    stock.empty = false;
                    stock.supplier = req.body.supplier;
                    stock.barcode.push(req.body.barcode);
                    stock.shortTitle = req.body.shortTitle;
                    stock.fullTitle = req.body.fullTitle;
                    stock.price =  req.body.price;
                    stock.size = req.body.size;
                    stock.dep = req.body.dep;
                    stock.subDep = req.body.subDep;
                    if(req.body.width && req.body.height && req.body.depth){
                        stock.dimensions = {
                            width   :   req.body.width,
                            height  :   req.body.height,
                            depth   :   req.body.depth
                        }
                    }

                    stock.save(function (err) {
                        if(!err){
                            res.redirect("/addStock?good")
                        }else {
                            res.send({err:true, errMsg:err});
                        }
                    })

                })
            }else{  // IF NEW STOCK
                Stock.find({sku:req.body.sku}, function (err, docs) {
                    if(!err){
                        if(!docs.length){
                            var stock = new Stock();

                            stock.empty = false;
                            stock.supplier = req.body.supplier;
                            stock.barcode.push(req.body.barcode);
                            stock.shortTitle = req.body.shortTitle;
                            stock.fullTitle = req.body.fullTitle;
                            stock.price =  req.body.price;
                            stock.size = req.body.size;
                            stock.dep = req.body.dep;
                            stock.subDep = req.body.subDep;
                            if(req.body.width && req.body.height && req.body.depth){
                                stock.dimensions = {
                                    width   :   req.body.width,
                                    height  :   req.body.height,
                                    depth   :   req.body.depth
                                }
                            }

                            stock.save(function (err) {
                                if(!err){
                                    res.redirect("/addStock?good")
                                }else {
                                    res.send({err:true, errMsg:err});
                                }
                            });
                        }else{
                            res.send({err:true, errMsg:"SKU already exists!"})
                        }
                    }
                });
            }
        }
    });

    app.post("/departments/addDep", isLoggedIn, function (req, res) {
        if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
            var newDep = new Department(
                {
                    departmentName  :   req.body.departmentName,
                    departmentNum   :   req.body.departmentNum
                });
            newDep.save(function (err) {
                if(!err){
                    res.send({err:false})
                }
            })
        }
    });

    app.post("/departments/addSubDep", isLoggedIn, function (req, res) {
        if(req.user.userType === "range" || req.user.userType === "ho" || req.user.userType === "root"){
            console.log(req.body.depNum)
            Department.addSubDep(req.body.depNum, req.body.subDepName, req.body.subDepNum, function (cb) {
                res.send(cb);
            })

        }
    });

    app.get("/departments/getDep/:id", isLoggedIn, function (req, res) {
        Department.findOne(
            {
                departmentNum   : req.params.id
            }, function (err, doc) {
                if(!err) {
                    res.send(doc);
                }else {
                    res.send({err:true,})
                }
            })
    });


    app.get("/planData", isLoggedIn, function (req, res) {
        Department.find({}, function (err, docs) {
            if(!err){
                if(!req.query.good) {
                    res.render("planData.ejs", {
                        user: req.user,
                        deps: docs
                    })
                }else {
                    res.render("planData.ejs", {
                        user: req.user,
                        deps: docs,
                        action  :   {
                            type: notify
                        }
                    })
                }
            }else {throw err;}
        })
        // res.render("planData.ejs");
    });

    app.post("/planData", isLoggedIn, function (req,res) {
        var data = req.body.data;
        data = data.split("\n");
        var max = data.length;
        var cur = 0;
        async.eachSeries(data, function (line, done) {
            line = line.split(",");
            console.log(cur+"/"+max + ": " + line[0]);
            if(!Number.isNaN(parseInt(line[0]))){

                cur++;
                Stock.findOne({barcode:parseInt(line[0])}, function (err, doc) {
                    if(err){
                        console.log(err);
                    }
                    if(!doc){
                        console.log("No stock found for barcode: " + line[0])
                        done();
                    }else{
                        doc.SIM_Qty_Sold = parseInt(line[2]);
                        doc.save(function (err) {
                            done();
                        })
                    }
                })
            }else{
                done();
            }

        }, function (err) {
            res.send(200)
        })
    })

    app.post("/planDataNewer", isLoggedIn, function (req, res) {
        var data = req.body.data;
        data = data.split("\n");
        var dep = req.body.dep;
        var subdep = req.body.subdep;
        data.forEach(function (value) {
            value = value.split("\t");
            var s = new Stock();
            s.barcode = value[0];
            s.fullTitle = value[1];
            s.shortTitle=value[1];
            s.dep = dep;
            s.subDep = subdep;
            s.price = value[10];
            console.log(value);
            s.save(function (err) {
                if(err){
                    console.log("ERROR" + err)
                }
            })


        })
        res.send("Done")
    })

    app.post("/planDataOLD", isLoggedIn, function (req, res) {
        var data = req.body.data;
        data = data.split("\n");
        var newData = [];
        var re = /\d[^ ]*|".*?"|(^|\s+)\w(\s+|$)/gi;
        for(var i = 0; i < data.length; i++){
            var tmp = data[i].match(re);
            var s = new Stock();
            var o = {};

            s.barcode = tmp[6];
            s.shortTitle = (tmp[7].replace("\"", ""));
            s.complete = false;
            s.fullTitle = s.shortTitle;

            var x = s.shortTitle.split(" ");
            s.supplier = x[0];
            s.size = ((tmp[8] + tmp[9]).replace(" ", ""));
            s.price = (Math.random() * 10).toFixed(2);
            newData[i] = s;

            s.save(function (err) {
                if(err){
                   console.log("ERROR" + err)
                }
            })

        }
        res.send(newData);
    });


    app.post("/weirdData", function (req, res) {
        var text = req.body.data;
        var items = {};
        var i = 0;
        var j = 0;
        var tmp = text.split("\n");
        tmp.forEach(function (item) {
            var obj = item.split(",");
            // console.log(obj);
            if(!items[obj[0]]){
                // console.log(obj[0]);
                items[obj[0]] = {};
                items[obj[0]].sku = obj[0];
                items[obj[0]].fullTitle = obj[1];
                items[obj[0]].price = obj[2];

                var s = new Stock({fullTitle: obj[1], price:obj[2]});
                s.save(function (err) {
                    if(err){
                        console.log(err);
                        console.log(item);
                    }
                })
                j++;
            }else{
                i++;
            }
        })
        console.log("Number of Dupes: ", i);
        console.log("Out of: ", tmp.length);
        res.send(items);
    });


 var simOptions = {
     A : 1.1,
     B : 10,
     YOffset : 100,
     D : 0.00012,
     E : 29.6,
     PHASE : 35,
     mult : 10,
     round : true,
     noise : false,
     noiseMult: 10
 };



    {       ///// SIMULATE DASHBOARD
        app.get("/simDash", isLoggedIn, function (req, res) {
            res.render("SimDash.ejs",
                {
                    user:req.user
                }
                )
        })

        app.post("/sim/runSim", isLoggedIn, function (req, res) {
            var dayPattern = [0.5367,0.3111,0.1974,0.0884,0.0018,0.0001,0.0015,0.3025,2.0201,2.6901,4.7209,6.8918,10.4405,10.7798,8.2832,8.6083,8.7329,9.2582,7.4610,5.6966,4.7835,4.1838,3.2093,0.8006];
            var s = new SimulateData("HI",365, dayPattern, io);

            // console.log(req.body);
            if(JSON.parse(req.body.options) == true){
                console.log("Options: true");
                var options = req.body.ops;
                s.setOptions(options.A,
                    options.B,
                    options.YOffset,
                    options.D,
                    options.E,
                    options.PHASE,
                    options.mult,
                    options.round,
                    options.noise,
                    options.noiseMult)
            }
            simOptions=s.linear;
            // console.log(s.linear)
            res.send(200);
            s.run(function (result) {
                // res.send(result);
            });
        })

        app.get("/sim/allDeps", isLoggedIn, function (req, res) {
            Department.find({}, function (err, docs) {
                res.send(docs);
            })
        })

        app.post("/sim/getDepStocks", isLoggedIn, function (req, res) {
            if(req.body.subDep){
                Sale.find({items: {dep:req.body.dep, subDep:req.body.subDep}}, function (err, docs) {
                    if(err){console.log(err)}
                    res.send(docs);
                })
            }else{
                Sale.find({items: {$elemMatch: {dep:req.body.dep}}}, function (err, docs) {
                    if(err){console.log(err)}
                    res.send(docs);
                })
            }
        })

        app.get("/sim/allSales", isLoggedIn, function (req, res) {
            Sale.find({}, function (err, docs) {
                if(err){
                    console.log(err);
                }
                console.log(docs.length);
            })
        })

        app.post("/sim/salesPerBarcode", isLoggedIn, function (req, res) {
           var bc = req.body.barcode;
           Sale.collection.find({"items.barcode": parseInt(bc)}, function (err, cursor) {
               cursor.toArray(function (err, docs) {
                   console.log(docs.length);
                   res.send(`Total docs: ${docs.length}`);
               })
           })
        })

        app.post("/sim/sumAndPercent", isLoggedIn, function (req,res) {     // When user POST requests this URL
            var total = 0;  // Total
            var cur = 0;
            Stock.find({}, function (err, docs) {   // Get Stock Items as array
                async.eachSeries(docs, function (doc, done) {   // Ensure function performs synchronously
                    cur++;
                    total+= parseFloat(doc.SIM_Qty_Sold);   // SIM simply means simulation
                    async.setImmediate(done);    // Move onto next iteration
                }, function () {        // Once Fully Iterated do this:
                    async.eachSeries(docs, function (docT, doneT) { // Another sync forEach
                        docT.SIM_Qty_Perc = (docT.SIM_Qty_Sold / total) * 100;  // Work out percentage for item
                        docT.save(function (err) {  // Save item back to DB, then:
                            if(err){console.log(err)}
                            async.setImmediate(doneT);  // Move on to next Iteration
                        })
                    }, function () {    // Once fully Iterated, do this:
                        console.log("TOTAL: " + total);
                        res.send({total:total}) // Send the total back to user
                    })
                })
            })
        })

        app.post("/sim/breadSales", isLoggedIn, function (req, res) {
            var dailySales  = new Array(365).fill(0);
            var dailyPredicts = [];
            var timeNow = Date.now();
            var pageNo = 1000;

            Sale.find({}, function (err, docs) {
                // console.log(docs.length);
                docs.forEach(function (sale) {
                    sale.items.forEach(function (item) {
                        dailySales[sale.dateCompleted.getDOY()-1]+=item.qty;
                    })
                })
                var timeAfter = Date.now();
                console.log("Query took: " + (timeAfter.valueOf() - timeNow.valueOf()) + "(ms)")

                // for(var i = 0; i < dailySales.length; i++){
                //     dailyPredicts[i] = orderPredictOneWeek(i, dailySales)
                //     console.log(dailyPredicts[i]);
                // }
                if(!req.body.smart) {
                    predictYear(dailySales, function (p) {
                        res.send({
                            dailySales: dailySales,
                            dailyPredicts: p
                        });
                    })
                }else{
                    predictYearSmart(dailySales, function (p) {
                        res.send({
                            dailySales: dailySales,
                            dailyPredicts: p
                        });
                    })
                }

            })
        })

        app.post("/sim/predictOneWeek/:dayNum", isLoggedIn, function (req,res) {

        })
        
        app.post("/sim/clearSales", isLoggedIn, function (req, res) {
            Sale.remove({}, function (err) {
                res.send((err?{err:true, errMsg:err}:{err:false}));
            })
        })


    }

    function predictYear(dailySales, cb) {
        var dailyPredicts = [];
        for(var i = 0; i < dailySales.length; i++){
            dailyPredicts[i] = orderPredictOneWeek(i, dailySales)
            // console.log(dailyPredicts[i]);
        }
        cb(dailyPredicts);
    }
    
    function predictYearSmart(dailySales, cb) {
        var dailyPredicts = [];
        for(var i = 0; i < dailySales.length; i++){
            dailyPredicts[i] = LinearRegression(i, simOptions.A, simOptions.B, simOptions.YOffset,
                simOptions.D, simOptions.E, simOptions.PHASE, simOptions.mult, simOptions.round,
                simOptions.noise, simOptions.noiseMult);
            console.log(dailyPredicts[i]);
            // console.log(dailyPredicts[i]);
        }
        cb(dailyPredicts);
    }

    function LinearRegression(t, A, B, C, D, e, p, mult, round, noise, noiseMult){
        var addNoise = 0;
        if(noise){
            addNoise = getRandomInt(-(C/10), C/10) * noiseMult;
        }
        if(round){
            return Math.ceil((A * Math.cos((t / e) - p) + B * Math.sin((t / e) - p) + C + D * t) * mult) - addNoise;
        }else {
            return (A * Math.cos((t / e) - p) + B * Math.sin((t / e) - p) + C + D * t) * mult - addNoise;
        }

    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    function orderPredictOneWeek(dayNum, dailySales, cb) {
        var avg = 0;
        if(dayNum - 7 < 0){
            for(var i = 1; i <= 7; i ++){
                if(Math.sign(dayNum-i) == -1){
                    avg += dailySales[365 - dayNum];
                }else {
                    avg += dailySales[dayNum - i];
                }
            }
        }else if(dayNum + 7 > 365){
            for(var i = 1; i <= 7; i ++){
                if(dayNum+i > 365){
                    avg += dailySales[(dayNum+i) - 365];
                }else {
                    avg += dailySales[dayNum - i];
                }
            }
        }else{
            for(var i = 1; i <= 7; i ++){
                avg += dailySales[dayNum-i];
            }
        }
        return Math.ceil(avg/7);
        // })
    }




    // =====================================
    // ============== MISC =================
    // =====================================

    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/adminDashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('rootSignup.ejs', { message: req.flash('signupMessage') });
    });
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

	app.get('*', function(req, res){ // 404
        res.render('error', {
            code: 404,
            text: 'The page you are trying to reach does not exist, please contact your system administrator!'
        });
	});







// =====================================
// ============ FUNCTIONS ==============
// =====================================
	function isLoggedIn(req, res, next) {
	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();
	    // if they aren't redirect them to the home page
	    if(req.method === "GET"){
	    	res.redirect('/login');
		}else if(req.method === 'POST'){
			res.status(403).send("User is not authenticated")
		}
	}

	function auth(f, user, callback) {
		switch(f){
			case 'user':
                if(user.auth.modifyStoreUsers){
                    callback(1);
                } else if(user.auth.modifyAllUsers){
                	callback(0);
				} else {
                    res.redirect('/error/401');
                }break;
		}

    }

    Date.prototype.isLeapYear = function() {
        var year = this.getFullYear();
        if((year & 3) != 0) return false;
        return ((year % 100) != 0 || (year % 400) == 0);
    };

    // Get Day of Year
    Date.prototype.getDOY = function() {
        var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var mn = this.getMonth();
        var dn = this.getDate();
        var dayOfYear = dayCount[mn] + dn;
        if(mn > 1 && this.isLeapYear()) dayOfYear++;
        return dayOfYear;
    };



// Run App

	server.listen(port || 8080);
	console.log("Running on port " + port)
