$(function(){
    $input = $("[name=in]");
    $scanned = $("[name=scanned]");
    $total = $("[name=total]");

    //Get Current Sale!
    $.post("/sale/retrieve", {_id:currentSale}, function (data) {
        if(!data.err){
            sale = data;
            console.log(data);
            updateScanned()
        }else{
            notify("Error", data.errMsg);
        }
    });

    $(document).bind("click", function (e) {
        if(!$(e.target).is("td")){
            $("[name=scannedItem]").removeClass("item-select");
        }
    })


    $input.focus();
    $input.on('blur',function () {
        setTimeout(function() {
            $input.focus()
        }, 10);
    });
    $input.keypress(function (e) {
        if(e.which === 13){
            scan($input.val(), function () {
                updateScanned()
            });
        }
    });

    $("[name=numButton]").click(function () {
        var v = $input.val();
        v += $(this).attr("val");
        $input.val(v);
    });

    $("[name=backspace]").click(function () {
        $input.val($input.val().substring(0, $input.val().length - 1));
    })

    $("[name=enter]").click(function () {
        scan($input.val(), function () {
            updateScanned()
        });
    })

    
});
var $input;
var $scanned;
var $total;

/*  {
 *     barcode: a,
 *     title:   b,
 *     sku  :   c,
 *     qty  :   d,
 *     price:   e
 *  }
 * 
 */

var scanList = [];
var selectedItem = {};
var sale = {};


function scan(barcode, cb) {
    barcode = parseInt(barcode);
    if(scanList[barcode]){
        scanList[barcode].qty++;
        cb();
    }else {
        $.post("/stock/barcode/"+barcode, function (res) {
            if(!res.err) {
                console.log(res);
                sale = res;
                if (res) {
                    $input.val("");
                    cb();
                } else {
                    notify("Error!", "Item not found!");
                    cb();
                }
            }else {
                console.log(res);
                notify("Error", (JSON.stringify(res.errMsg)));
            }
        })
    }
}

function updateScanned() {
    var str = "";
    var total = 0.00;
    var items = sale.items;
    items.forEach(function (item, index, blah) {
        total += (parseFloat(item.price).toFixed(2) * parseFloat(item.qty).toFixed(2));
        str +=  "<tr name='scannedItem' sku='" + item.sku + "' onclick='select(this)' barcode='"+item.barcode + "'>" +
            "<td>" + parseInt(index+1) + "</td>\n" +
            "<td>" + item.title +"</td>\n" +
            "<td>x" + item.qty + "</td>\n" +
            "<td>" + item.price.toFixed(2) + "</td>\n" +
            "<td>" + (item.price * item.qty).toFixed(2) + "</td>\n" +
            "</tr>"

    });
    $total.html("&pound;" + total.toFixed(2));
    $scanned.html(str);
}

function select(self) {
    $("[name=scannedItem]").removeClass("item-select");
    $(self).addClass("item-select");
}