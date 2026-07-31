import React, { useState } from 'react';
import { X, Send, Image, Phone, Video } from 'lucide-react';
import { useCall } from '../../context/CallContext';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'alex_tech', text: 'Hey Sahil! Loved your latest Instagram post! 🚀', isMe: false, time: '10:42 AM' },
    { id: '2', sender: 'sahil_monpara', text: 'Thanks Alex! Appreciate the feedback. 🔥', isMe: true, time: '10:44 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  const { startCall } = useCall();

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'sahil_monpara',
      text: inputText.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulated AI Auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'alex_tech',
        text: 'That sounds amazing! Are we doing a live video call today?',
        isMe: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-3xl h-[550px] rounded-2xl flex overflow-hidden shadow-2xl">
        {/* CONTACTS SIDEBAR */}
        <div className="w-72 border-r border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border font-bold text-sm text-white">
            Messages
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-dark-card border-l-4 border-instagram-blue cursor-pointer">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-10 h-10 rounded-full object-cover" alt="Alex" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">alex_tech</span>
                <span className="text-[10px] text-emerald-400">Active now</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHAT THREAD */}
        <div className="flex-1 flex flex-col bg-dark-primary">
          <div className="h-14 border-b border-dark-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-8 h-8 rounded-full object-cover" alt="Alex" />
              <span className="text-sm font-semibold text-white">alex_tech</span>
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

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs flex flex-col gap-1 ${m.isMe ? 'bg-instagram-blue text-white self-end' : 'bg-dark-card text-neutral-200 self-start'}`}
              >
                <span>{m.text}</span>
                <span className="text-[9px] opacity-70 self-end">{m.time}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-dark-border flex items-center gap-2">
            <button className="p-2 text-neutral-400 hover:text-white">
              <Image className="w-5 h-5" />
            </button>
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
