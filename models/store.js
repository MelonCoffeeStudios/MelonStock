
var mongoose = require('mongoose');
var User = require('./user');

var storeSchema  = mongoose.Schema({
    storeID     : Number,
    storeName   : String,
    manager     : Number,
    staff       : [Number],
    address     : String,
    stock   :   [{
        sku         :   Number,
        qty         :   Number,
        useBy       :   Date
    }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Store', storeSchema);