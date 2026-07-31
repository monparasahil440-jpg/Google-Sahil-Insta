import React, { useState } from 'react';
import { Settings, Edit3, Grid, Bookmark, Tag, Heart, MessageCircle, LogOut, CheckCircle2, Lock, Users, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileViewProps {
  targetUsername?: string;
  onBackToSelf?: () => void;
}

const mockUsersData: { [key: string]: any } = {
  alex_tech: {
    username: 'alex_tech',
    full_name: 'Alex Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    cover_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    bio: 'Tech enthusiast & Senior Frontend Engineer 💻⚡ Building open-source web apps.',
    website: 'https://github.com/alex_tech',
    is_verified: true,
    followers: '12.4k',
    following: '430',
    posts: [
      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', likes: 240, comments: 18 },
      { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', likes: 512, comments: 42 }
    ]
  },
  creative_coder: {
    username: 'creative_coder',
    full_name: 'Creative Coder Studio',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
    bio: 'Digital art & WebGL UI designs 🎨✨',
    website: 'https://creativecoder.design',
    is_verified: false,
    followers: '8.9k',
    following: '210',
    posts: [
      { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=400&q=80', likes: 310, comments: 27 },
      { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80', likes: 640, comments: 53 }
    ]
  },
  web3_pioneer: {
    username: 'web3_pioneer',
    full_name: 'Web3 Pioneer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    bio: 'Exploring decentralization, smart contracts & AI 🚀',
    website: 'https://web3pioneer.io',
    is_verified: false,
    followers: '5.1k',
    following: '180',
    posts: [
      { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80', likes: 890, comments: 64 }
    ]
  },
  design_weekly: {
    username: 'design_weekly',
    full_name: 'Design Weekly',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    bio: 'Curated UI/UX designs & design trends 💡',
    website: '',
    is_verified: true,
    followers: '45.2k',
    following: '95',
    posts: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', likes: 128, comments: 9 }
    ]
  }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ targetUsername }) => {
  const { profile: myProfile, updateProfileState, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !targetUsername || targetUsername === myProfile?.username;
  const targetData = !isOwnProfile ? (mockUsersData[targetUsername] || {
    username: targetUsername,
    full_name: targetUsername,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    bio: `Instagram Creator @${targetUsername}`,
    website: '',
    is_verified: false,
    followers: '1.2k',
    following: '340',
    posts: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', likes: 120, comments: 4 }
    ]
  }) : null;

  const displayedProfile = isOwnProfile ? myProfile : targetData;

  // Edit Profile form state
  const [editFullName, setEditFullName] = useState(myProfile?.full_name || '');
  const [editUsername, setEditUsername] = useState(myProfile?.username || '');
  const [editBio, setEditBio] = useState(myProfile?.bio || '');
  const [editWebsite, setEditWebsite] = useState(myProfile?.website || '');
  const [editAvatar, setEditAvatar] = useState(myProfile?.avatar_url || '');

  const userPosts = isOwnProfile ? [
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', likes: 142, comments: 2 },
    { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', likes: 89, comments: 1 },
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80', likes: 310, comments: 5 }
  ] : (targetData?.posts || []);

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

  const toggleFollowTarget = () => {
    setIsFollowing(!isFollowing);
    toast(isFollowing ? `Unfollowed @${displayedProfile?.username}` : `Following @${displayedProfile?.username}`);
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pt-2">
      {/* COVER PHOTO & HEADER */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
        <img src={displayedProfile?.cover_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'} className="w-full h-44 object-cover opacity-60" alt="Cover" />
        
        <div className="p-6 pt-0 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative z-10">
          <div className="w-32 h-32 rounded-full p-1 instagram-story-ring flex items-center justify-center shrink-0">
            <img src={displayedProfile?.avatar_url} className="w-full h-full rounded-full object-cover border-4 border-black" alt="Avatar" />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-white">{displayedProfile?.username}</h1>
                {displayedProfile?.is_verified && <CheckCircle2 className="w-5 h-5 text-instagram-blue fill-instagram-blue" />}
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
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
                  </>
                ) : (
                  <button
                    onClick={toggleFollowTarget}
                    className={`font-semibold text-xs px-6 py-2 rounded-xl transition flex items-center gap-2 shadow-md ${isFollowing ? 'bg-dark-card border border-dark-border text-white' : 'bg-instagram-blue hover:bg-blue-600 text-white'}`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <span><strong className="text-white">{userPosts.length}</strong> posts</span>
              <span><strong className="text-white">{displayedProfile?.followers || '1.4k'}</strong> followers</span>
              <span><strong className="text-white">{displayedProfile?.following || '520'}</strong> following</span>
            </div>

            <div>
              <h2 className="font-semibold text-white text-sm">{displayedProfile?.full_name}</h2>
              <p className="text-xs text-neutral-300 mt-0.5">{displayedProfile?.bio}</p>
              {displayedProfile?.website && (
                <a href={displayedProfile.website} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-400 hover:underline mt-1 inline-block">
                  🔗 {displayedProfile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* MUTUAL FRIENDS INFO */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
              <Users className="w-4 h-4 text-instagram-blue" />
              <span>Followed by <strong>alex_tech</strong>, <strong>sarah_m</strong> + 14 mutual friends</span>
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
