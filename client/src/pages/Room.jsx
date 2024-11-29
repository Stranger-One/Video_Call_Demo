import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import { setAllRoomUsers } from "../store/globalSlice";
import ReactPlayer from "react-player";
import peer from "../services/peer";

const Room = () => {
  const location = useLocation();
  const state = location.state;
  const socket = useSocket();
  const dispatch = useDispatch();
  const allRoomUsers = useSelector((state) => state.global.allRoomUsers);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  // console.log("state", state);
  const otherUsers = allRoomUsers.filter((user) => {
    if (user.email !== state.email) return user.id;
  });
  console.log(otherUsers);

  const handleUserJoin = useCallback(({ email, id }) => {
    console.log(`${email} joined the room.`);
  }, []);

  const handleSetAllRoomUser = useCallback((data) => {
    console.log("all room user", data);
    dispatch(setAllRoomUsers(data));
  }, []);

  const handleCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    // const answer = await peer.getAnswer()
    socket.emit("user_call", { to: otherUsers, offer });
    setMyStream(stream);
  }, []);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log("incomming call", { from, offer });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const answer = await peer.getAnswer(offer);
      socket.emit("user_answer", { from, answer });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const handleCallAnswer = useCallback(
    ({ answer }) => {
      peer.setLocalDescription(answer);
      console.log("Call Accepted");

      sendStream();
    },
    [sendStream, myStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer_nego_needed", { to: otherUsers, offer });
  }, [otherUsers, socket]);

  const handleNegoNeededIncomming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer_nego_needed_answer", { to: from, answer });
    },
    [socket]
  );

  const handleNegoNeededFinal = useCallback(
    async ({ to, answer }) => {
      await peer.setLocalDescription(answer);
    },
    [socket]
  );

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remote = e.streams;
      setRemoteStream(remote[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user_join", handleUserJoin);
    socket.on("all_user", handleSetAllRoomUser);
    socket.on("incomming_call", handleIncommingCall);
    socket.on("user_answer_resp", handleCallAnswer);
    socket.on("peer_nego_needed", handleNegoNeededIncomming);
    socket.on("peer_nego_needed_final", handleNegoNeededFinal);

    return () => {
      socket.off("all_user", handleSetAllRoomUser);
      socket.off("user_join", handleUserJoin);
      socket.off("incomming_call", handleIncommingCall);
      socket.off("user_answer_resp", handleCallAnswer);
      socket.off("peer_nego_needed", handleNegoNeededIncomming);
      socket.off("peer_nego_needed_final", handleNegoNeededFinal);
    };
  }, [socket, handleUserJoin]);

  return (
    <div>
      <h1>Room</h1>
      <p>Room ID: {state.room}</p>

      <p>{allRoomUsers?.length > 1 ? "connected" : "no one in room"} </p>
      {allRoomUsers?.length > 1 && <button onClick={handleCall}>Call</button>}
      {myStream && <button onClick={sendStream}>Send Stream</button>}
      {myStream && (
        <>
          <h1>my stream</h1>
          <ReactPlayer
            playing
            muted
            height="200px"
            width="300px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote stream</h1>
          <ReactPlayer
            playing
            muted
            height="200px"
            width="300px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default Room;
