var mongoose = require("mongoose");
var mongoosePages = require('mongoose-pages');


var saleSchema = mongoose.Schema({
    status      :   {           // ONLY ONE
        type    :   String,
        enum    :   [
            "COMPLETE",
            "CHANGE",
            "INCOMPLETE",
            "VOID",
            "EMPTY"
        ],
        default :   "EMPTY"
    },
    userID      :   Number,
    userName    :   String,
    store       :   String,
    tillID      :   Number,
    items       :   [{
        title       :   String,
        sku         :   Number,
        barcode     :   Number,
        price       :   Number,
        dep         :   Number,
        subDep      :   Number,
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

saleSchema.statics.addCash = function (user, cash, cb) {
    this.findById(user.currentSale, function (err, doc) {
        if(doc.status = "CHANGE"){
            var Sale = mongoose.model("Sale", saleSchema)
            var x = new Sale();
            x.save(function () {
                user.currentSale = x._id
                user.save(function () {
                    cb()
                })
            })
        }

        doc.payment.method = "CASH";
        if(typeof doc.payment.amountPaidCash == "undefined"){
            doc.payment.amountPaidCash = 0;
        }
        var x = doc.payment.amountPaidCash;
        doc.payment.amountPaidCash = Number.parseFloat(x) + Number.parseFloat(cash);
        // console.log(doc);
        if(doc.subTotal - doc.payment.amountPaidCash <= 0){
            doc.status = "CHANGE";
            doc.payment.changeRequired = doc.subTotal - doc.payment.amountPaidCash;
            doc.payment.paymentReceived = Date.now();
            doc.dateCompleted = Date.now();
        }
        doc.save(function (err) {
            cb(err?{err:true,errMsg:err}:null,doc);
        })
    })

}

saleSchema.statics.addItem = function (id, newItem, scannedBarcode, cb) {
    this.findById(id, function (err, doc) {
        console.log(doc);
        if(err || doc == null){cb("Please reset Sale state!")}else{
            var alreadyScanned = false;
            var scannedIndex = 0;
            doc.items.forEach(function (item, index, huuu) {
                if(item.sku === newItem.sku){alreadyScanned=true;scannedIndex=index;}
            });
            if(alreadyScanned){
                doc.subTotal = 0;
                doc.items[scannedIndex].qty++;
                doc.items.forEach(function (i) {
                    console.log(Number.parseFloat(i.price.toFixed(2) * i.qty.toFixed(2)));
                    doc.subTotal+= Number.parseFloat(i.price.toFixed(2) * i.qty.toFixed(2));
                })
                doc.save(function (err) {
                    cb(err?{err:true,errMsg:err}:null,doc);
                })
            }else{
                doc.status = "INCOMPLETE";
                doc.items.push({
                    title       :   newItem.shortTitle||newItem.fullTitle,
                    sku         :   newItem.sku,
                    price   :   newItem.price,
                    barcode     :   scannedBarcode,
                    qty         :   1
                });
                doc.subTotal = 0;
                doc.items.forEach(function (i) {
                    console.log(i.price.toFixed(2));
                    doc.subTotal+= Number.parseFloat(i.price.toFixed(2));
                })
                doc.save(function (err) {
                    cb(err?{err:true,errMsg:err}:null,doc);
                })
            }
        }
    })
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