import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Phone, Video, Smile, ThumbsUp } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import toast from 'react-hot-toast';

interface MessageItem {
  id: string;
  sender: string;
  text?: string;
  image_url?: string;
  isMe: boolean;
  time: string;
  reaction?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: '1', sender: 'alex_tech', text: 'Hey Sahil! Loved your latest Instagram post! 🚀', isMe: false, time: '10:42 AM' },
    { id: '2', sender: 'sahil_monpara', text: 'Thanks Alex! Appreciate the feedback. 🔥', isMe: true, time: '10:44 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { startCall } = useCall();

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imgUrl = evt.target?.result as string;
        setSelectedImage(imgUrl);
        toast.success("Image attached to message");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;

    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'sahil_monpara',
      text: inputText.trim(),
      image_url: selectedImage || undefined,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    setSelectedImage(null);

    // Simulated AI Auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'alex_tech',
        text: 'That looks awesome! Are we starting a live WebRTC video call today?',
        isMe: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, reaction: emoji };
      }
      return m;
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-3xl h-[550px] rounded-2xl flex overflow-hidden shadow-2xl">
        {/* CONTACTS SIDEBAR */}
        <div className="w-72 border-r border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border font-bold text-sm text-white">
            Direct Messages
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-dark-card border-l-4 border-instagram-blue cursor-pointer">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-10 h-10 rounded-full object-cover" alt="Alex" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">alex_tech</span>
                <span className="text-[10px] text-emerald-400">Active now</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" className="w-10 h-10 rounded-full object-cover" alt="Sarah" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">sarah_m</span>
                <span className="text-[10px] text-neutral-400">Active 15m ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHAT THREAD */}
        <div className="flex-1 flex flex-col bg-dark-primary">
          {/* HEADER */}
          <div className="h-14 border-b border-dark-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-8 h-8 rounded-full object-cover" alt="Alex" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">alex_tech</span>
                <span className="text-[10px] text-neutral-400">Active now</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startCall('alex_tech', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'voice')}
                className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg"
                title="Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => startCall('alex_tech', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'video')}
                className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg"
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs flex flex-col gap-1.5 relative group ${m.isMe ? 'bg-instagram-blue text-white self-end' : 'bg-dark-card text-neutral-200 self-start'}`}
              >
                {m.image_url && (
                  <img src={m.image_url} className="w-48 h-36 object-cover rounded-lg" alt="Attachment" />
                )}
                {m.text && <span>{m.text}</span>}
                <div className="flex justify-between items-center text-[9px] opacity-70">
                  <span>{m.time}</span>
                  {m.reaction && <span className="text-sm">{m.reaction}</span>}
                </div>

                {/* EMOJI REACTION HOVER */}
                <div className="absolute -top-6 right-0 bg-dark-secondary border border-dark-border px-2 py-0.5 rounded-full flex gap-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg">
                  {['❤️', '🔥', '👍', '😂'].map(emoji => (
                    <button key={emoji} onClick={() => handleAddReaction(m.id, emoji)} className="text-xs hover:scale-125 transition">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ATTACHMENT PREVIEW */}
          {selectedImage && (
            <div className="px-4 py-2 bg-dark-secondary border-t border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <ImageIcon className="w-4 h-4 text-instagram-blue" /> Image attached
              </div>
              <button onClick={() => setSelectedImage(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* INPUT BAR */}
          <div className="p-3 border-t border-dark-border flex items-center gap-2">
            <label className="p-2 text-neutral-400 hover:text-white cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
            </label>
            <input
              type="text"
              placeholder="Message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-dark-secondary border border-dark-border rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-instagram-blue"
            />
            <button onClick={handleSend} className="p-2 text-instagram-blue font-bold text-xs hover:text-blue-400">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
