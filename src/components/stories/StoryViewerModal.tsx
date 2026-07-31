import React, { useEffect, useState } from 'react';
import { X, Heart, Send, Pause, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export interface StoryItemData {
  id: string;
  username: string;
  avatar_url: string;
  media_url: string;
  timeAgo: string;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: StoryItemData[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialIndex,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsLiked(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            setIsLiked(false);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, isPaused, stories.length, onClose]);

  if (!isOpen || !stories.length) return null;

  const currentStory = stories[currentIndex] || stories[0];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setIsLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setIsLiked(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast.success(`Story reply sent to ${currentStory.username}`);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* CLOSE BUTTON */}
      <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white z-50 p-2">
        <X className="w-6 h-6" />
      </button>

      {/* STORY CONTAINER CARD */}
      <div className="relative w-full max-w-sm h-[680px] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* TOP PROGRESS BARS */}
        <div className="absolute top-0 left-0 w-full p-3 z-30 flex flex-col gap-2 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex gap-1.5 w-full">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* USER HEADER */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2.5">
              <img src={currentStory.avatar_url} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="Avatar" />
              <span className="text-xs font-semibold text-white">{currentStory.username}</span>
              <span className="text-[10px] text-neutral-400">{currentStory.timeAgo || '3h'}</span>
            </div>

            <button onClick={() => setIsPaused(!isPaused)} className="text-white/80 hover:text-white p-1">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* CLICK REGIONS FOR NEXT/PREV */}
        <div className="absolute inset-0 flex z-20">
          <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer" />
          <div onClick={() => setIsPaused(!isPaused)} className="w-1/3 h-full cursor-pointer" />
          <div onClick={handleNext} className="w-1/3 h-full cursor-pointer" />
        </div>

        {/* STORY MEDIA IMAGE */}
        <img
          src={currentStory.media_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          className="w-full h-full object-cover"
          alt="Story Content"
        />

        {/* BOTTOM STORY REPLY & LIKE */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center gap-3">
          <input
            type="text"
            placeholder={`Send message to ${currentStory.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none backdrop-blur-md"
          />

          <button onClick={handleSendReply} className="p-2 text-white hover:text-neutral-300">
            <Send className="w-5 h-5" />
          </button>

          <button onClick={() => setIsLiked(!isLiked)} className="p-2 text-white">
            <Heart className={`w-6 h-6 ${isLiked ? 'text-instagram-like fill-instagram-like' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
