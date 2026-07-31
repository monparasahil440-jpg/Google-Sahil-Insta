import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CallContextType {
  inCall: boolean;
  incomingCall: { callerName: string; callerAvatar: string; callType: 'video' | 'voice' } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'video' | 'voice';
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  startCall: (targetName: string, targetAvatar: string, type: 'video' | 'voice') => Promise<void>;
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

  useEffect(() => {
    // Listen for incoming WebRTC call signals via Supabase Realtime
    const channel = supabase
      .channel('public:call_signals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals' }, (payload) => {
        const signal = payload.new;
        if (signal.type === 'offer') {
          setIncomingCall({
            callerName: 'alex_tech',
            callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            callType: 'video'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startCall = async (targetName: string, targetAvatar: string, type: 'video' | 'voice') => {
    setCallType(type);
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
        setRemoteStream(event.streams[0]);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer signal
      await supabase.from('call_signals').insert([{
        caller_id: '00000000-0000-0000-0000-000000000000',
        receiver_id: '00000000-0000-0000-0000-000000000001',
        type: 'offer',
        sdp_data: offer
      }]);

      startTimer();
      toast.success(`Calling ${targetName}...`);
    } catch (err: any) {
      toast.error(`Call failed: ${err.message}`);
    }
  };

  const acceptCall = async () => {
    setIncomingCall(null);
    setInCall(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      startTimer();
    } catch (e) {
      toast.error("Could not access camera/mic");
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    toast("Call declined");
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setIncomingCall(null);
    clearInterval(timerRef.current);
    setCallDuration(0);
    toast("Call ended");
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
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
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(screenStream);
        setIsScreenSharing(true);
      } catch (err) {
        toast.error("Screen share canceled");
      }
    } else {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(camStream);
      setIsScreenSharing(false);
    }
  };

  return (
    <CallContext.Provider value={{
      inCall, incomingCall, localStream, remoteStream, callType, isMuted, isVideoOff, isScreenSharing, callDuration,
      startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within CallProvider");
  return context;
};
