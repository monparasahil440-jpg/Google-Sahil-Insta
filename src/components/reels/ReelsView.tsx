import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Volume2, VolumeX, Music } from 'lucide-react';

const reelsData = [
  {
    id: 'r1',
    username: 'drone_view',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-dramatic-waterfall-in-a-forest-43048-large.mp4',
    caption: 'Nature is unbelievable 🌲💧 #nature #drone #explore',
    audio: 'Original Audio - drone_view',
    likes: '14.8k',
    comments: '392'
  },
  {
    id: 'r2',
    username: 'city_vibes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-tokyo-street-with-neon-lights-at-night-42872-large.mp4',
    caption: 'Tokyo lights at night 🌃✨',
    audio: 'Synthwave Beats - Cyber',
    likes: '52.1k',
    comments: '1,204'
  }
];

export const ReelsView: React.FC = () => {
  const [muted, setMuted] = useState(true);

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto w-full pt-2">
      {reelsData.map((reel) => (
        <div key={reel.id} className="relative w-full h-[calc(100vh-80px)] max-h-[700px] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end">
          <video
            src={reel.video_url}
            loop
            autoPlay
            muted={muted}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* SOUND TOGGLE BUTTON */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-4 right-4 bg-black/60 p-2.5 rounded-full text-white backdrop-blur-md z-10"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* REEL OVERLAY CONTENT */}
          <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
            <div className="flex flex-col gap-3 text-white max-w-[80%]">
              <div className="flex items-center gap-3">
                <img src={reel.avatar} className="w-9 h-9 rounded-full object-cover border border-white/20" alt="Avatar" />
                <span className="font-semibold text-sm">{reel.username}</span>
                <button className="border border-white text-white text-xs px-3 py-1 rounded-lg font-semibold hover:bg-white/20 transition">
                  Follow
                </button>
              </div>

              <p className="text-xs text-neutral-200 line-clamp-2">{reel.caption}</p>

              <div className="flex items-center gap-2 text-xs opacity-90">
                <Music className="w-3.5 h-3.5 animate-spin" />
                <span>{reel.audio}</span>
              </div>
            </div>

            {/* REEL ACTIONS SIDEBAR */}
            <div className="flex flex-col gap-5 items-center text-white">
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-2.5 rounded-full bg-black/40 group-hover:bg-white/20 transition">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">{reel.likes}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-2.5 rounded-full bg-black/40 group-hover:bg-white/20 transition">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">{reel.comments}</span>
              </button>

              <button className="p-2.5 rounded-full bg-black/40 hover:bg-white/20 transition">
                <Send className="w-6 h-6" />
              </button>

              <button className="p-2.5 rounded-full bg-black/40 hover:bg-white/20 transition">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
