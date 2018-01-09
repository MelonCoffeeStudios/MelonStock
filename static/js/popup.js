/*************************************************
 ************** Popup Function *******************
 *************************************************/

$(function () {
    $(".popup-close").click(function () {
        $('.popup').remove();
    })
})


function generatePopup(inside) {
    var text =  '<div class="well popup addPrevStore">' +
                '   <header>' +
                '       <span class="glyphicon glyphicon-remove popup-close" title="Close Popup"></span>' +
                '   </header>' +
                '   <div class="popup popup-main">' +
                    inside +
                '   </div>' +
                '</div>';
    return $($.parseHTML(text));
}