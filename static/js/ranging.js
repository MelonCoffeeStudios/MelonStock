$(function () {
    getAll();

    $("[name=filter]").change(function () {
        search($("[name=filter]").val());
    })

    $("[name=page_next]").click(function () {
        getAll($("[name=page_next]").attr("nextPage"))
    })

    $("[name=page_prev]").click(function () {
        getAll($("[name=page_prev]").attr("prevPage"))
    })

    $("[name=genBarcode]").click(function () {
        $.post("/stock/genBarcode/"+$(this).attr("sku"), function (data) {

            getAll();
        })
    })

})

function genBarcode(self) {
    $.post("/stock/genBarcode/"+$(self).attr("sku"), function (data) {

        getAll();
    })
}

//TODO: Implement PAGE
function getAll(page) {
    if(!page){
        $.post("/stock/get", function (data) {
            var str = "";
            console.log(data);
            $("[name=page_current]").html(1);
            $("[name=page_next]").attr("nextPage", data.nextPage);
            if(data.prevPage){
                $("[name=page_prev]").attr("prevPage", data.prevPage);
            }else {
                $("[name=page_prev]").attr("prevPage", 1);
            }
            data.documents.forEach(function (stock) {
                if(!stock.empty){
                    str += "<tr>" +
                        "<td>"+stock.fullTitle+"</td>" +
                        "<td>"+stock.sku+"</td>" +
                        "<td>&pound;"+stock.price.toFixed(2)+"</td>" +
                        "<td barcodeSKU='"+ stock.sku +"'>"+(stock.barcodeImg?
                            "<img src='" + stock.barcodeImg + "' width='200px;'>":
                            "<button class='btn btn-warning' onclick='genBarcode(this)' name='genBarcode' sku='" + stock.sku + "'>Generate Barcode</button> </td>") +
                        "</tr>";
                }
            });
            $("[name=stockTable]").html(str);
        })
    }else{
        $.post("/stock/get", {
            page    :   page
        }, function (data) {
            var str = "";
            console.log(data);
            $("[name=page_current]").html(page);
            $("[name=page_next]").attr("nextPage", data.nextPage);
            if(data.prevPage){
                $("[name=page_prev]").attr("prevPage", data.prevPage);
            }else {
                $("[name=page_prev]").attr("prevPage", 1);
            }
            data.documents.forEach(function (stock) {
                if(!stock.empty){
                    str += "<tr>" +
                        "<td>"+stock.fullTitle+"</td>" +
                        "<td>"+stock.sku+"</td>" +
                        "<td>&pound;"+stock.price.toFixed(2)+"</td>" +
                        "<td barcodeSKU='"+ stock.sku +"'>"+(stock.barcodeImg?
                            "<img src='" + stock.barcodeImg + "' width='200px;'>":
                            "<button class='btn btn-warning' onclick='genBarcode(this)' name='genBarcode' sku='" + stock.sku + "'>Generate Barcode</button> </td>") +
                        "</tr>";
                }
            });
            $("[name=stockTable]").html(str);
        })
    }
}

function search(query, page) {
    if(!page){
        $.post("/stock/get/"+query, function (data) {
            var str = "";
            console.log(data);
            $("[name=page_current]").html(1);
            $("[name=page_next]").attr("nextPage", data.nextPage);
            if(data.prevPage){
                $("[name=page_prev]").attr("prevPage", data.prevPage);
            }else {
                $("[name=page_prev]").attr("prevPage", 1);
            }
            data.documents.forEach(function (stock) {
                if(!stock.empty){
                    str += "<tr>" +
                        "<td>"+stock.fullTitle+"</td>" +
                        "<td>"+stock.sku+"</td>" +
                        "<td>&pound;"+stock.price.toFixed(2)+"</td>" +
                        "<td barcodeSKU='"+ stock.sku +"'>"+(stock.barcodeImg?
                            "<img src='" + stock.barcodeImg + "' width='200px;'>":
                            "<button class='btn btn-warning' onclick='genBarcode(this)' name='genBarcode' sku='" + stock.sku + "'>Generate Barcode</button> </td>") +
                        "</tr>";
                }
            });
            $("[name=stockTable]").html(str);
        });
    }else{
        $.post("/stock/get/" + query, {
            page    :   page
        }, function (data) {
            var str = "";
            console.log(data);
            $("[name=page_current]").html(page);
            $("[name=page_next]").attr("nextPage", data.nextPage);
            if(data.prevPage){
                $("[name=page_prev]").attr("prevPage", data.prevPage);
            }else {
                $("[name=page_prev]").attr("prevPage", 1);
            }
            data.documents.forEach(function (stock) {
                if(!stock.empty){
                    str += "<tr>" +
                        "<td>"+stock.fullTitle+"</td>" +
                        "<td>"+stock.sku+"</td>" +
                        "<td>&pound;"+stock.price.toFixed(2)+"</td>" +
                        "<td barcodeSKU='"+ stock.sku +"'>"+(stock.barcodeImg?
                            "<img src='" + stock.barcodeImg + "' width='200px;'>":
                            "<button class='btn btn-warning' onclick='genBarcode(this)' name='genBarcode' sku='" + stock.sku + "'>Generate Barcode</button> </td>") +
                        "</tr>";
                }
            });
            $("[name=stockTable]").html(str);
        })
    }
}