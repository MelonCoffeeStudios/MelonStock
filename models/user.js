
/*
 *
 *
 * USER TYPES:
 * 'root'   : Root Access to everything
 * 'till'   : Access to POS only
 * 'till+'  : Access to POS and some Back Office tools
 * 'super'  : Supervisor, till+ and most Back Office
 * 'mngr'   : till+ and all Back Office
 * 'range'  : Ranging, add stock to system
 *            Create range plans for stores
 *            Add new Order Lines
 * 'ho'     : Head Office, access to everything (except server management)
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
        store        : Number,
        dob          : Date,
        prevStores   : {
            store    : Number,
            dateFrom : Date,
            dateTo   : Date,
            role     : String
        }
    },
    auth    : {
        modifyAllUsers      : Boolean,
        modifyStoreUsers    : Boolean

    },
    userType: String,
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