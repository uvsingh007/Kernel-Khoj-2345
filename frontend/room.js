const socket=io("https://kernel-khoj-2345-production.up.railway.app/",{transports:["websocket"]})
const myvideo = document.getElementById("vd1");
const roomid = params.get("room");
let username;
const chatRoom = document.querySelector('.chat-cont');
const sendButton = document.getElementById('msgSendBTn');
const messageField = document.querySelector('.chat-input');
const videoContainer = document.querySelector('#vcont');
const overlayContainer = document.querySelector('#overlay')
const continueButt = document.querySelector('.continue-name');
const nameField = document.querySelector('#name-field');
const videoButt = document.querySelector('.novideo');
const audioButt = document.querySelector('.audio');
const cutCall = document.querySelector('.cutcall');
const screenShareButt = document.querySelector('.screenshare');
const whiteboardButt = document.querySelector('.board-icon')
const videoBox = document.getElementById('videoBox');

//whiteboard js start
const whiteboardCont = document.querySelector('.whiteboard-cont');
const canvas = document.querySelector("#whiteboard");
const ctx = canvas.getContext('2d');

let boardVisisble = false;

whiteboardCont.style.visibility = 'hidden';

// Vitual 
// const virtualBackgroundImage = new Image();
// virtualBackgroundImage.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlOfvJXzOw4C0QN99qBnKtFcI4C3R3RxqML85fcihutA&s';
// virtualBackgroundImage.onload = () => {
//     // Once the virtual background image is loaded, you can start applying it to the video stream
//     applyVirtualBackground();
// };

// function applyVirtualBackground() {
//     const canvas1 = document.createElement('canvas');
//     const ctx = canvas1.getContext('2d');
//     canvas1.width = myvideo.videoWidth;
//     canvas1.height = myvideo.videoHeight;
//     ctx.drawImage(myvideo, 0, 0, canvas1.width, canvas1.height);
    
//     // Draw the virtual background image over the canvas
//     ctx.drawImage(virtualBackgroundImage, 0, 0, canvas1.width, canvas1.height);

//     // Replace the video stream with the modified canvas
//     myvideo.srcObject = canvas1.captureStream();

//     // Continue the process in a loop for real-time effect
//     requestAnimationFrame(applyVirtualBackground);
// }

let isDrawing = 0;
let x = 0;
let y = 0;
let color = "black";
let drawsize = 3;
let colorRemote = "black";
let drawsizeRemote = 3;

function fitToContainer(canvas) {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

fitToContainer(canvas);

//getCanvas call is under join room call
socket.on('getCanvas', url => {
    let img = new Image();
    img.onload = start;
    img.src = url;

    function start() {
        ctx.drawImage(img, 0, 0);
    }

    console.log('got canvas', url)
})

function setColor(newcolor) {
    color = newcolor;
    drawsize = 3;
}

function setEraser() {
    color = "white";
    drawsize = 10;
}

//might remove this
function reportWindowSize() {
    fitToContainer(canvas);
}

window.onresize = reportWindowSize;
//

function clearBoard() {
    if (window.confirm('Are you sure you want to clear board? This cannot be undone')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('store canvas', canvas.toDataURL());
        socket.emit('clearBoard');
    }
    else return;
}

socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

function draw(newx, newy, oldx, oldy) {
    ctx.strokeStyle = color;
    ctx.lineWidth = drawsize;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();

    socket.emit('store canvas', canvas.toDataURL());

}

function drawRemote(newx, newy, oldx, oldy) {
    ctx.strokeStyle = colorRemote;
    ctx.lineWidth = drawsizeRemote;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();

}

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = 1;
})

canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        draw(e.offsetX, e.offsetY, x, y);
        socket.emit('draw', e.offsetX, e.offsetY, x, y, color, drawsize);
        x = e.offsetX;
        y = e.offsetY;
    }
})

