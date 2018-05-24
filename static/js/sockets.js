var ActiveUsers = {};

var socket = io.connect();

socket.on("authNow", function () {
    socket.emit("setID", USER_ID);
})

socket.on("AuthSuccess",function () {
    console.log("Socket Auth Confirmed");
    socket.emit("joinStore", USER_STORE_NUMBER);
})

setInterval(function () {
    socket.emit("update")
}, 1000)


socket.on("activeUsers", function (data) {
    if(window.location.pathname == "/") {
        var newUsers = JSON.parse(data);
        if (JSON.stringify(ActiveUsers) === JSON.stringify(newUsers)) {
            console.log("No Change");
        } else {
            $("[name=ActiveUsers-Container]").empty();
            Object.keys(newUsers).forEach(function (user) {
                console.log(newUsers);
                if (typeof newUsers[user]._id !== "undefined" && $("[ActiveUserID=" + newUsers[user]._id + "]").length == 0) {
                    $("[name=ActiveUsers-Container]").append(
                        generateActiveUser(
                            newUsers[user].user.info.firstName + " " + newUsers[user].user.info.lastName,
                            newUsers[user]._id
                        )
                    )
                } else {
                    console.log("Erroneous Socket");
                }
            })

        }
        ActiveUsers = newUsers;
    }
})

$(function () {
    $(window).on("unload", function () {
        socket.emit("disconnect");
        socket.disconnect();
    })
})




