import React, { useState } from 'react';
import { X, Copy, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postUrl = window.location.href }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToUser = (user: string) => {
    toast.success(`Post sent to @${user} in Direct Message!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="h-12 border-b border-dark-border px-4 flex items-center justify-between font-semibold text-sm">
          <span>Share Post</span>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-dark-primary border border-dark-border rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 bg-transparent text-xs text-neutral-300 focus:outline-none px-2"
            />
            <button
              onClick={handleCopy}
              className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-400">Send via Direct Message</span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {[
                { name: 'alex_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                { name: 'sarah_m', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
                { name: 'code_ninja', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
              ].map((u) => (
                <div
                  key={u.name}
                  onClick={() => handleSendToUser(u.name)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <span className="text-xs font-semibold text-white">{u.name}</span>
                  </div>
                  <Send className="w-4 h-4 text-instagram-blue" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