window.addEventListener('mouseup', e => {
    if (isDrawing) {
        isDrawing = 0;
    }
})

socket.on('draw', (newX, newY, prevX, prevY, color, size) => {
    colorRemote = color;
    drawsizeRemote = size;
    drawRemote(newX, newY, prevX, prevY);
})

//whiteboard js end

let videoAllowed = 1;
let audioAllowed = 1;

let micInfo = {};
let videoInfo = {};

let videoTrackReceived = {};

let mymuteicon = document.querySelector("#mymuteicon");
mymuteicon.style.visibility = 'hidden';

let myvideooff = document.querySelector("#myvideooff");
//  const image = localStorage.getItem("userImage")
//         myvideo.style.backgroundImage = "url(" + image + ")";
//         myvideo.style.backgroundSize = "cover";
//         myvideo.style.backgroundPosition = "center";
//         myvideo.style.backgroundRepeat = "no-repeat";


const configuration = { iceServers: [{ urls: "stun:stun.stunprotocol.org" }] }

const mediaConstraints = { video: true, audio: true };

let connections = {};
let cName = {};
let audioTrackSent = {};
let videoTrackSent = {};

let mystream, myscreenshare;


document.querySelector('.roomcode').innerHTML = `${roomid}`

function CopyClassText() {

    var textToCopy = document.querySelector('.roomcode');
    var currentRange;
    if (document.getSelection().rangeCount > 0) {
        currentRange = document.getSelection().getRangeAt(0);
        window.getSelection().removeRange(currentRange);
    }
    else {
        currentRange = false;
    }

    var CopyRange = document.createRange();
    CopyRange.selectNode(textToCopy);
    window.getSelection().addRange(CopyRange);
    document.execCommand("copy");

    window.getSelection().removeRange(CopyRange);

    if (currentRange) {
        window.getSelection().addRange(currentRange);
    }

    document.querySelector(".copycode-button").textContent = "Copied!"
    setTimeout(()=>{
        document.querySelector(".copycode-button").textContent = "Copy Code";
    }, 5000);
}


continueButt.addEventListener('click', () => {
    if (nameField.value == '') return;
    username = nameField.value;
    const userImageinPart=localStorage.getItem("userImage")
    overlayContainer.style.visibility = 'hidden';
    document.querySelector("#myname").innerHTML = `${username} (You)`;
    socket.emit("join room", roomid, username,userImageinPart);

})

nameField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        continueButt.click();
    }
});

socket.on('user count', count => {
    if (count > 1) {
        videoContainer.className = 'video-cont';
    }
    else {
        videoContainer.className = 'video-cont-single';
    }
})

let peerConnection;

function handleGetUserMediaError(e) {
    switch (e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }

}


function reportError(e) {
    console.log(e);
    return;
}


function startCall() {
    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(localStream => {
            myvideo.srcObject = localStream;
            myvideo.muted = true;

            localStream.getTracks().forEach(track => {
                for (let key in connections) {
                    connections[key].addTrack(track, localStream);
                    if (track.kind === 'audio')
                        audioTrackSent[key] = track;
                    else
                        videoTrackSent[key] = track;
                }
            })

        })
        .catch(handleGetUserMediaError);


}

