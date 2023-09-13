import React, { useEffect, useCallback, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';

const Room = () => {
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);
  const { peer, createOffer, createAnswer, setRemote, sendStream, remoteStream } = usePeer();
  const { socket } = useSocket();

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMyStream(stream);
    } catch (error) {
      console.error('Error accessing user media:', error);
    }
  }, []);

  const handleNewUserJoined = useCallback(async (data) => {
    const { emailId } = data;
    console.log("New user joined in a room", emailId);
    const offer = await createOffer();
    socket.emit('call-user', { emailId, offer });
    setRemoteEmailId(emailId);
  }, [socket, createOffer]);

  const handleIncomingCalls = useCallback(async (data) => {
    const { from, offer } = data;
    console.log("Incoming call from " + from, offer);
    const ans = await createAnswer(offer);
    socket.emit('call_accepted', { emailId: from, ans });
    setRemoteEmailId(from);
  }, [socket, createAnswer]);

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    console.log("Call accepted");
    await setRemote(ans);
  }, [setRemote]);

  useEffect(() => {
    socket.on('user_joined', handleNewUserJoined);
    socket.on('incoming-calls', handleIncomingCalls);
    socket.on('call_accepted', handleCallAccepted);

    return () => {
      socket.off('user_joined', handleNewUserJoined);
      socket.off('incoming-calls', handleIncomingCalls);
      socket.off('call_accepted', handleCallAccepted);
    };
  }, [handleNewUserJoined, handleIncomingCalls, handleCallAccepted, socket]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const handleNegotiation = useCallback(async () => {
    try {
      const localOffer = await peer.createOffer();
      await peer.setLocalDescription(localOffer);
      socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
    } catch (error) {
      console.error('Error during negotiation:', error);
    }
  }, [peer, socket, remoteEmailId]);

  useEffect(() => {
    peer.addEventListener('negotiationneeded', handleNegotiation);

    return () => {
      peer.removeEventListener('negotiationneeded', handleNegotiation);
    };
  }, [peer, handleNegotiation]);

  return (
    <>
      <h4>You are connected to {remoteEmailId}</h4>
      <button onClick={e => sendStream(myStream)}>Send my Stream</button>
      {myStream && <ReactPlayer url={myStream} playing muted />}
      {remoteStream && <ReactPlayer url={remoteStream} playing />}
    </>
  );
}

export default Room;
