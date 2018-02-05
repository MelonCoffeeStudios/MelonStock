$(function () {

});

function notify(title, string, good) {
    var notification = $.parseHTML(
        "<div class='notification'>" +
            "<h5>" + title + "</h5>" +
            "<p>" + string + "</p>" +
        "</div>");
    if(good){
        $(notification).addClass("good");
    }
    $(".notifications").append(notification);
    $(notification).click(function () {
        $(notification).slideUp();
        setTimeout(function () {
            $(notification).remove()
        }, 1000)
    });
    setTimeout(function () {
        $(notification).addClass("slideIn");
    }, 20)

    setTimeout(function () {
        $(notification).slideUp();
        setTimeout(function () {
            $(notification).remove()
        }, 1000)
    }, 5000)

}