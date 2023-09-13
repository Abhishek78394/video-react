import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigation = useNavigate()
    const [email, setEmail] = useState()
    const [room, setRoom] = useState()
    const { socket } = useSocket();
    // const handleRoomJoined = ({ roomId }) => {
    //     console.log("Room joined", roomId)
    //     navigation(`/room/${roomId}`)
    // }
    const handleRoomJoined = useCallback(
        ({ roomId }) => {
            console.log("Room joined", roomId)
        navigation(`/room/${roomId}`)    
        },
        []
    )
    useEffect(() => {
        socket.on('joined_room', handleRoomJoined)
        return ()=>{
        socket.off('joined_room', handleRoomJoined)

        }
    }, [socket,handleRoomJoined])


    const handleJoinRoom = () => {
        socket.emit('join_room', { roomId: room, emailId: email })

    }
    return (
        <>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder='Enter Your email here' /> <br /> <br />
            <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder='Enter Room code' /> <br /> <br />
            <button onClick={handleJoinRoom}>Enter Room</button>
        </>
    )
}

export default Home