function handleVideoOffer(offer, sid, cname, micinf, vidinf) {

    cName[sid] = cname;
    console.log('video offered recevied');
    micInfo[sid] = micinf;
    videoInfo[sid] = vidinf;
    connections[sid] = new RTCPeerConnection(configuration);

    connections[sid].onicecandidate = function (event) {
        if (event.candidate) {
            console.log('icecandidate fired');
            socket.emit('new icecandidate', event.candidate, sid);
        }
    };

    connections[sid].ontrack = function (event) {

        if (!document.getElementById(sid)) {
            console.log('track event fired')
            let vidCont = document.createElement('div');
            let newvideo = document.createElement('video');
            let name = document.createElement('div');
            let muteIcon = document.createElement('div');
            let videoOff = document.createElement('div');
            videoOff.classList.add('video-off');
            muteIcon.classList.add('mute-icon');
            name.classList.add('nametag');
            name.innerHTML = `${cName[sid]}`;
            vidCont.id = sid;
            muteIcon.id = `mute${sid}`;
            videoOff.id = `vidoff${sid}`;
            muteIcon.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
            videoOff.innerHTML = 'Video Off'
            vidCont.classList.add('video-box');
            newvideo.classList.add('video-frame');
            newvideo.autoplay = true;
            newvideo.playsinline = true;
            newvideo.id = `video${sid}`;
            newvideo.srcObject = event.streams[0];

            if (micInfo[sid] == 'on')
                muteIcon.style.visibility = 'hidden';
            else
                muteIcon.style.visibility = 'visible';

            if (videoInfo[sid] == 'on')
                videoOff.style.visibility = 'hidden';
            else
                videoOff.style.visibility = 'visible';

            vidCont.appendChild(newvideo);
            vidCont.appendChild(name);
            vidCont.appendChild(muteIcon);
            vidCont.appendChild(videoOff);

            videoContainer.appendChild(vidCont);

        }


    };

    connections[sid].onremovetrack = function (event) {
        if (document.getElementById(sid)) {
            document.getElementById(sid).remove();
            console.log('removed a track');
        }
    };

    connections[sid].onnegotiationneeded = function () {

        connections[sid].createOffer()
            .then(function (offer) {
                return connections[sid].setLocalDescription(offer);
            })
            .then(function () {

                socket.emit('video-offer', connections[sid].localDescription, sid);

            })
            .catch(reportError);
    };

    let desc = new RTCSessionDescription(offer);

    connections[sid].setRemoteDescription(desc)
        .then(() => { return navigator.mediaDevices.getUserMedia(mediaConstraints) })
        .then((localStream) => {

            localStream.getTracks().forEach(track => {
                connections[sid].addTrack(track, localStream);
                console.log('added local stream to peer')
                if (track.kind === 'audio') {
                    audioTrackSent[sid] = track;
                    if (!audioAllowed)
                        audioTrackSent[sid].enabled = false;
                }
                else {
                    videoTrackSent[sid] = track;
                    if (!videoAllowed)
                        videoTrackSent[sid].enabled = false
                }
            })

        })
        .then(() => {
            return connections[sid].createAnswer();
        })
        .then(answer => {
            return connections[sid].setLocalDescription(answer);
        })
        .then(() => {
            socket.emit('video-answer', connections[sid].localDescription, sid);
        })
        .catch(handleGetUserMediaError);


}

function handleNewIceCandidate(candidate, sid) {
    console.log('new candidate recieved')
    var newcandidate = new RTCIceCandidate(candidate);

    connections[sid].addIceCandidate(newcandidate)
        .catch(reportError);
}

function handleVideoAnswer(answer, sid) {
    console.log('answered the offer')
    const ans = new RTCSessionDescription(answer);
    connections[sid].setRemoteDescription(ans);
}

//Thanks to (https://github.com/miroslavpejic85) for ScreenShare Code

