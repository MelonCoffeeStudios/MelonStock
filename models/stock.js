// define the schema for our user model
var stockSchema = mongoose.Schema({
    sku         :   Number, // Stock Keeping Unit e.g. 690 356
    supplier    :   String, // Shorthand reference to supplier e.g. PCR
    barcode     :   [Number],
    shortTitle  :   String, // Shorthand title for display on reciepts
    fullTitle   :   String, // Full title
    price       :   Number, // e.g. 1.99
    size        :   String, // e.g. 320G
    dep         :   String, // Department of product
    subdep      :   String, // Sub-Department of product
    section     :   String, // Product section
    dimensions  :   { // Actual size of product
        width   :   Number, // in mm
        height  :   Number, // in mm
        depth   :   Number  // in mm
    }
});



