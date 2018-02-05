/*************************************************
 ************** Popup Function *******************
 *************************************************/


function generatePopup(inside) {
    var text =  '<div class="well popup addPrevStore">' +
                '   <header>' +
                '       <span class="glyphicon glyphicon-remove popup-close" title="Close Popup"></span>' +
                '   </header>' +
                '   <div class="popup popup-main">' +
                    inside +
                '   </div>' +
                '</div>';
    $("body").append($.parseHTML(text));
    $(".popup-close").click(function () {
        $('.popup').remove();
    })
}