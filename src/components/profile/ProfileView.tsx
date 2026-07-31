import React, { useState } from 'react';
import { Settings, Edit3, Grid, Bookmark, Tag, Heart, MessageCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ProfileView: React.FC = () => {
  const { profile, updateProfileState, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Profile form state
  const [editFullName, setEditFullName] = useState(profile?.full_name || '');
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editWebsite, setEditWebsite] = useState(profile?.website || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar_url || '');

  const userPosts = [
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', likes: 142, comments: 2 },
    { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', likes: 89, comments: 1 },
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80', likes: 310, comments: 5 }
  ];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setEditAvatar(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfileState({
      full_name: editFullName,
      username: editUsername,
      bio: editBio,
      website: editWebsite,
      avatar_url: editAvatar
    });
    toast.success("Profile updated!");
    setIsEditOpen(false);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of Instagram?")) {
      signOut();
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pt-2">
      {/* COVER PHOTO & HEADER */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
        <img src={profile?.cover_url} className="w-full h-44 object-cover opacity-60" alt="Cover" />
        
        <div className="p-6 pt-0 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative z-10">
          <div className="w-32 h-32 rounded-full p-1 instagram-story-ring flex items-center justify-center shrink-0">
            <img src={profile?.avatar_url} className="w-full h-full rounded-full object-cover border-4 border-black" alt="Avatar" />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-white">{profile?.username}</h1>
                {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-instagram-blue fill-instagram-blue" />}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="bg-dark-card hover:bg-white/10 text-white font-semibold text-xs px-4 py-2 rounded-xl border border-dark-border transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl bg-dark-card hover:bg-white/10 text-white border border-dark-border transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <span><strong className="text-white">{userPosts.length}</strong> posts</span>
              <span><strong className="text-white">1.4k</strong> followers</span>
              <span><strong className="text-white">520</strong> following</span>
            </div>

            <div>
              <h2 className="font-semibold text-white text-sm">{profile?.full_name}</h2>
              <p className="text-xs text-neutral-300 mt-0.5">{profile?.bio}</p>
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-400 hover:underline mt-1 inline-block">
                  🔗 {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS TRAY */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 border-b border-dark-border">
        {[
          { label: 'Travel ✈️', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80' },
          { label: 'Coding 💻', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80' },
          { label: 'Vibes ✨', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' }
        ].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-16 h-16 rounded-full p-0.5 border border-dark-border group-hover:border-white transition flex items-center justify-center">
              <img src={h.img} className="w-full h-full rounded-full object-cover" alt={h.label} />
            </div>
            <span className="text-xs text-neutral-300 font-medium">{h.label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-xl text-neutral-400">
            +
          </div>
          <span className="text-xs text-neutral-300 font-medium">New</span>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex justify-center gap-12 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 border-t-2 text-xs font-semibold tracking-wider transition ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-neutral-400'}`}
        >
          <Grid className="w-4 h-4" /> POSTS
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 border-t-2 text-xs font-semibold tracking-wider transition ${activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-neutral-400'}`}
        >
          <Bookmark className="w-4 h-4" /> SAVED
        </button>
        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex items-center gap-2 py-3 border-t-2 text-xs font-semibold tracking-wider transition ${activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-neutral-400'}`}
        >
          <Tag className="w-4 h-4" /> TAGGED
        </button>
      </div>

      {/* POSTS GRID WITH HOVER STATS */}
      <div className="grid grid-cols-3 gap-3">
        {userPosts.map((p, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-dark-card">
            <img src={p.url} className="w-full h-full object-cover transition transform group-hover:scale-105" alt="User Post" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-bold">
              <div className="flex items-center gap-1.5">
                <Heart className="w-5 h-5 fill-white" />
                <span>{p.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{p.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SETTINGS & LOGOUT DIALOG MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-dark-border w-full max-w-xs rounded-2xl overflow-hidden flex flex-col text-center shadow-2xl">
            <button className="p-3.5 border-b border-dark-border text-sm hover:bg-white/5">Apps and Websites</button>
            <button className="p-3.5 border-b border-dark-border text-sm hover:bg-white/5">QR Code</button>
            <button className="p-3.5 border-b border-dark-border text-sm hover:bg-white/5">Notifications</button>
            <button className="p-3.5 border-b border-dark-border text-sm hover:bg-white/5">Privacy & Security</button>
            <button onClick={handleLogout} className="p-3.5 border-b border-dark-border text-sm font-bold text-instagram-like hover:bg-white/5 flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
            <button onClick={() => setIsSettingsOpen(false)} className="p-3.5 text-sm text-neutral-400 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-dark-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-12 border-b border-dark-border flex items-center justify-between px-4 font-semibold text-sm">
              <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white">Cancel</button>
              <span>Edit Profile</span>
              <button onClick={handleSaveProfile} className="text-instagram-blue font-bold">Save</button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src={editAvatar} className="w-14 h-14 rounded-full object-cover" alt="Preview" />
                <div>
                  <span className="font-semibold text-sm text-white block">{editUsername}</span>
                  <label className="text-xs text-instagram-blue font-semibold cursor-pointer hover:underline">
                    Change profile photo
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="bg-dark-primary border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400 font-semibold">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="bg-dark-primary border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400 font-semibold">Website</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="bg-dark-primary border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400 font-semibold">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="bg-dark-primary border border-dark-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
