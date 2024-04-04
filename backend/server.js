const cors=require('cors')
const path = require('path');
const express = require('express')
const http = require('http')


const {connection}=require('./db')
const {userRouter}=require("./route/user.route")
const socketio = require('socket.io');
// const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())

app.use(cors())
app.use('/users',userRouter)
const server = http.createServer(app);
// $$$$$$$$$$$$$$$$$$444


// $$$$$$$$$$$$$$$$$4

const io = socketio(server);

app.use(express.static(path.join(__dirname, '../frontend/signup')));
// app.get("/backend/public/index.html", (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });
// console.log(path.join(__dirname, '../frontend'));
let rooms = {};
let socketroom = {};
let socketname = {};
let socketImage={};
let micSocket = {};
let videoSocket = {};
let roomBoard = {};
let countParticipants = 0;
io.on('connect', socket => {

    socket.on("join room", (roomid, username,userImage) => {

        socket.join(roomid);
        countParticipants++;
        io.emit("participantsInc", countParticipants);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        socketImage[socket.id]= userImage;
        io.emit("newUserNameJoined", username);
        
        //avtar
        // socket.on('update avatar', (data) => {
        //     socket.avatar = data.avatar;
        //     io.emit('chat message', {
        //         avatar: socket.avatar,
        //     });
        // });
        io.emit("update-avtar",userImage);




        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';

        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'Bot', moment().format(
                "h:mm a"
            ));
            
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket);
        }
        else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room', null, null, null, null);
        }

        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    socket.on('action', msg => {
        if (msg == 'mute')
            micSocket[socket.id] = 'off';
        else if (msg == 'unmute')
            micSocket[socket.id] = 'on';
        else if (msg == 'videoon')
            videoSocket[socket.id] = 'on';
        else if (msg == 'videooff')
            videoSocket[socket.id] = 'off';

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
    })

    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketname[socket.id], micSocket[socket.id], videoSocket[socket.id]);
    })

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    })

    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    })

    // socket.on('message', (msg, username, roomid) => {
    //     // console.log(msg);
    //     // console.log("hey")
    //     io.to(roomid).emit('message', msg, username, moment().format(
    //         "h:mm a"
    //     ));
    
socket.on('message', (msg, username, roomid) => {
    io.to(roomid).emit('message', msg, username, moment().tz('Asia/Kolkata').format("h:mm A"));
})

    // })

    // Attachemnet
    socket.on('file upload', function(fileData, username,roomid) {
        console.log(fileData);
        console.log(username)
        io.emit('file upload', fileData, username, moment().tz('Asia/Kolkata').format("h:mm A"));
        // socket.broadcast.emit("file upload", fileData);
    });
    // attachemnet
    socket.on('getCanvas', () => {
        if (roomBoard[socketroom[socket.id]])
            socket.emit('getCanvas', roomBoard[socketroom[socket.id]]);
    });

    socket.on('draw', (newx, newy, prevx, prevy, color, size) => {
        socket.to(socketroom[socket.id]).emit('draw', newx, newy, prevx, prevy, color, size);
    })

    socket.on('clearBoard', () => {
        socket.to(socketroom[socket.id]).emit('clearBoard');
    });

    socket.on('store canvas', url => {
        roomBoard[socketroom[socket.id]] = url;
    })

    socket.on('disconnect', () => {
        if (!socketroom[socket.id]) return;
        countParticipants--;
        io.emit("participantsInc", countParticipants);
        socket.to(socketroom[socket.id]).emit('message', `${socketname[socket.id]} left the chat.`, `Bot`, moment().format(
            "h:mm a"
        ));
        
        socket.to(socketroom[socket.id]).emit('remove peer', socket.id);
        var index = rooms[socketroom[socket.id]].indexOf(socket.id);
        rooms[socketroom[socket.id]].splice(index, 1);
        io.to(socketroom[socket.id]).emit('user count', rooms[socketroom[socket.id]].length);
        delete socketroom[socket.id];
        console.log('--------------------');
        console.log(rooms[socketroom[socket.id]]);

        //toDo: push socket.id out of rooms
    });
})


// EMOJIS
server.listen(process.env.PORT||8080,async()=>{
      console.log('server is running on port http://localhost:8080')
      try{
        await connection
        console.log('connected to db');
    }
    catch(err)
    {
        console.log(err)
    }
    })