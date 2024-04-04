const createButton = document.querySelector("#createroom");
const videoCont = document.querySelector('.video-self');
const codeCont = document.querySelector('#roomcode');
const joinBut = document.querySelector('#joinroom');
const mic = document.querySelector('#mic');
const cam = document.querySelector('#webcam');

let micAllowed = 1;
let camAllowed = 1;

let mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(localstream => {
        videoCont.srcObject = localstream;
    })

function uuidv4() {
    return 'xxyxyxxyx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const createroomtext = 'Creating Room...';

createButton.addEventListener('click', (e) => {
    e.preventDefault();
    createButton.disabled = true;
    createButton.innerHTML = 'Creating Room';
    createButton.classList = 'createroom-clicked';

    setInterval(() => {
        if (createButton.innerHTML < createroomtext) {
            createButton.innerHTML = createroomtext.substring(0, createButton.innerHTML.length + 1);
        }
        else {
            createButton.innerHTML = createroomtext.substring(0, createButton.innerHTML.length - 3);
        }
    }, 500);

    //const name = nameField.value;
    location.href = `./room.html?room=${uuidv4()}`;
});

joinBut.addEventListener('click', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() == "") {
        codeCont.classList.add('roomcode-error');
        return;
    }
    const code = codeCont.value;
    window.location.href = `./room.html?room=${code}`;
})

codeCont.addEventListener('change', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() !== "") {
        codeCont.classList.remove('roomcode-error');
        return;
    }
})
// 
cam.addEventListener('click', () => {
    if (camAllowed) {
        mediaConstraints = { video: false, audio: micAllowed ? true : false };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            })
        cam.classList = "nodevice";
        const image = localStorage.getItem("userImage")
        document.getElementById("videoOFF").style.backgroundImage = "url(" + image + ")";
        document.getElementById("videoOFF").style.backgroundSize = "cover";
        document.getElementById("videoOFF").style.backgroundPosition = "center"; 
        document.getElementById("videoOFF").style.backgroundRepeat = "no-repeat"; 
        cam.innerHTML = `<i class="fas fa-video-slash"></i>`;
        camAllowed = 0;
    }
    else {
        mediaConstraints = { video: true, audio: micAllowed ? true : false };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            })

        cam.classList = "device";
        cam.innerHTML = `<i class="fas fa-video"></i>`;
        camAllowed = 1;
    }
})

mic.addEventListener('click', () => {
    if (micAllowed) {
        mediaConstraints = { video: camAllowed ? true : false, audio: false };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            })

        mic.classList = "nodevice";
        mic.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        micAllowed = 0;
    }
    else {
        mediaConstraints = { video: camAllowed ? true : false, audio: true };
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(localstream => {
                videoCont.srcObject = localstream;
            })

        mic.innerHTML = `<i class="fas fa-microphone"></i>`;
        mic.classList = "device";
        micAllowed = 1;
    }
})



// Function to handle image change
var userImage = document.getElementById('userImage');
var imageForm = document.getElementById('imageForm');
var overlaypanu = document.getElementById('overlaypanu');

// Function to show the form and overlay
userImage.onclick = function() {
    imageForm.style.display = 'block';
    overlaypanu.style.display = 'block';
};

// Function to handle image change
function changeImage() {
    var input = document.getElementById('imageInput');
    var file = input.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Set image source and save to localStorage
            userImage.src = e.target.result;
            localStorage.setItem('userImage', e.target.result);
        };
        reader.readAsDataURL(file);
    }
    // Hide the form and overlay after image change
    imageForm.style.display = 'none';
    overlaypanu.style.display = 'none';
}

// Check if image is in localStorage and set it
if(localStorage.getItem('userImage')) {
    userImage.src = localStorage.getItem('userImage');
}

// Logged out
// document.querySelector('.logoutBTN').addEventListener('click', async () => {
    // document.querySelector('.logoutBTN').addEventListener('click', () => {
    //     const email = localStorage.getItem('email'); 
    //     fetch(`http://localhost:8080/logout/${email}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     .then(res=>res.json())
    //     .then(data=>{
    //         if(data.msg === 'logout successfull'){
            
    //             localStorage.removeItem('token');
    //             localStorage.removeItem('email');
    //             window.location.href = './signup/index.html';
    //         }
    //         //     .then(res=>res.json())
    //         //     .then(data=>{
    //         //         if(data.msg==='user has been registered')
    //         //         {
    //         //             // localStorage.setItem('name',data.name)
    //         //             invalidspan.innerHTML=`${data.msg}`;
    //         //             invalidspan.style.color = "green"
    //         //         }
    //         //     })
    //         //     .catch(err=>console.log(err))
    //         // })
    //             // Handle the error response
    //     })
    //     .catch(error => {
    //         console.error('Logout error:', error);
    //         // Handle the error (display an error message, etc.)
    //     });
    // });

    // const logout = async () => {
    //     const email = localStorage.getItem('email'); 
    //     try {
    //       const response = await fetch(`http://localhost:8080/logout/${email}`, {
    //         method: "GET",
    //       });
      
    //       if (response.ok) {
            
    //         console.log("Logout successful");
    //         window.location.href = './signup/index.html';
    //       } else {
    //         const data = await response.json();
    //         console.error("Logout failed:", data.err);
    //       }
    //     }catch(error) {
    //       console.error("Error during logout:", error);
    //     }
    //   };
      // Example button click event
    document.querySelector('.logoutBTN').addEventListener("click", ()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        location.href = "../index.html";
       
    }
    );
    
    document.querySelector(".calenderIcon").addEventListener("click",()=>{
        location.href = "./../calender/calender.html";
    })