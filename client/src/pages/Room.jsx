import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSocket } from '../contexts/SocketProvider'
import { useDispatch, useSelector } from "react-redux";
import { setAllRoomUsers } from '../store/globalSlice';

const Room = () => {
  const location = useLocation()
  const state = location.state
  const socket = useSocket()
  const dispatch = useDispatch()
  const allRoomUsers = useSelector((state) => state.global.allRoomUsers)

  // console.log("state", state);

  const handleUserJoin = useCallback(({email, id })=>{
    console.log(`${email} joined the room.`);


  }, [])

  const handleSetAllRoomUser = useCallback((data)=>{
    console.log("all room user", data);
    dispatch(setAllRoomUsers(data))
  }, [])


  useEffect(()=>{
    socket.on("user_join", handleUserJoin)
    socket.on("all_user", handleSetAllRoomUser)
    
    return ()=>{
      socket.off("all_user", handleSetAllRoomUser)
      socket.off("user_join", handleUserJoin)
    }

  }, [socket, handleUserJoin])

  return (
    <div>
      <h1>Room</h1>
      <p>Room ID: {state.room}</p>

      <p>{allRoomUsers?.length > 1 ?"connected":"no one in room"} </p>
    </div>
  )
}

export default Room