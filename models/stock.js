var mongoose = require("mongoose");
var AutoIncrement = require('mongoose-sequence')(mongoose);
var mongoosePages = require('mongoose-pages');

// define the schema for our user model
var stockSchema = mongoose.Schema({
    // sku - AutoGenerated by mongoose-sequence:  Stock Keeping Unit e.g. 690 356
    empty       :   Boolean,// Is this entry empty: if so hide!
    supplier    :   String, // Shorthand reference to supplier e.g. PCR
    barcode     :   Number,
    bc          :   Number,
    barcodeImg  :   String,
    shortTitle  :   String, // Shorthand title for display on reciepts
    fullTitle   :   String, // Full title
    price       :   Number, // e.g. 1.99
    size        :   String, // e.g. 320G
    dep         :   Number, // Department of product
    subDep      :   Number, // Sub-Department of product
    section     :   String, // Product section
    dimensions  :   { // Actual size of product
        width   :   Number, // in mm
        height  :   Number, // in mm
        depth   :   Number  // in mm
    },
    complete    :   {type:  Boolean, default    : true},
    SIM_Qty_Sold:   Number,  // TEMPORARY! TODO: REMOVE ME!!!
    SIM_Qty_Perc:   Number
},{
    usePushEach : true
});
mongoosePages.skip(stockSchema);
stockSchema.index({sku:1, type: 1}); // Index SKU

stockSchema.plugin(AutoIncrement, {inc_field: "sku"});

// create the model for users and expose it to our app
module.exports = mongoose.model("Stock", stockSchema);