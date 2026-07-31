import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CallContextType {
  inCall: boolean;
  incomingCall: { callerName: string; callerAvatar: string; callType: 'video' | 'voice'; offerSdp: any } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'video' | 'voice';
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  startCall: (targetUsername: string, isVideo?: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile: myProfile } = useAuth();

  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<any>(null);
  const targetUserRef = useRef<string | null>(null);

  // SUPABASE REALTIME WEBRTC CALL SIGNALING CHANNEL
  useEffect(() => {
    if (!myProfile?.username) return;

    const channel = supabase.channel('global_webrtc_call_channel', {
      config: { broadcast: { self: true } }
    });

    channel.on('broadcast', { event: 'call_signal' }, async ({ payload }) => {
      if (!payload) return;

      const myUname = myProfile.username;
      const myId = myProfile.id;

      // 1. INCOMING CALL OFFER
      if (payload.type === 'offer' && (payload.targetUsername === myUname || payload.targetUsername === myId)) {
        setIncomingCall({
          callerName: payload.callerName,
          callerAvatar: payload.callerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.callerName}`,
          callType: payload.callType || 'video',
          offerSdp: payload.offerSdp
        });
        targetUserRef.current = payload.callerName;
        toast(`Incoming ${payload.callType || 'video'} call from @${payload.callerName}`, { duration: 5000 });
      }

      // 2. RECEIVE CALL ANSWER
      if (payload.type === 'answer' && (payload.targetUsername === myUname || payload.targetUsername === myId)) {
        if (peerRef.current && payload.answerSdp) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.answerSdp));
          toast.success("Call connected!");
        }
      }

      // 3. RECEIVE ICE CANDIDATE
      if (payload.type === 'ice_candidate' && (payload.targetUsername === myUname || payload.targetUsername === myId)) {
        if (peerRef.current && payload.candidate) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {}
        }
      }

      // 4. RECEIVE END CALL OR REJECT SIGNAL
      if ((payload.type === 'end_call' || payload.type === 'reject_call') && (payload.targetUsername === myUname || payload.targetUsername === myId)) {
        cleanupCallState();
        toast("Call ended");
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myProfile?.username, myProfile?.id]);

  const startTimer = () => {
    setCallDuration(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const cleanupCallState = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    clearInterval(timerRef.current);
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setCallDuration(0);
  };

  const startCall = async (targetUsername: string, isVideo = true) => {
    const type = isVideo ? 'video' : 'voice';
    setCallType(type);
    targetUserRef.current = targetUsername;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      setLocalStream(stream);
      setInCall(true);

      const pc = new RTCPeerConnection(rtcConfig);
      peerRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          supabase.channel('global_webrtc_call_channel').send({
            type: 'broadcast',
            event: 'call_signal',
            payload: {
              type: 'ice_candidate',
              targetUsername,
              candidate: event.candidate
            }
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // BROADCAST OFFER TO TARGET USER OVER SUPABASE WEBSOCKET
      await supabase.channel('global_webrtc_call_channel').send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'offer',
          callerName: myProfile?.username || 'user',
          callerAvatar: myProfile?.avatar_url,
          callType: type,
          targetUsername,
          offerSdp: offer
        }
      });

      startTimer();
      toast.success(`Calling @${targetUsername}...`);
    } catch (err: any) {
      toast.error(`Could not start media call: ${err.message}`);
      cleanupCallState();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === 'video',
        audio: true,
      });

      setLocalStream(stream);
      setCallType(incomingCall.callType);
      setInCall(true);

      const pc = new RTCPeerConnection(rtcConfig);
      peerRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && incomingCall.callerName) {
          supabase.channel('global_webrtc_call_channel').send({
            type: 'broadcast',
            event: 'call_signal',
            payload: {
              type: 'ice_candidate',
              targetUsername: incomingCall.callerName,
              candidate: event.candidate
            }
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // BROADCAST ANSWER BACK TO CALLER
      await supabase.channel('global_webrtc_call_channel').send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'answer',
          targetUsername: incomingCall.callerName,
          answerSdp: answer
        }
      });

      setIncomingCall(null);
      startTimer();
      toast.success(`Call connected with @${incomingCall.callerName}`);
    } catch (err: any) {
      toast.error(`Accept call failed: ${err.message}`);
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall?.callerName) {
      supabase.channel('global_webrtc_call_channel').send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'reject_call',
          targetUsername: incomingCall.callerName
        }
      });
    }
    cleanupCallState();
  };

  const endCall = () => {
    if (targetUserRef.current) {
      supabase.channel('global_webrtc_call_channel').send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'end_call',
          targetUsername: targetUserRef.current
        }
      });
    }
    cleanupCallState();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerRef.current && localStream) {
          const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraTrack = cameraStream.getVideoTracks()[0];

        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        }
        setIsScreenSharing(false);
      }
    } catch (e) {}
  };

  return (
    <CallContext.Provider
      value={{
        inCall,
        incomingCall,
        localStream,
        remoteStream,
        callType,
        isMuted,
        isVideoOff,
        isScreenSharing,
        callDuration,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};
