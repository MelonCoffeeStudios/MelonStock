var mongoose = require("mongoose");
var mongoosePages = require('mongoose-pages');

var saleSchema = mongoose.Schema({
    status      :   {           // ONLY ONE
        type    :   String,
        enum    :   [
            "COMPLETE",
            "INCOMPLETE",
            "VOID",
            "EMPTY"
        ],
        default :   "EMPTY"
    },
    userID      :   Number,
    userName    :   String,
    tillID      :   Number,
    items       :   [{
        title       :   String,
        sku         :   Number,
        barcode     :   Number,
        price       :   Number,
        newPrice    :   Number,
        reduced     :   {
            type    :   Boolean,
            default :   false
        },
        qty         :   Number,
        voided      :   {
            type    :   Boolean,
            default :   false
        }
    }],
    dateOpen        :   {
        type    :   Date,
        default :   Date.now()
    },
    dateCompleted   :   Date,
    dateVoided      :   Date,
    subTotal        :   Number,
    discount        :   Number,
    vouchers        :   [{
        name        :   String,
        issuer      :   String,
        barcode     :   Number,
        voucherType :   {
            type    :   String,
            enum    :   [
                "DISCOUNT",
                "DEDUCT"
            ]
        },
        amount      :   Number,
        expires     :   Boolean,
        expiryDate  :   Date
    }],
    payment         :   {
        method  :   {
            type    :   String,
            enum    :   [
                "CARD",
                "CASH",
                "PART"
            ]
        },
        amountPaidCard  :   Number,
        amountPaidCash  :   Number,
        changeRequired  :   Number,
        paymentReceived :   Date
    }
},{
    usePushEach : true
});
mongoosePages.skip(saleSchema);

saleSchema.statics.addItem = function (id, newItem, scannedBarcode, cb) {
    this.findOne({_id:id}, function (err, doc) {
        if(err){cb(err)}else{
            var alreadyScanned = false;
            var scannedIndex = 0;
            doc.items.forEach(function (item, index, huuu) {
                if(item.sku === newItem.sku){alreadyScanned=true;scannedIndex=index;}
            });
            if(alreadyScanned){
                doc.items[scannedIndex].qty++;
                doc.save(function (err) {
                    cb(err?{err:true,errMsg:err}:null,doc);
                })
            }else{
                doc.items.push({
                    title       :   newItem.shortTitle,
                    sku         :   newItem.sku,
                    price   :   newItem.price,
                    barcode     :   scannedBarcode,
                    // newPrice    :   Number,
                    // reduced     :   {
                    //     type    :   Boolean,
                    //     default :   false
                    // },
                    qty         :   1
                    // voided      :   {
                    //     type    :   Boolean,
                    //     default :   false
                    // }
                });
                doc.save(function (err) {
                    cb(err?{err:true,errMsg:err}:null,doc);
                })
            }
        }
    })

    // cb(null, doc)
};

saleSchema.statics.subTotal = function (body, cb) {
    var totalPrice = 0;
    var items = body.items;
    this.findOne({_id:body._id}, function (err, doc) {
        doc.status = "INCOMPLETE";
    })

};


// create the model for users and expose it to our app
module.exports = mongoose.model("Sale", saleSchema);