screenShareButt.addEventListener('click', () => {
    screenShareToggle();
});
let screenshareEnabled = false;
function screenShareToggle() {
    let screenMediaPromise;
    if (!screenshareEnabled) {
        if (navigator.getDisplayMedia) {
            screenMediaPromise = navigator.getDisplayMedia({ video: true });
        } else if (navigator.mediaDevices.getDisplayMedia) {
            screenMediaPromise = navigator.mediaDevices.getDisplayMedia({ video: true });
        } else {
            screenMediaPromise = navigator.mediaDevices.getUserMedia({
                video: { mediaSource: "screen" },
            });
        }
    } else {
        screenMediaPromise = navigator.mediaDevices.getUserMedia({ video: true });
    }
    screenMediaPromise
        .then((myscreenshare) => {
            screenshareEnabled = !screenshareEnabled;
            for (let key in connections) {
                const sender = connections[key]
                    .getSenders()
                    .find((s) => (s.track ? s.track.kind === "video" : false));
                sender.replaceTrack(myscreenshare.getVideoTracks()[0]);
            }
            myscreenshare.getVideoTracks()[0].enabled = true;
            const newStream = new MediaStream([
                myscreenshare.getVideoTracks()[0], 
            ]);
            myvideo.srcObject = newStream;
            myvideo.muted = true;
            mystream = newStream;
            screenShareButt.innerHTML = (screenshareEnabled 
                ? `<i class="fas fa-desktop"></i><span class="tooltiptext">Stop Share Screen</span>`
                : `<i class="fas fa-desktop"></i><span class="tooltiptext">Share Screen</span>`
            );
            myscreenshare.getVideoTracks()[0].onended = function() {
                if (screenshareEnabled) screenShareToggle();
            };
        })
        .catch((e) => {
            alert("Unable to share screen:" + e.message);
            console.error(e);
        });
}

socket.on('video-offer', handleVideoOffer);

socket.on('new icecandidate', handleNewIceCandidate);

socket.on('video-answer', handleVideoAnswer);


socket.on('join room', async (conc, cnames, micinfo, videoinfo) => {
    socket.emit('getCanvas');
    if (cnames)
        cName = cnames;

    if (micinfo)
        micInfo = micinfo;

    if (videoinfo)
        videoInfo = videoinfo;


    console.log(cName);
    if (conc) {
        await conc.forEach(sid => {
            connections[sid] = new RTCPeerConnection(configuration);

            connections[sid].onicecandidate = function (event) {
                if (event.candidate) {
                    console.log('icecandidate fired');
                    socket.emit('new icecandidate', event.candidate, sid);
                }
            };

            connections[sid].ontrack = function (event) {

                if (!document.getElementById(sid)) {
                    console.log('track event fired')
                    let vidCont = document.createElement('div');
                    let newvideo = document.createElement('video');
                    let name = document.createElement('div');
                    let muteIcon = document.createElement('div');
                    let videoOff = document.createElement('div');
                    videoOff.classList.add('video-off');
                    muteIcon.classList.add('mute-icon');
                    name.classList.add('nametag');
                    name.innerHTML = `${cName[sid]}`;
                    vidCont.id = sid;
                    muteIcon.id = `mute${sid}`;
                    videoOff.id = `vidoff${sid}`;
                    muteIcon.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                    videoOff.innerHTML = 'Video Off'
                    vidCont.classList.add('video-box');
                    newvideo.classList.add('video-frame');
                    newvideo.autoplay = true;
                    newvideo.playsinline = true;
                    newvideo.id = `video${sid}`;
                    newvideo.srcObject = event.streams[0];

                    if (micInfo[sid] == 'on')
                        muteIcon.style.visibility = 'hidden';
                    else
                        muteIcon.style.visibility = 'visible';

                    if (videoInfo[sid] == 'on')
                        videoOff.style.visibility = 'hidden';
                    else
                        videoOff.style.visibility = 'visible';

                    vidCont.appendChild(newvideo);
                    vidCont.appendChild(name);
                    vidCont.appendChild(muteIcon);
                    vidCont.appendChild(videoOff);

                    videoContainer.appendChild(vidCont);

                }

            };

            connections[sid].onremovetrack = function (event) {
                if (document.getElementById(sid)) {
                    document.getElementById(sid).remove();
                }
            }

            connections[sid].onnegotiationneeded = function () {

                connections[sid].createOffer()
                    .then(function (offer) {
                        return connections[sid].setLocalDescription(offer);
                    })
                    .then(function () {

                        socket.emit('video-offer', connections[sid].localDescription, sid);

                    })
                    .catch(reportError);
            };

        });

        console.log('added all sockets to connections');
        startCall();

    }
    else {
        console.log('waiting for someone to join');
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localStream => {
                myvideo.srcObject = localStream;
                myvideo.muted = true;
                mystream = localStream;
            })
            .catch(handleGetUserMediaError);
    }
})

