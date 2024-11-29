import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import {useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { setAllRoomUsers } from "../store/globalSlice";


const Home = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch()


  const socket = useSocket();
  console.log(socket);

  const handleJoin = useCallback(
    (e) => {
      e.preventDefault();
      // console.log({email, room});
      socket.emit("room_join", { email, room });
    },
    [email, room]
  );

  const handelRoomJoin = useCallback((data) => {
    const { email, room, allUsers } = data;
    console.log({ email, room, allUsers });
    dispatch(setAllRoomUsers(allUsers))
    navigate(`/room/${room}`, { state: { email, room } });

  }, []);

  useEffect(() => {
    socket.on("room_join_success", handelRoomJoin);

    return () => {
      socket.off("room_join_success", handelRoomJoin);
    };
  }, [socket, handelRoomJoin]);

  return (
    <form onSubmit={handleJoin}>
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Enter your Email.."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <label htmlFor="room">Room Id:</label>
      <input
        type="text"
        name="room"
        id="room"
        placeholder="Enter your room.."
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <br />
      <button type="submit">Join</button>
    </form>
  );
};

export default Home;
