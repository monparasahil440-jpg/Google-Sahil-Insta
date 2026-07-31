import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, PhoneCall, Check, X } from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const CallModal: React.FC = () => {
  const {
    inCall, incomingCall, localStream, remoteStream, callType, isMuted, isVideoOff, isScreenSharing, callDuration,
    acceptCall, rejectCall, endCall, toggleMute, toggleVideo, toggleScreenShare
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // INCOMING CALL OVERLAY
  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-dark-secondary border border-dark-border p-6 rounded-2xl flex flex-col items-center gap-4 text-center max-w-xs w-full shadow-2xl animate-bounce">
          <img src={incomingCall.callerAvatar} className="w-20 h-20 rounded-full object-cover border-2 border-instagram-blue" alt="Caller" />
          <div>
            <h3 className="font-bold text-white text-lg">{incomingCall.callerName}</h3>
            <p className="text-xs text-neutral-400">Incoming {incomingCall.callType} call...</p>
          </div>
          <div className="flex gap-6 mt-2">
            <button onClick={rejectCall} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition">
              <X className="w-6 h-6" />
            </button>
            <button onClick={acceptCall} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition">
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inCall) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-4xl h-[600px] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
        {/* CALL HEADER */}
        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>WebRTC Connected</span>
          <span className="font-mono text-neutral-300">{formatDuration(callDuration)}</span>
        </div>

        {/* MAIN VIDEO DISPLAY */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white">
              <PhoneCall className="w-16 h-16 animate-pulse text-instagram-blue" />
              <span className="text-sm font-semibold">Connecting WebRTC P2P Stream...</span>
            </div>
          )}

          {/* LOCAL PIP VIDEO */}
          {callType === 'video' && (
            <div className="absolute bottom-4 right-4 w-40 h-28 bg-dark-card border border-white/20 rounded-xl overflow-hidden shadow-lg">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          )}
        </div>

        {/* CALL CONTROLS TOOLBAR */}
        <div className="h-20 bg-dark-primary border-t border-dark-border flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className={`p-3.5 rounded-full transition ${isMuted ? 'bg-red-600 text-white' : 'bg-dark-card hover:bg-white/10 text-white'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full transition ${isVideoOff ? 'bg-red-600 text-white' : 'bg-dark-card hover:bg-white/10 text-white'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition ${isScreenSharing ? 'bg-instagram-blue text-white' : 'bg-dark-card hover:bg-white/10 text-white'}`}
            title="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          <button
            onClick={endCall}
            className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-lg"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
