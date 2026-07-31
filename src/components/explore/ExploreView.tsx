import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, User, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ExploreViewProps {
  onOpenUserProfile?: (username: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onOpenUserProfile }) => {
  const { profile: myProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [explorePosts, setExplorePosts] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Persistent Follow state map
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_following_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // FETCH REAL EXPLORE POSTS ON MOUNT
  useEffect(() => {
    fetchRealExplorePosts();
  }, []);

  // REAL-TIME DEBOUNCED SEARCH USER ACCOUNTS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        searchUsers(searchTerm.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, myProfile?.username]);

  const fetchRealExplorePosts = async () => {
    let localUserPosts: any[] = [];
    try {
      localUserPosts = JSON.parse(localStorage.getItem('insta_user_posts') || '[]');
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const merged = [...localUserPosts, ...data];
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
        setExplorePosts(unique);
      } else {
        setExplorePosts(localUserPosts);
      }
    } catch (e) {
      setExplorePosts(localUserPosts);
    }
  };

  const searchUsers = async (query: string) => {
    setLoadingSearch(true);
    const cleanQuery = query.toLowerCase().replace('@', '');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
        .limit(10);

      if (!error && data) {
        // EXCLUDE LOGGED-IN USER FROM SEARCH RESULTS
        const filtered = data.filter((u: any) => u.username !== myProfile?.username && u.id !== myProfile?.id);
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const toggleFollow = async (targetUsername: string) => {
    const isCurrentlyFollowing = !!followingMap[targetUsername];
    const newStatus = !isCurrentlyFollowing;

    const updatedMap = { ...followingMap, [targetUsername]: newStatus };
    setFollowingMap(updatedMap);
    localStorage.setItem('insta_following_map', JSON.stringify(updatedMap));

    toast(newStatus ? `Following @${targetUsername}` : `Unfollowed @${targetUsername}`);

    try {
      if (myProfile?.id) {
        if (newStatus) {
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
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pt-2">
      {/* INSTAGRAM REAL-TIME SEARCH BAR */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by username or display name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-dark-secondary border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-instagram-blue"
        />
        {loadingSearch && (
          <Loader2 className="w-5 h-5 absolute right-3.5 top-3.5 text-instagram-blue animate-spin" />
        )}
      </div>

      {/* INSTAGRAM-STYLE USER SEARCH RESULTS */}
      {searchTerm.trim().length > 0 ? (
        <div className="bg-dark-secondary border border-dark-border rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
          <span className="text-xs font-semibold text-neutral-400">Search Results</span>
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No accounts matching "{searchTerm}"
            </div>
          ) : (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => onOpenUserProfile && onOpenUserProfile(user.username)}
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0"
                    alt={user.username}
                  />
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold text-white truncate">@{user.username}</span>
                    <span className="text-xs text-neutral-400 truncate">{user.full_name || 'Instagram User'}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user.username)}
                  className={`font-semibold text-xs px-4 py-1.5 rounded-lg transition ${followingMap[user.username] ? 'bg-dark-card text-neutral-300 border border-dark-border' : 'bg-instagram-blue hover:bg-blue-600 text-white'}`}
                >
                  {followingMap[user.username] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TRENDING HASHTAG PILLS */
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
      )}

      {/* REAL EXPLORE POSTS GRID (NO PLACEHOLDER DEMO IMAGES) */}
      {explorePosts.length === 0 ? (
        <div className="bg-dark-secondary border border-dark-border rounded-2xl p-16 text-center flex flex-col items-center gap-4 text-neutral-400">
          <div className="p-4 rounded-full bg-dark-card border border-dark-border">
            <Camera className="w-10 h-10 stroke-1 text-neutral-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Explore Content</h3>
            <p className="text-xs max-w-xs text-neutral-400">No public photos or videos have been published yet. Share a post to see it featured on Explore!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {explorePosts.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-dark-card">
              <img src={img.image_url || img.url} className="w-full h-full object-cover transition transform group-hover:scale-105" alt="Explore" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-bold">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{img.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{img.comments_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
