var mongoose = require("mongoose");
var mongoosePages = require('mongoose-pages');

var voucherSchema = mongoose.Schema({
    name        :   String,
    issuer      :   String,
    barcode     :   String,
    voucherType :   {
        type    :   String,
        enum    :   [
            "DISCOUNT",
            "DEDUCT"
        ]
    },
    amount      :   Number,
    expires     :   Boolean,
    expired     :   Boolean,
    expiryDate  :   Date
},{
    usePushEach : true
});
mongoosePages.skip(voucherSchema);

// create the model for users and expose it to our app
module.exports = mongoose.model("Voucher", voucherSchema);