import React, { useCallback, useEffect, useMemo, useState } from 'react';

const PeerContext = React.createContext(null);

export const usePeer = () => {
  return React.useContext(PeerContext);
};

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(() => {
    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    };
    return new RTCPeerConnection(configuration);
  }, []);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemote = async (ans) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = async (stream) => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        const sender = peer.getSenders().find((s) => s.track === track);
        if (sender) {
          console.log(sender,"sender")
          peer.removeTrack(sender);
        }
        console.log(track,"track")
        peer.addTrack(track, stream);
      });
    } else {
      console.error('Stream is null or undefined');
    }
  };

  const handleTrackEvent = useCallback((event) => {
    const streams = event.streams;
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent);
    return () => {
      peer.removeEventListener('track', handleTrackEvent);
    };
  }, [handleTrackEvent, peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemote,
        sendStream,
        remoteStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
