import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera, Upload, Sparkles, Plus } from 'lucide-react';
import { Post } from '../../types/database.types';
import { StoryViewerModal, StoryItemData } from '../stories/StoryViewerModal';
import { ShareModal } from './ShareModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../utils/imageCompressor';
import toast from 'react-hot-toast';

interface FeedViewProps {
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  onOpenUserProfile?: (username: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ isCreateOpen, onCloseCreate, onOpenUserProfile }) => {
  const { profile, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<StoryItemData[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [userAvatarsMap, setUserAvatarsMap] = useState<{ [key: string]: string }>({});
  const [userNamesMap, setUserNamesMap] = useState<{ [key: string]: string }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [doubleTapId, setDoubleTapId] = useState<string | null>(null);

  // Liked post IDs map for persistent likes
  const [likedPostIds, setLikedPostIds] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_liked_post_ids');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Saved post IDs map
  const [savedPostIds, setSavedPostIds] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_saved_post_ids');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // PERSISTENT FOLLOWING MAP
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_following_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Story Viewer state
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Photo studio creation state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [createMode, setCreateMode] = useState<'post' | 'story'>('post');

  // Load posts, profiles, followings, and user avatars on mount
  useEffect(() => {
    fetchUserProfilesMapFromSupabase();
    fetchRealPosts();
    fetchRealProfiles();
    fetchSavedPostsFromSupabase();
    fetchFollowingFromSupabase();
  }, [profile?.username, profile?.id]);

  const fetchUserProfilesMapFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        const avatars: { [key: string]: string } = {};
        const usernames: { [key: string]: string } = {};

        data.forEach((p: any) => {
          if (p.username && p.avatar_url) avatars[p.username] = p.avatar_url;
          if (p.id && p.avatar_url) avatars[p.id] = p.avatar_url;
          if (p.id && p.username) usernames[p.id] = p.username;
        });

        setUserAvatarsMap(avatars);
        setUserNamesMap(usernames);
      }
    } catch (e) {}
  };

  const fetchFollowingFromSupabase = async () => {
    if (!profile?.id && !profile?.username) return;
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*');

      if (!error && data) {
        const map: { [key: string]: boolean } = {};
        data.forEach((r: any) => {
          if (r.follower_id === profile?.id || r.follower_id === profile?.username) {
            map[r.target_username] = true;
            if (r.target_id) map[r.target_id] = true;
          }
        });
        setFollowingMap(prev => {
          const merged = { ...prev, ...map };
          localStorage.setItem('insta_following_map', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {}
  };

  const fetchRealPosts = async () => {
    let localUserPosts: Post[] = [];
    try {
      localUserPosts = JSON.parse(localStorage.getItem('insta_user_posts') || '[]');
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mappedDb = (data as any[]).map(p => {
          const isLiked = !!likedPostIds[p.id] || p.isLiked;
          return {
            ...p,
            username: p.username || userNamesMap[p.user_id] || (p.user_id === profile?.id ? profile?.username : null) || 'instagram_user',
            avatar_url: p.avatar_url || userAvatarsMap[p.user_id] || (p.user_id === profile?.id ? profile?.avatar_url : null),
            isLiked,
            likes_count: (p.likes_count || 0) + (isLiked ? 1 : 0)
          };
        });

        const merged = [...localUserPosts, ...mappedDb];
        const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values());
        setPosts(uniquePosts);
      } else {
        setPosts(localUserPosts);
      }
    } catch (e) {
      setPosts(localUserPosts);
    }
  };

  const fetchSavedPostsFromSupabase = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase.from('saved_posts').select('post_id').eq('user_id', profile.id);
      if (!error && data) {
        const map: { [key: string]: boolean } = {};
        data.forEach((row: any) => {
          map[row.post_id] = true;
        });
        setSavedPostIds(prev => ({ ...prev, ...map }));
        localStorage.setItem('insta_saved_post_ids', JSON.stringify({ ...savedPostIds, ...map }));
      }
    } catch (e) {}
  };

  const fetchRealProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(20);
      if (!error && data && data.length > 0) {
        const filtered = data.filter((u: any) => {
          const isSelf = u.username === profile?.username || u.id === profile?.id;
          const isAlreadyFollowing = !!followingMap[u.username] || !!followingMap[u.id];
          return !isSelf && !isAlreadyFollowing;
        });
        setSuggestedUsers(filtered);
      } else {
        setSuggestedUsers([]);
      }
    } catch (e) {
      setSuggestedUsers([]);
    }
  };

  const toggleLike = async (postId: string) => {
    let newIsLiked = false;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        newIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: newIsLiked,
          likes_count: p.likes_count + (newIsLiked ? 1 : -1)
        };
      }
      return p;
    }));

    const newLikedMap = { ...likedPostIds, [postId]: newIsLiked };
    setLikedPostIds(newLikedMap);
    localStorage.setItem('insta_liked_post_ids', JSON.stringify(newLikedMap));

    try {
      if (profile?.id) {
        if (newIsLiked) {
          await supabase.from('likes').insert([{ user_id: profile.id, post_id: postId }]);
        } else {
          await supabase.from('likes').delete().eq('user_id', profile.id).eq('post_id', postId);
        }
      }
    } catch (e) {}
  };

  const handleDoubleTap = (postId: string) => {
    toggleLike(postId);
    setDoubleTapId(postId);
    setTimeout(() => setDoubleTapId(null), 800);
  };

  const toggleSave = async (postId: string) => {
    const isSaved = !savedPostIds[postId];
    const newSavedMap = { ...savedPostIds, [postId]: isSaved };
    setSavedPostIds(newSavedMap);
    localStorage.setItem('insta_saved_post_ids', JSON.stringify(newSavedMap));

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isSaved };
      }
      return p;
    }));

    toast(isSaved ? "Saved to collection" : "Removed from saved");

    try {
      if (profile?.id) {
        if (isSaved) {
          await supabase.from('saved_posts').insert([{ user_id: profile.id, post_id: postId }]);
        } else {
          await supabase.from('saved_posts').delete().eq('user_id', profile.id).eq('post_id', postId);
        }
      }
    } catch (e) {}
  };

  const addComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text || !profile) return;

    const newComment = {
      id: 'c_' + Date.now(),
      post_id: postId,
      username: profile.username,
      text,
      likes_count: 0,
      created_at: 'Just now'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComments = [...(p.comments || []), newComment];
        return { ...p, comments: newComments, comments_count: newComments.length };
      }
      return p;
    }));

    try {
      await supabase.from('comments').insert([{
        id: newComment.id,
        user_id: profile.id,
        post_id: postId,
        text
      }]);
    } catch (e) {}

    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updatedComments = (p.comments || []).map(c => {
          if (c.id === commentId) {
            return { ...c, likes_count: (c.likes_count || 0) + 1 };
          }
          return c;
        });
        return { ...p, comments: updatedComments };
      }
      return p;
    }));
    toast.success("Comment liked!");
  };

  const toggleFollow = async (targetUsername: string) => {
    const isCurrentlyFollowing = !!followingMap[targetUsername];
    const newFollowingStatus = !isCurrentlyFollowing;

    const updatedMap = { ...followingMap, [targetUsername]: newFollowingStatus };
    setFollowingMap(updatedMap);
    localStorage.setItem('insta_following_map', JSON.stringify(updatedMap));

    setSuggestedUsers(prev => prev.filter(u => u.username !== targetUsername && u.id !== targetUsername));

    toast(newFollowingStatus ? `Following @${targetUsername}` : `Unfollowed @${targetUsername}`);

    try {
      if (profile?.id) {
        if (newFollowingStatus) {
          await supabase.from('followers').insert([{
            follower_id: profile.id,
            target_username: targetUsername
          }]);
        } else {
          await supabase.from('followers').delete().eq('follower_id', profile.id).eq('target_username', targetUsername);
        }
      }
    } catch (e) {}
  };

  const openStoryViewer = (index: number) => {
    setActiveStoryIndex(index);
    setIsStoryViewerOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const rawUrl = evt.target?.result as string;
        const compressed = await compressImage(rawUrl);
        setPreviewImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSharePost = async () => {
    if (!previewImage) {
      toast.error("Please select an image first");
      return;
    }

    const compressedImg = await compressImage(previewImage);
    const userId = profile?.id || user?.id || 'usr_' + Date.now();
    const username = profile?.username || 'sahil_user';
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    if (createMode === 'story') {
      const newStoryItem: StoryItemData = {
        id: 's_' + Date.now(),
        username,
        avatar_url: avatarUrl,
        media_url: compressedImg,
        timeAgo: 'Just now'
      };
      setStories([newStoryItem, ...stories]);

      try {
        await supabase.from('stories').insert([{
          user_id: userId,
          media_url: compressedImg
        }]);
      } catch (e) {}

      toast.success("Story added for 24 hours!");
    } else {
      const newPost: Post = {
        id: 'post_' + Date.now(),
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        image_url: compressedImg,
        caption: caption || 'New post!',
        filter_effect: selectedFilter,
        location: location || '',
        likes_count: 0,
        comments_count: 0,
        isLiked: false,
        comments: [],
        created_at: 'JUST NOW'
      };

      try {
        const existingUserPosts: Post[] = JSON.parse(localStorage.getItem('insta_user_posts') || '[]');
        const updatedUserPosts = [newPost, ...existingUserPosts.slice(0, 10)];
        localStorage.setItem('insta_user_posts', JSON.stringify(updatedUserPosts));
      } catch (e) {}

      try {
        await supabase.from('posts').insert([{
          id: newPost.id,
          user_id: userId,
          image_url: compressedImg,
          caption: caption || 'New post!',
          location: location || ''
        }]);
      } catch (e: any) {}

      setPosts(prev => [newPost, ...prev]);
      toast.success("Post published!");
    }

    setPreviewImage(null);
    setCaption('');
    setLocation('');
    onCloseCreate();
  };

  const getPostUsername = (postItem: Post) => {
    if (postItem.username && postItem.username !== 'undefined' && postItem.username !== 'null') {
      return postItem.username;
    }
    if (postItem.user_id && userNamesMap[postItem.user_id]) {
      return userNamesMap[postItem.user_id];
    }
    if (postItem.user_id === profile?.id && profile?.username) {
      return profile.username;
    }
    return 'instagram_creator';
  };

  const getValidAvatarUrl = (postItem: Post) => {
    if (postItem.username === profile?.username || postItem.user_id === profile?.id) {
      if (profile?.avatar_url) return profile.avatar_url;
    }
    if (postItem.username && userAvatarsMap[postItem.username]) {
      return userAvatarsMap[postItem.username];
    }
    if (postItem.user_id && userAvatarsMap[postItem.user_id]) {
      return userAvatarsMap[postItem.user_id];
    }
    return postItem.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getPostUsername(postItem)}`;
  };

  return (
    <div className="flex gap-8 max-w-5xl mx-auto w-full pt-4">
      {/* LEFT FEED COLUMN */}
      <div className="flex-1 max-w-xl flex flex-col gap-6">
        {/* STORIES TRAY */}
        <div className="flex items-center gap-4 p-4 bg-dark-secondary border border-dark-border rounded-xl overflow-x-auto no-scrollbar">
          {/* YOUR STORY ADD BUTTON */}
          <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group relative" onClick={() => stories.length > 0 && openStoryViewer(0)}>
            <div className="w-16 h-16 rounded-full p-[2.5px] instagram-story-ring flex items-center justify-center transition transform group-hover:scale-105 relative">
              <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'me'}`} className="w-full h-full rounded-full object-cover border-2 border-black" alt="Your Story" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCreateMode('story');
                  toast("Upload an image to create your 24h story");
                }}
                className="absolute bottom-0 right-0 bg-instagram-blue text-white rounded-full p-1 border-2 border-black"
                title="Add Story"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-neutral-300 truncate max-w-[70px]">Your story</span>
          </div>

          {/* OTHER REAL STORIES */}
          {stories.map((story, idx) => (
            <div key={story.id} onClick={() => openStoryViewer(idx)} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-[2.5px] instagram-story-ring flex items-center justify-center transition transform group-hover:scale-105">
                <img src={story.avatar_url} className="w-full h-full rounded-full object-cover border-2 border-black" alt={story.username} />
              </div>
              <span className="text-xs text-neutral-300 truncate max-w-[70px]">{story.username}</span>
            </div>
          ))}
        </div>

        {/* FEED POSTS OR EMPTY STATE */}
        {posts.length === 0 ? (
          <div className="bg-dark-secondary border border-dark-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-dark-card border border-dark-border text-neutral-400">
              <Camera className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">No Posts Yet</h3>
              <p className="text-xs text-neutral-400 max-w-xs">Be the first creator to share a photo! Click the button below to upload your first post.</p>
            </div>
            <label className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-2 mt-2">
              <Upload className="w-4 h-4" /> Create Your First Post
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          posts.map((post) => {
            const authorUname = getPostUsername(post);
            const isMyPost = authorUname === profile?.username || post.user_id === profile?.id;
            const isFollowingAuthor = !!followingMap[authorUname] || !!followingMap[post.user_id];
            const isSaved = savedPostIds[post.id] || post.isSaved;

            return (
              <article key={post.id} className="bg-dark-primary border border-dark-border rounded-xl overflow-hidden">
                {/* POST HEADER */}
                <div className="flex items-center justify-between p-3.5 min-h-[56px] border-b border-dark-border/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={getValidAvatarUrl(post)}
                      className="w-9 h-9 rounded-full object-cover cursor-pointer border border-white/20"
                      alt={authorUname}
                      onClick={() => onOpenUserProfile && onOpenUserProfile(authorUname)}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onOpenUserProfile && onOpenUserProfile(authorUname)}
                          className="text-sm font-semibold text-white cursor-pointer hover:underline"
                        >
                          {authorUname}
                        </span>
                        {/* INSTAGRAM RULE: ONLY SHOW BLUE FOLLOW BUTTON IF YOU ARE NOT FOLLOWING AND IT'S NOT YOUR POST */}
                        {!isMyPost && !isFollowingAuthor && (
                          <button
                            onClick={() => toggleFollow(authorUname)}
                            className="text-xs font-semibold text-instagram-blue hover:underline"
                          >
                            • Follow
                          </button>
                        )}
                      </div>
                      {post.location && <span className="text-xs text-neutral-400">{post.location}</span>}
                    </div>
                  </div>
                  <button className="text-neutral-400 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                {/* POST IMAGE WITH DOUBLE TAP HEART */}
                <div
                  className="relative bg-black cursor-pointer overflow-hidden"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                >
                  <img src={post.image_url} className={`w-full max-h-[600px] object-cover ${post.filter_effect || ''}`} alt="Post" />
                  {doubleTapId === post.id && (
                    <Heart className="w-24 h-24 text-white fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                  )}
                </div>

                {/* POST ACTIONS */}
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleLike(post.id)} className="transition hover:scale-110">
                      <Heart className={`w-6 h-6 ${post.isLiked ? 'text-instagram-like fill-instagram-like' : 'text-white'}`} />
                    </button>
                    <button className="text-white hover:text-neutral-300"><MessageCircle className="w-6 h-6" /></button>
                    <button onClick={() => setIsShareOpen(true)} className="text-white hover:text-neutral-300"><Send className="w-6 h-6" /></button>
                  </div>
                  <button onClick={() => toggleSave(post.id)} className="text-white transition hover:scale-110">
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                </div>

                {/* POST BODY */}
                <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-white">{post.likes_count} likes</span>
                  <p className="text-sm text-neutral-200">
                    <span
                      onClick={() => onOpenUserProfile && onOpenUserProfile(authorUname)}
                      className="font-semibold text-white mr-2 cursor-pointer hover:underline"
                    >
                      {authorUname}
                    </span>
                    {post.caption}
                  </p>

                  {/* COMMENTS WITH LIKES */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 border-t border-dark-border/40 pt-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-xs text-neutral-300">
                          <div>
                            <span
                              onClick={() => onOpenUserProfile && c.username && onOpenUserProfile(c.username)}
                              className="font-semibold mr-1.5 text-white cursor-pointer hover:underline"
                            >
                              {c.username}
                            </span>
                            <span>{c.text}</span>
                          </div>
                          <button onClick={() => toggleCommentLike(post.id, c.id)} className="text-neutral-400 hover:text-instagram-like flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{c.likes_count || 0}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-neutral-500 uppercase tracking-wide mt-1">{post.created_at}</span>
                </div>

                {/* ADD COMMENT */}
                <div className="flex items-center border-t border-dark-border px-3.5 py-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder-neutral-500"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    disabled={!commentText[post.id]?.trim()}
                    className="text-instagram-blue text-sm font-semibold disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* RIGHT SUGGESTIONS PANEL */}
      {suggestedUsers.length > 0 && (
        <aside className="hidden lg:flex flex-col w-80 gap-5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenUserProfile && onOpenUserProfile(profile?.username || '')}>
              <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'me'}`} className="w-12 h-12 rounded-full object-cover border border-white/20" alt="Me" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{profile?.username}</span>
                <span className="text-xs text-neutral-400">{profile?.full_name}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-neutral-400">Suggested for you</span>
            <button className="text-white hover:text-neutral-300">See All</button>
          </div>

          <div className="flex flex-col gap-3">
            {suggestedUsers.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onOpenUserProfile && onOpenUserProfile(s.username)}
                >
                  <img src={s.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} className="w-9 h-9 rounded-full object-cover group-hover:opacity-80 transition border border-white/10" alt={s.username} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:underline">@{s.username}</span>
                    <span className="text-[10px] text-neutral-400">{s.full_name}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(s.username)}
                  className="text-xs font-semibold text-instagram-blue hover:text-white"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* STORY VIEWER MODAL */}
      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        stories={stories}
        initialIndex={activeStoryIndex}
        onClose={() => setIsStoryViewerOpen(false)}
      />

      {/* SHARE POST MODAL */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      {/* CREATE OPTIONS MODAL (POST OR STORY) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-dark-border w-full max-w-3xl h-[520px] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="h-12 border-b border-dark-border flex items-center justify-between px-4 font-semibold text-sm">
              <button onClick={onCloseCreate} className="text-neutral-400 hover:text-white">Cancel</button>
              <div className="flex gap-4">
                <button
                  onClick={() => setCreateMode('post')}
                  className={`text-xs font-bold ${createMode === 'post' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
                >
                  Create Post
                </button>
                <button
                  onClick={() => setCreateMode('story')}
                  className={`text-xs font-bold ${createMode === 'story' ? 'text-white border-b-2 border-white' : 'text-neutral-400'}`}
                >
                  Add Story (24h)
                </button>
              </div>
              <button onClick={handleSharePost} className="text-instagram-blue font-bold">Share</button>
            </div>

            <div className="flex-1 flex">
              {/* IMAGE PREVIEW AREA */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} className={`max-w-full max-h-full object-contain ${selectedFilter}`} alt="Upload preview" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <Camera className="w-12 h-12" />
                    <span className="text-sm font-medium">Select photo for {createMode}</span>
                    <label className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Select from computer
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* FILTERS & CAPTION CONTROL */}
              <div className="w-72 border-l border-dark-border p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="flex items-center gap-2 font-semibold text-xs text-neutral-300">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Choose Filter
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['none', 'filter-clarendon', 'filter-juno', 'filter-lark', 'filter-sepia', 'filter-vintage'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border ${selectedFilter === f ? 'border-transparent' : 'border-transparent'}`}
                    >
                      <div className={`w-full h-12 rounded bg-neutral-800 ${f}`} />
                      <span className="text-[10px] text-neutral-400 capitalize">{f.replace('filter-', '')}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder={createMode === 'story' ? "Add story text..." : "Write a caption..."}
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />

                {createMode === 'post' && (
                  <input
                    type="text"
                    placeholder="Add location (e.g. Mumbai, India)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-dark-primary border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-instagram-blue"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
