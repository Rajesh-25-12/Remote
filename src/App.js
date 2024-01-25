import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import Joystick from "./Button";
const socket = io("https://roboat-socket.onrender.com");

const VideoChatApp = () => {
  const [remoteVideoLoading, setRemoteVideoLoading] = useState(true);

  useEffect(() => {
    const roomID = "videoRoom";
    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");
    let peerConnection;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.srcObject = stream;

        socket.emit("join-room", roomID);

        socket.on("user-connected", (userId) => {
          handleUserConnected(userId);
        });

        socket.on("user-disconnected", (userId) => {
          handleUserDisconnected(userId);
        });

        socket.on("offer", (offer, senderId) => {
          handleOffer(offer, senderId);
        });

        socket.on("answer", (answer, senderId) => {
          handleAnswer(answer, senderId);
        });

        socket.on("ice-candidate", (candidate, senderId) => {
          handleIceCandidate(candidate, senderId);
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    function handleUserConnected(userId) {
      peerConnection = new RTCPeerConnection();

      const localStream = localVideo.srcObject;
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", peerConnection.localDescription, userId, roomID);
        });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, userId, roomID);
        }
      };

      peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
        setRemoteVideoLoading(false);
      };
    }

    function handleUserDisconnected(userId) {
      remoteVideo.srcObject = null;
      setRemoteVideoLoading(true);

      if (peerConnection) {
        peerConnection.close();
      }
    }
    function handleOffer(offer, senderId) {
      if (!peerConnection || peerConnection.connectionState === "closed") {
        peerConnection = new RTCPeerConnection();

        const localStream = localVideo.srcObject;
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        peerConnection
          .setRemoteDescription(new RTCSessionDescription(offer))
          .then(() => peerConnection.createAnswer())
          .then((answer) => peerConnection.setLocalDescription(answer))
          .then(() => {
            socket.emit(
              "answer",
              peerConnection.localDescription,
              senderId,
              roomID
            );
          })
          .catch((error) =>
            console.error("Error setting remote description:", error)
          );

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", event.candidate, senderId, roomID);
          }
        };

        peerConnection.ontrack = (event) => {
          console.log(event.streams, "stream");
          remoteVideo.srcObject = event.streams[0];
        };
      } else {
        console.warn("RTCPeerConnection already exists or closed.");
      }
    }

    function handleAnswer(answer, senderId) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    function handleIceCandidate(candidate, senderId) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [socket]);

  return (
    <div className="video-container">
      <video id="localVideo" autoPlay muted className="local-video"></video>

      <video id="remoteVideo" autoPlay className="remote-video"></video>

      <div className="joystick-ui">
        <Joystick />
      </div>
    </div>
  );
};

export default VideoChatApp;