socket.on('remove peer', sid => {
    if (document.getElementById(sid)) {
        document.getElementById(sid).remove();
    }

    delete connections[sid];
})

sendButton.addEventListener('click', () => {
    const msg = messageField.value;
    const file = fileInput.files[0]; 
    console.log(file);
    if (file) {
        
        readFileAndSend(file);
        fileInput.value = '';
        
        // Remove the stored file data from the send button
        delete sendButton.dataset.file;
    } else {
    messageField.value = '';
    socket.emit('message', msg, username, roomid);
    }
})

messageField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendButton.click();
    }
});

socket.on('file upload', (fileData, sendername, time) => {
    console.log("HEllo")
    chatRoom.scrollTop = chatRoom.scrollHeight;
    // chatRoom.innerHTML += `abbsvvs`

    chatRoom.innerHTML += `<div class="message">
    <div class="info">
        <div class="username">${sendername}</div>
        <div class="time">${time}</div>
    </div>
    <div class="content">
        <a href="${fileData.fileData}" target="_blank" download>${fileData.fileName}</a>
    </div>
</div>`
});

socket.on('message', (msg, sendername, time) => {
    chatRoom.scrollTop = chatRoom.scrollHeight;
    chatRoom.innerHTML += `<div class="message">
    <div class="info">
        <div class="username">${sendername}</div>
        <div class="time">${time}</div>
    </div>
    <div class="content">
        ${msg}
    </div>
</div>`
});

// SEND ATTACHEMENT
const attachmentIcon = document.getElementById('attachmentIcon');
    const fileInput = document.getElementById('fileInput');
    attachmentIcon.addEventListener('click', function() {
        fileInput.click();
    });

    // Event listener for file input change
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; 
        if (file) {
            readFileAndSend(file); 
        }
    });
  
    function readFileAndSend(file) {
        const reader = new FileReader();
      
        reader.onload = function(event) {
            const fileData = event.target.result; 
            console.log(fileData);
            let fileObj =  {
                fileName: file.name,
                fileType: file.type,
                fileData: fileData
            }
            // Emit the file data over Socket.IO
            socket.emit('file upload', fileObj, username);
        };

        // Read the file as data URL
        reader.readAsDataURL(file);
    }
// ATTACHEMNET

socket.on("participantsInc", (count)=>{
    document.getElementById("part-count").innerText = count;
    
})

// document.getElementById("msgSendBTn").addEventListener('click',()=>{
//     const msg = document.getElementById("emojisText").value
//     socket.emit('message',(msg,username,roomid))
// })




videoButt.addEventListener('click', () => {

    if (videoAllowed) {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = false;
        }

        videoButt.innerHTML = `<i class="fas fa-video-slash"></i>`;
        videoAllowed = 0;
       
        videoButt.style.backgroundColor = "#b12c2c";
        myvideo.style.backgroundRepeat = "no-repeat";
 
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    track.enabled = false;
                }
            })
        }
        myvideooff.style.visibility = 'visible';
          const image = localStorage.getItem("userImage")
         myvideooff.style.backgroundImage = "url(" + image + ")";
         myvideooff.style.backgroundSize = "cover";
        myvideooff.style.backgroundPosition = "center";
        myvideooff.style.repeat = "no-repeat";
        myvideooff.style.height="170px"
        myvideooff.style.width="170px"
        



       

        socket.emit('action', 'videooff');
    }
    else {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = true;
        }
        videoButt.innerHTML = `<i class="fas fa-video"></i>`;
        videoAllowed = 1;
        videoButt.style.backgroundColor = "#4ECCA3";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'video')
                    track.enabled = true;
            })
        }


        myvideooff.style.visibility = 'hidden';
        //  const image = localStorage.getItem("userImage")
        //  myvideooff.style.backgroundImage = "url(" + image + ")";
        //  myvideooff.style.backgroundSize = "cover";
        // myvideooff.style.backgroundPosition = "center";

        socket.emit('action', 'videoon');
    }
})


