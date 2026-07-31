import React, { useState, useEffect } from 'react';
import { Settings, Edit3, Grid, Bookmark, Tag, Heart, MessageCircle, LogOut, CheckCircle2, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ProfileViewProps {
  targetUsername?: string;
  onBackToSelf?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ targetUsername }) => {
  const { profile: myProfile, updateProfileState, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetProfileData, setTargetProfileData] = useState<any>(null);
  
  // FOLLOW STATES AND LIVE COUNTS
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    if (!targetUsername) return false;
    try {
      const saved = localStorage.getItem('insta_following_map');
      const map = saved ? JSON.parse(saved) : {};
      return !!map[targetUsername];
    } catch (e) {
      return false;
    }
  });

  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  const isOwnProfile = !targetUsername || targetUsername === myProfile?.username;

  // FETCH REAL TARGET USER PROFILE FROM SUPABASE
  useEffect(() => {
    if (!isOwnProfile && targetUsername) {
      fetchTargetProfile(targetUsername);
    } else {
      setTargetProfileData(null);
    }
  }, [targetUsername, isOwnProfile]);

  const fetchTargetProfile = async (uname: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', uname)
        .single();

      if (!error && data) {
        setTargetProfileData(data);
      }
    } catch (e) {}
  };

  const displayedProfile = isOwnProfile ? myProfile : (targetProfileData || {
    username: targetUsername,
    full_name: targetUsername,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    bio: `Instagram Creator @${targetUsername}`,
    website: '',
    is_verified: false,
    followers: followerCount,
    following: followingCount,
  });

  // Edit Profile form state
  const [editFullName, setEditFullName] = useState(myProfile?.full_name || '');
  const [editUsername, setEditUsername] = useState(myProfile?.username || '');
  const [editBio, setEditBio] = useState(myProfile?.bio || '');
  const [editWebsite, setEditWebsite] = useState(myProfile?.website || '');
  const [editAvatar, setEditAvatar] = useState(myProfile?.avatar_url || '');

  useEffect(() => {
    fetchUserPosts();
    fetchSavedPosts();
    fetchLiveFollowCounts();
  }, [myProfile?.username, targetUsername]);

  const fetchLiveFollowCounts = async () => {
    const currentUsername = isOwnProfile ? myProfile?.username : targetUsername;
    const currentUserId = isOwnProfile ? myProfile?.id : targetProfileData?.id;

    if (!currentUsername) return;

    try {
      const { data: followersData } = await supabase
        .from('followers')
        .select('*')
        .eq('target_username', currentUsername);

      if (followersData) {
        setFollowerCount(followersData.length);
        if (!isOwnProfile && myProfile?.id) {
          const iAmFollowing = followersData.some((r: any) => r.follower_id === myProfile.id || r.follower_id === myProfile.username);
          setIsFollowing(iAmFollowing);
        }
      }

      if (currentUserId) {
        const { data: followingData } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUserId);

        if (followingData) {
          setFollowingCount(followingData.length);
        }
      }
    } catch (e) {}
  };

  const fetchUserPosts = async () => {
    let localPosts: any[] = [];
    try {
      const saved = localStorage.getItem('insta_user_posts');
      if (saved) {
        localPosts = JSON.parse(saved);
      }
    } catch (e) {}

    const filterUsername = isOwnProfile ? myProfile?.username : targetUsername;
    const filteredLocal = localPosts.filter(p => p.username === filterUsername || (isOwnProfile && p.user_id === myProfile?.id));

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbUserPosts = data.filter((p: any) => p.user_id === myProfile?.id || p.username === filterUsername);
        const merged = [...filteredLocal, ...dbUserPosts];
        const unique = Array.from(new Map(merged.map(item => [item.id || item.image_url, item])).values());
        setUserPosts(unique);
      } else {
        setUserPosts(filteredLocal);
      }
    } catch (e) {
      setUserPosts(filteredLocal);
    }
  };

  const fetchSavedPosts = async () => {
    let localSaved: any[] = [];
    try {
      const savedMapRaw = localStorage.getItem('insta_saved_post_ids');
      const allUserPostsRaw = localStorage.getItem('insta_user_posts');
      if (savedMapRaw && allUserPostsRaw) {
        const savedMap = JSON.parse(savedMapRaw);
        const allPosts = JSON.parse(allUserPostsRaw);
        localSaved = allPosts.filter((p: any) => savedMap[p.id]);
      }
    } catch (e) {}

    try {
      if (myProfile?.id) {
        const { data, error } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', myProfile.id);

        if (!error && data && data.length > 0) {
          const savedIds = data.map((r: any) => r.post_id);
          const { data: dbPosts } = await supabase.from('posts').select('*').in('id', savedIds);
          const mergedSaved = [...localSaved, ...(dbPosts || [])];
          const uniqueSaved = Array.from(new Map(mergedSaved.map(p => [p.id, p])).values());
          setSavedPosts(uniqueSaved);
          return;
        }
      }
      setSavedPosts(localSaved);
    } catch (e) {
      setSavedPosts(localSaved);
    }
  };

  useEffect(() => {
    if (myProfile) {
      setEditFullName(myProfile.full_name || '');
      setEditUsername(myProfile.username || '');
      setEditBio(myProfile.bio || '');
      setEditWebsite(myProfile.website || '');
      setEditAvatar(myProfile.avatar_url || '');
    }
  }, [myProfile, isEditOpen]);

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

  const toggleFollowTarget = async () => {
    if (!targetUsername) return;

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowerCount(prev => prev + (nextState ? 1 : -1));

    const savedMap = JSON.parse(localStorage.getItem('insta_following_map') || '{}');
    savedMap[targetUsername] = nextState;
    localStorage.setItem('insta_following_map', JSON.stringify(savedMap));

    toast(nextState ? `Following @${targetUsername}` : `Unfollowed @${targetUsername}`);

    try {
      if (myProfile?.id) {
        if (nextState) {
          await supabase.from('followers').insert([{
            follower_id: myProfile.id,
            target_username: targetUsername
          }]);
        } else {
          await supabase.from('followers').delete().eq('follower_id', myProfile.id).eq('target_username', targetUsername);
        }
      }
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pt-2">
      {/* COVER PHOTO & HEADER */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
        <img src={displayedProfile?.cover_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'} className="w-full h-44 object-cover opacity-60" alt="Cover" />
        
        <div className="p-6 pt-0 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative z-10">
          <div className="w-32 h-32 rounded-full p-1 instagram-story-ring flex items-center justify-center shrink-0 bg-dark-secondary">
            <img
              src={displayedProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayedProfile?.username || 'me'}`}
              className="w-full h-full rounded-full object-cover border-4 border-black"
              alt="Avatar"
            />
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
                    className={`font-semibold text-xs px-6 py-2 rounded-xl transition shadow-md ${isFollowing ? 'bg-dark-card border border-dark-border text-white' : 'bg-instagram-blue hover:bg-blue-600 text-white'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* REAL USER STATS */}
            <div className="flex gap-6 text-sm">
              <span><strong className="text-white">{userPosts.length}</strong> posts</span>
              <span><strong className="text-white">{followerCount}</strong> followers</span>
              <span><strong className="text-white">{followingCount}</strong> following</span>
            </div>

            <div>
              <h2 className="font-semibold text-white text-sm">{displayedProfile?.full_name}</h2>
              <p className="text-xs text-neutral-300 mt-0.5">{displayedProfile?.bio || 'No bio added yet.'}</p>
              {displayedProfile?.website && (
                <a href={displayedProfile.website} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-400 hover:underline mt-1 inline-block">
                  🔗 {displayedProfile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
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
          onClick={() => {
            fetchSavedPosts();
            setActiveTab('saved');
          }}
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

      {/* TAB CONTENT GRID */}
      {activeTab === 'posts' && (
        userPosts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white stroke-1" />
            </div>
            <h3 className="text-xl font-bold text-white mt-1">No Posts Yet</h3>
            <p className="text-xs max-w-xs">When you share photos and videos, they will appear on your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {userPosts.map((p, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-dark-card">
                <img src={p.image_url || p.url} className="w-full h-full object-cover transition transform group-hover:scale-105" alt="User Post" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-bold">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{p.likes_count || p.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{p.comments_count || p.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'saved' && (
        savedPosts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-white stroke-1" />
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Save Photos and Videos</h3>
            <p className="text-xs max-w-xs">Save photos and videos that you want to see again. Only you can see what you've saved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {savedPosts.map((p, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-dark-card">
                <img src={p.image_url || p.url} className="w-full h-full object-cover transition transform group-hover:scale-105" alt="Saved Post" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-bold">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{p.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'tagged' && (
        <div className="py-16 text-center flex flex-col items-center gap-3 text-neutral-400">
          <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
            <Tag className="w-8 h-8 text-white stroke-1" />
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Photos of you</h3>
          <p className="text-xs max-w-xs">When people tag you in photos, they'll appear here.</p>
        </div>
      )}

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
