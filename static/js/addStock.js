$(function () {
   $("[name=sku-autogen]").click(function () {
       if($("[name=sku]").attr("disabled") === "disabled"){
           // TODO: Remove newStock on uncheck
           $("[name=sku]").removeAttr("disabled");
           $("[name=sku]").val("");
           $("[name=_id]").val("");
       }else {
           $("[name=sku]").attr("disabled", "disabled");
           $("[name=sku-autogen]").attr("disabled", "disabled");
           console.log("Eayy");
           $.post("/stock/genSKU", function (data) {
               $("[name=sku]").val(data.sku);
               $("[name=_id]").val(data.id);
               console.log(data.id);
               $("[name=sku-autogen]").removeAttr("disabled");
           })
       }
   })


    $("[name=allow-dimensions]").click(function () {
        if($("[name=width]").attr("disabled") === "disabled"){
            $("[name=width]").removeAttr("disabled");
            $("[name=height]").removeAttr("disabled");
            $("[name=depth]").removeAttr("disabled");
        }else {
            $("[name=width]").attr("disabled", "disabled");
            $("[name=height]").attr("disabled", "disabled");
            $("[name=depth]").attr("disabled", "disabled");
        }
    })


    $("[name=dep]").change(function () {
        $.get("/departments/getDep/" + this.value, function (data) {
            var opts = "";
            var num = 1;
            console.log(data.subDeps);
            if(data.subDeps.length === 0){
                opts += "<option value='null'>Please Create Sub Department -></option>"
            }else {
                data.subDeps.forEach(function (dep) {
                    opts += "<option value='" + dep.subDepNum + "'>" + dep.subDepName + " - " + dep.subDepNum + "</option>"
                    num = dep.subDepNum + 1;
                });
                $("[name=subDep]").removeAttr("hidden")

            }
            $("[name=subDep]").html(opts);
            $("[name=newSubDep]").attr("data", num);
            // console.log(data)
        })
    })


    $("[name=addNewDep]").click(function () {
        if($("[name=newDep]").val() != "") {
            addDep($("[name=newDep]").val(), $("[name=newDep]").attr("data"));
            $("[name=newDep]")
        }else{
            notify("Error", "Please supply Department Name!")
        }
    })

    $("[name=addNewSubDep]").click(function () {
        if(!$("[name=newSubDep]").val() == "") {
            addSubDep($("[name=dep]").val(), $("[name=newSubDep]").val(), $("[name=newSubDep]").attr("data"));

        }else{
            notify("Error","Please supply Sub Department Name!");
        }
    })



    // PREVENT DEFAULTS
    $("[name=stockForm]").submit(function(e){
        var t = true;
        if($("[name=fullTitle]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the Full Title Field");
        }
        if($("[name=shortTitle]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the Short Title Field");
        }
        if($("[name=sku]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the SKU Field or select Auto-Gen");
        }
        if($("[name=supplier]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the Supplier Reference Field");
        }
        if($("[name=price]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the Price Field");
        }
        if($("[name=size]").val() === ""){
            t = false;
            notify("Validation Error", "Please fill out the Size Field");
        }
        if($("[name=allow-dimensions]").checked){
            if($("[name=width]").val() === ""){
                t = false;
                notify("Validation Error", "Please fill out the Width Field");
            }
            if($("[name=height]").val() === ""){
                t = false;
                notify("Validation Error", "Please fill out the Height Field");
            }
            if($("[name=depth]").val() === ""){
                t = false;
                notify("Validation Error", "Please fill out the Depth Field");
            }
        }

        if($("[name=dep]").val() === "null"){
            t = false;
            notify("Validation Error", "Please Select Department");
        }

        if($("[name=subDep]").val() === "null"){
            t = false;
            notify("Validation Error", "Please Select Sub Department");
        }

        return t;
    });


    // $("[name=submit]").click(function () {
    //     alert("HASODHJ")
    //     $("[name=stockForm]").submit(function () {
    //         return true;
    //     });
    // })
    
});

function isNumberKey(evt){

    console.log(evt.value);
    if ((evt.which != 46 || evt.value.indexOf('.') != -1) && (evt.which < 48 || evt.which > 57)) {
        //event it's fine

    }
    var input = evt.value;
    if ((input.indexOf('.') != -1) && (input.substring(input.indexOf('.')).length > 2)) {
        notify("Invalid Price", "Make sure you're not entering more than TWO decimal places!")
        return false;
    }
}

function addDep(depName, depNum) {
    $.post("/departments/addDep", {
        departmentName  :   depName,
        departmentNum   :   depNum
    }, function (data) {
        if(data.err === false){
            $("[name=dep]").append("<option value='" + depNum + "'>" + depName + " - " + depNum + "</option>");
            $("[name=newSubDep]").attr("data", 0);
            $("[name=dep]").val(depNum);
            notify("Success", "New department: " + depName + " was created successfully!<br>Please Add A New Sub Department", true);
            $("[name=dep]").trigger("change");
        }else{
            notify("Error", data.errMsg);
        }
        console.log(data);
    })
}

function addSubDep(depNum, subDepName, subDepNum) {
    $.post("/departments/addSubDep", {
        depNum   :   depNum,
        subDepName      :   subDepName,
        subDepNum       :   subDepNum
    }, function (data) {
        if(data.err){
            notify("Error", data.errMsg)
        }else{
            notify("Success", "New sub department: " + subDepName + " was created successfully!", true);
            $("[name=subDep]").append("<option value='" + subDepNum + "'>" + subDepName + " - " + subDepNum + "</option>");
            $("[name=subDep]").val(subDepNum);
        }
    })
}