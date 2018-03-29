$(function () {

        $("[name=daySelect]").click(function () {
            var day = $(this).attr("day");
            var enabled = $(this).attr("enabled");

            // console.log($("[name=" + day + "FromH]").attr("disabled"));
            if(enabled === "false"){
                $(this).attr("enabled", "true");
                $(this).removeClass("btn-warning");
                $(this).addClass("btn-success active");
                $("[name="+day+"FromH]").removeAttr("disabled")
                $("[name="+day+"FromM]").removeAttr("disabled")

                $("[name="+day+"ToH]").removeAttr("disabled")
                $("[name="+day+"ToM]").removeAttr("disabled")
            }else{
                $(this).attr("enabled", "true");
                $(this).removeClass("btn-success active");
                $(this).addClass("btn-warning");
                $("[name="+day+"FromH]").attr("disabled", "disabled")
                $("[name="+day+"FromM]").attr("disabled", "disabled")

                $("[name="+day+"ToH]").attr("disabled", "disabled")
                $("[name="+day+"ToM]").attr("disabled", "disabled")
            }
        })

    $("[name=supplierForm]").submit(function (e) {
        return false;
    })

})