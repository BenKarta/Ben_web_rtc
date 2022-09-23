
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))

//Heroku
require("dotenv").config();
const path = require('path');
//

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.use(bodyParser.json());

console.log(`${uuidV4()}`);
app.get("/:room", (req, res) => {
  console.log(req.params.room);
  res.render("startup",{roomId: req.params.room});

});

app.post("/private_room", (req, res) => {
  console.log("here2")
  const submit = req.body;
  console.log(submit.roomid);
  console.log(req.params.room);
  console.log(req.body.roomId);
  var URL=req.url;

  if (submit.username!=''&& req.body.room != ''){
    res.render("room", { name: req.body.username,roomid:submit.roomid,roomId: req.params.room,url:URL});

  }

});

io.on("connection", (socket) => {


  
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("chat-msg", (msg) => {
      socket.to(roomId).broadcast.emit("chat-msg", msg);
    });


    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });



  socket.on("create", (roomId, userId) => {
    console.log("Soket");
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("chat-msg", (msg) => {
      socket.to(roomId).broadcast.emit("chat-msg", msg);
    });


    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

//heroku
app.use(express.static(path.resolve(__dirname, './public')));
app.get('*',(req,res) => {
res.sendFile(path.join(__dirname,'.views/room.ejs'));
  });


server.listen(process.env.PORT||3000, '0.0.0.0');
//