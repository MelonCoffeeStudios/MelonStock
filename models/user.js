
/*
 *
 *
 * USER TYPES:
 * 'root' (1337)  : Root Access to everything
 * 'till'  (1)    : Access to POS only
 * 'till+' (2)    : Access to POS and some Back Office tools
 * 'super' (3)    : Supervisor, till+ and most Back Office
 * 'mngr'  (4)    : till+ and all Back Office
 * 'range' (5)    : Ranging, add stock to system
 *                  Create range plans for stores
 *                  Add new Order Lines
 * 'ho'    (6)    : Head Office, access to everything (except server management)
 *
 */

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Store    = require('./store');

// define the schema for our user model
var userSchema = mongoose.Schema({
    info	: 	{
        userID	         : Number,
        password     : String,
        firstName    : String,
        lastName	 : String,
        store        : String,
        dob          : Date,
        prevStores   : [{
            store    : Number,
            dateFrom : Date,
            dateTo   : Date,
            role     : String
        }]
    },
    auth    : {
        modifyAllUsers      : Boolean,
        modifyStoreUsers    : Boolean
    },
    currentSale :   String,
    previousSales   :   [String],
    userType: {
        type    :   String,
        enum    :   [
            "root",
            "till",
            "till+",
            "super",
            "mngr",
            "range",
            "ho"
        ]
    },
    userTypePretty: String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.info.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);