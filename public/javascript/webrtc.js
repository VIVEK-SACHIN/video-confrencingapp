const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's STUN server
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.12connect.com:3478"},
        {urls:"stun:iphone-stun.strato-iphone.de:3478"}
    ]
};

const socket = io();


socket.on("connect", () => {
    console.log("Connected to server");
});
socket.on("Sdp-offer", (msg) => {
    document.getElementById('offer-sdp').value = JSON.stringify(msg);
    
   createAnswer();

});
socket.on("Sdp-answer", async (msg) => {
    document.getElementById('answer-sdp').value = msg;
    await addAnswer(); 
});

let peerConnection = new RTCPeerConnection(iceServers);

let localStream;
let remoteStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };
}
let send = async () => {
    socket.emit("Sdp-offer", peerConnection.localDescription);
};



let createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
            // Do nothing until all ICE candidates are gathered
        } else {
            // ICE gathering is complete, emit the offer
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);
            // socket.emit("Sdp-offer", peerConnection.localDescription);
        }
    };

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);
}

let createAnswer = async () => {

    let offer = JSON.parse(document.getElementById('offer-sdp').value)

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            console.log('New Candidate found:', event.candidate);
        }
        else{
            
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
            socket.emit("Sdp-answer", JSON.stringify(peerConnection.localDescription));
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}

let addAnswer = async () => {
    console.log('Add answer triggerd')
    let answer = JSON.parse(document.getElementById('answer-sdp').value)
    console.log('answer:', answer)
    if (!peerConnection.currentRemoteDescription) {
        console.log("setting remote discription")
        peerConnection.setRemoteDescription(answer);
    }
}

init()

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)
document.getElementById('send').addEventListener('click', send)