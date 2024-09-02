const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's STUN server
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        
    ]
};

const socket = io();


socket.on("connect", () => {
    console.log("Connected to server");
});
socket.on("Sdp-offer", (msg) => {

    createsocketAnswer(msg);


});
socket.on("Sdp-answer", async (msg) => {
    document.getElementById('answer-sdp').value = msg;
    await addAnswer();
    // if (!peerConnection.currentRemoteDescription) {
    //     await peerConnection.setRemoteDescription(msg);
    // }
});


async function createsocketAnswer(msg) {
    let offer = msg;

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
        }
        else{
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)
            socket.emit("Sdp-answer", JSON.stringify(peerConnection.localDescription));
            
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}
let peerConnection = new RTCPeerConnection(iceServers);
// let peerConnection = new RTCPeerConnection();
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
let join = async () => {


    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
            // socket.emit("Sdp-offer", JSON.stringify(peerConnection.localDescription));
        
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
        }
        else{
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
            
        }
    };

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);
    await peerConnection.setLocalDescription(offer).then(socket.emit("Sdp-offer", offer));
}

let createOffer = async () => {


    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
            // socket.emit("Sdp-offer", JSON.stringify(peerConnection.localDescription));
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
        }
        else{
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
            
        }
    };

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);
    await peerConnection.setLocalDescription(offer);
}

let createAnswer = async () => {

    let offer = JSON.parse(document.getElementById('offer-sdp').value)

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
        }
        else{
            
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)
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
        peerConnection.setRemoteDescription(answer);
    }
}

init()

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)
document.getElementById('join').addEventListener('click', join)