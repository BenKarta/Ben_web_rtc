const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer();
const myVideo = document.createElement("video");

myVideo.muted = true;
const peers = {};
const roomnumber=1;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    initChat();

  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

if(ROOM_ID2 =='new'){
  console.log("create")
  myPeer.on("open", (id) => {
    socket.emit("create", ROOM_ID+String(roomnumber), id);
    roomnumber=roomnumber+1
  });
}
else{
  myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID2, id);
  });
}
  

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function initChat() {
  const chatHistoryEl = document.querySelector("#chat-history");
  const chatInputEl = document.querySelector("#chat-input");
  const chatSendEl = document.querySelector("#chat-send");

  function addChatMsgEl(msg) {
    const msgEl = document.createElement("p");
    msgEl.textContent = msg;
    chatHistoryEl.appendChild(msgEl);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight; // scroll down to most bottom after adding msg
  }

  chatInputEl.onkeyup = e => {
    if (e.keyCode == 13) {
       chatSendEl.click();
    }
  }

  chatSendEl.onclick = () => {
    const msg = chatInputEl.value.trim();
    if (msg == "") {
      return;
    }
    socket.emit("chat-msg", msg);
    addChatMsgEl("You: " + msg);
    chatInputEl.value = "";
  };

  socket.on("chat-msg", (msg) => {
    addChatMsgEl("Partner: " + msg);
  });
}