audioButt.addEventListener('click', () => {

    if (audioAllowed) {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = false;
        }
        audioButt.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        audioAllowed = 0;
        audioButt.style.backgroundColor = "#b12c2c";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'audio')
                    track.enabled = false;
            })
        }

        mymuteicon.style.visibility = 'visible';

        socket.emit('action', 'mute');
    }
    else {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = true;
        }
        audioButt.innerHTML = `<i class="fas fa-microphone"></i>`;
        audioAllowed = 1;
        audioButt.style.backgroundColor = "#4ECCA3";
        if (mystream) {
            mystream.getTracks().forEach(track => {
                if (track.kind === 'audio')
                    track.enabled = true;
            })
        }

        mymuteicon.style.visibility = 'hidden';

        socket.emit('action', 'unmute');
    }
})

socket.on('action', (msg, sid) => {
    if (msg == 'mute') {
        console.log(sid + ' muted themself');
        document.querySelector(`#mute${sid}`).style.visibility = 'visible';
        micInfo[sid] = 'off';
    }
    else if (msg == 'unmute') {
        console.log(sid + ' unmuted themself');
        document.querySelector(`#mute${sid}`).style.visibility = 'hidden';
        micInfo[sid] = 'on';
    }
    else if (msg == 'videooff') {
        console.log(sid + 'turned video off');
        document.querySelector(`#vidoff${sid}`).style.visibility = 'visible';
        videoInfo[sid] = 'off';
    }
    else if (msg == 'videoon') {
        console.log(sid + 'turned video on');
        document.querySelector(`#vidoff${sid}`).style.visibility = 'hidden';
        videoInfo[sid] = 'on';
    }
})


whiteboardButt.addEventListener('click', () => {
    if (boardVisisble) {
        whiteboardCont.style.visibility = 'hidden';
        boardVisisble = false;
    }
    else {
        whiteboardCont.style.visibility = 'visible';
        boardVisisble = true;
    }
})

cutCall.addEventListener('click', () => {
    location.href = '../public/landing.html';
})
// frontend\public\index.html

// record video

let mediaRecorder; // Add mediaRecorder variable to hold the MediaRecorder instance
let recordedChunks = []; // Array to store recorded video chunks

const recordButton = document.getElementById('recordButton');
recordButton.addEventListener('click', toggleRecording); // Add event listener for record button

async function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop recording
        mediaRecorder.stop();
        recordButton.style.backgroundColor = "#d8d8d8";
    } else {
        // Start recording
        const videoElement = document.getElementById('vd1');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        if (stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            recordedChunks = []; // Reset recorded chunks array
            mediaRecorder.start();
            recordButton.style.backgroundColor = "red";
        }
    }
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

// Function to download recorded video
function downloadRecordedVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recorded_video.webm';
    a.click();
    window.URL.revokeObjectURL(url);
}




//


// transcript add
let recognition;
let start_trans=document.getElementById('start-transcript')
let stop_trans=document.getElementById('stop-transcript')
let languageSelector = document.getElementById('language-selector');

start_trans.addEventListener('click',startTranscript)
function startTranscript() {
    let dropdownContent = document.getElementById('language-dropdown');
    dropdownContent.style.display = dropdownContent.style.display ==='none';
    console.log('btn clicked')
    recognition = new webkitSpeechRecognition();
    recognition.lang = languageSelector.value;  
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
        setTimeout(()=>{
            recognition.stop()
        },7000)
        console.log('Speech recognition started.');
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        recognition.start()
    };
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
            for (let j = 0; j < event.results[i].length; ++j) {
                transcript += event.results[i][j].transcript;
            }
        }
        updateTranscript(transcript);
    };

    recognition.start();
}
stop_trans.addEventListener('click',stopTranscript)
function stopTranscript() {
    if (recognition) {
        recognition.stop();
    }
}

