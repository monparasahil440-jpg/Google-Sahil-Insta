import React, { useState } from 'react';
import { Search, Heart, MessageCircle } from 'lucide-react';

const exploreGridImages = [
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', likes: 240, comments: 18 },
  { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=400&q=80', likes: 512, comments: 42 },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', likes: 128, comments: 9 },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80', likes: 890, comments: 64 },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80', likes: 310, comments: 27 },
  { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80', likes: 640, comments: 53 }
];

export const ExploreView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pt-2">
      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search posts, users, or #hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-dark-secondary border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-instagram-blue"
        />
      </div>

      {/* TRENDING HASHTAG PILLS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['#nature', '#photography', '#coding', '#reactjs', '#travel', '#design', '#web3', '#ai'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchTerm(tag)}
            className="px-4 py-1.5 rounded-full bg-dark-card border border-dark-border text-xs font-semibold text-neutral-300 hover:text-white hover:border-white/30 transition whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* EXPLORE GRID */}
      <div className="grid grid-cols-3 gap-3">
        {exploreGridImages.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-dark-card">
            <img src={img.url} className="w-full h-full object-cover transition transform group-hover:scale-105" alt="Explore" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-bold">
              <div className="flex items-center gap-1.5">
                <Heart className="w-5 h-5 fill-white" />
                <span>{img.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{img.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
