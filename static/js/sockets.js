

var socket = io.connect();

socket.on("authNow", function () {
    socket.emit("setID", USER_ID);
})

socket.on("AuthSuccess",function () {
    console.log("Socket Auth Confirmed");
    socket.emit("joinStore", USER_STORE_NUMBER);
})

var update = setInterval(function () {
    socket.emit("update")
},1000)