function updateTranscript(transcript) {
    console.log('Transcript:', transcript);
    let sub=document.getElementById('subtitle')
    sub.innerText=""
    sub.innerText=transcript
}





//reaction

// document.getElementById('reaction-btn').addEventListener('click',()=>{
//     document.getElementById('reaction').style.display='block'
//     setTimeout(function() {
//         document.getElementById('reaction').style.display='none'
//     }, 5000);
// })
function selectEmoji(emoji) {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    document.getElementById('reaction').style.display='block'
    document.getElementById('reaction').innerText = emoji;
    var reactionDiv = document.getElementById('reaction');
    reactionDiv.innerHTML = '<span style="font-size: 40px;">' + emoji + '</span>';
    setTimeout(function() {
        document.getElementById('reaction').style.display='none'
    }, 10000);
}

const dropdownButton = document.getElementById('reaction-btn');
    const dropdownContent = document.getElementById('dropdownContent');

    // Show or hide the dropdown content when the button is clicked
    dropdownButton.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });


const participantModal = document.getElementById('participantModal');
const closeBtn = document.querySelector('.close-btn');

// Function to close the modal
function closeModal() {
    participantModal.style.display = 'none';
}

// Open the modal when the participant count icon is clicked
participantCountIcon.addEventListener('click', () => {
    participantModal.style.display = 'block';
});

// Close the modal when the close button is clicked
closeBtn.addEventListener('click', closeModal);

// Close the modal when the user clicks anywhere outside of it
window.addEventListener('click', (event) => {
    if (event.target === participantModal) {
        closeModal();
    }
});
let usersListName = document.getElementById("participantList");
socket.on("newUserNameJoined", (participantsname)=>{
    const userImageinPart = localStorage.getItem("userImage")
    const div = document.createElement("div");
    div.classList.add("photoDIV")
    const img = document.createElement("img");
    img.classList.add("participantsImage" );
    img.src = userImageinPart;
   const list =  document.createElement("p");
   const breakLine = document.createElement("br");
   list.innerHTML = participantsname;
   div.append(img)
   div.append(list)
   usersListName.append(div);
   usersListName.append(breakLine);

})

const userImageinPart = localStorage.getItem("userImage")
// socket.on("update-avtar",(userImageinPart)=>{
//     img.src=userImageinPart;
// })
//avtar
// socket.emit('update avatar', localStorage.getItem("userImage"));


// function toggleMenu() {
//     var menu = document.getElementById('menuItems');
//     menu.classList.toggle('hidden');
// }

// Function to add new items to the menu
// function addMenuItem(iconClass, tooltipText) {
//     var menu = document.getElementById('menuItems');
//     var newItem = document.createElement('div');
//     newItem.classList.add('screenshare', 'tooltip');
//     newItem.innerHTML = '<i class="' + iconClass + '"></i><span class="tooltiptext">' + tooltipText + '</span>';
//     menu.appendChild(newItem);
// }

// Add items to the menu
// Add your desired items here
// addMenuItem('fas fa-chalkboard', 'Whiteboard');
// addMenuItem('fas fa-users mr-1', 'Participants');

// You can add more items as needed

// Hide hamburger menu on larger screens
// window.addEventListener('resize', function() {
//     var menu = document.getElementById('menuItems');
//     var hamburger = document.querySelector('.hamburger-menu');
//     if (window.innerWidth >= 1100) {
//         menu.classList.add('hidden');
//     } else {
//         menu.classList.remove('hidden');
//     }
// });