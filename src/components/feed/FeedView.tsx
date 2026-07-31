import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera, Upload, Sparkles } from 'lucide-react';
import { Post, Story } from '../../types/database.types';
import toast from 'react-hot-toast';

const initialPosts: Post[] = [
  {
    id: 'p1',
    user_id: 'u1',
    username: 'sahil_monpara',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Sunset bliss on the beach 🌅🌊 #nature #google_sahil_insta #antigravity',
    filter_effect: 'filter-clarendon',
    location: 'Goa, India',
    likes_count: 142,
    comments_count: 2,
    isLiked: false,
    isSaved: false,
    comments: [
      { id: 'c1', post_id: 'p1', username: 'alex_tech', text: 'Stunning capture! 🔥', created_at: '1h' },
      { id: 'c2', post_id: 'p1', username: 'design_guru', text: 'Love the lighting.', created_at: '30m' }
    ],
    created_at: '2 HOURS AGO'
  },
  {
    id: 'p2',
    user_id: 'u2',
    username: 'react_developer',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    caption: 'Late night coding sessions building scalable web apps 💻🚀',
    filter_effect: 'filter-lark',
    location: 'Bengaluru, India',
    likes_count: 89,
    comments_count: 1,
    isLiked: true,
    isSaved: true,
    comments: [
      { id: 'c3', post_id: 'p2', username: 'sahil_monpara', text: 'Keep crushing it!', created_at: '2h' }
    ],
    created_at: '5 HOURS AGO'
  }
];

const initialStories: Story[] = [
  { id: 's1', user_id: 'u1', username: 'Your Story', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', media_url: '', media_type: 'image', created_at: '', expires_at: '' },
  { id: 's2', user_id: 'u2', username: 'alex_tech', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', media_url: '', media_type: 'image', created_at: '', expires_at: '' },
  { id: 's3', user_id: 'u3', username: 'sarah_m', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', media_url: '', media_type: 'image', created_at: '', expires_at: '' },
  { id: 's4', user_id: 'u4', username: 'code_ninja', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', media_url: '', media_type: 'image', created_at: '', expires_at: '' }
];

interface FeedViewProps {
  isCreateOpen: boolean;
  onCloseCreate: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ isCreateOpen, onCloseCreate }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [doubleTapId, setDoubleTapId] = useState<string | null>(null);

  // Photo studio creation state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes_count: p.likes_count + (isLiked ? 1 : -1)
        };
      }
      return p;
    }));
  };

  const handleDoubleTap = (postId: string) => {
    toggleLike(postId);
    setDoubleTapId(postId);
    setTimeout(() => setDoubleTapId(null), 800);
  };

  const toggleSave = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isSaved = !p.isSaved;
        toast(isSaved ? "Saved to collection" : "Removed from saved");
        return { ...p, isSaved };
      }
      return p;
    }));
  };

  const addComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComments = [...(p.comments || []), {
          id: 'c_' + Date.now(),
          post_id: postId,
          username: 'sahil_monpara',
          text,
          created_at: 'Just now'
        }];
        return { ...p, comments: newComments, comments_count: newComments.length };
      }
      return p;
    }));
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPreviewImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSharePost = () => {
    if (!previewImage) {
      toast.error("Please select an image first");
      return;
    }
    const newPost: Post = {
      id: 'post_' + Date.now(),
      user_id: 'u_me',
      username: 'sahil_monpara',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      image_url: previewImage,
      caption: caption || 'New post!',
      filter_effect: selectedFilter,
      location: location || 'India',
      likes_count: 0,
      comments_count: 0,
      isLiked: false,
      comments: [],
      created_at: 'JUST NOW'
    };

    setPosts([newPost, ...posts]);
    toast.success("Post published!");
    setPreviewImage(null);
    setCaption('');
    setLocation('');
    onCloseCreate();
  };

  return (
    <div className="flex gap-8 max-w-5xl mx-auto w-full pt-4">
      {/* LEFT FEED COLUMN */}
      <div className="flex-1 max-w-xl flex flex-col gap-6">
        {/* STORIES TRAY */}
        <div className="flex items-center gap-4 p-4 bg-dark-secondary border border-dark-border rounded-xl overflow-x-auto no-scrollbar">
          {initialStories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-[2.5px] instagram-story-ring flex items-center justify-center transition transform group-hover:scale-105">
                <img src={story.avatar_url} className="w-full h-full rounded-full object-cover border-2 border-black" alt={story.username} />
              </div>
              <span className="text-xs text-neutral-300 truncate max-w-[70px]">{story.username}</span>
            </div>
          ))}
        </div>

        {/* FEED POSTS */}
        {posts.map((post) => (
          <article key={post.id} className="bg-dark-primary border border-dark-border rounded-xl overflow-hidden">
            {/* POST HEADER */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <img src={post.avatar_url} className="w-9 h-9 rounded-full object-cover" alt={post.username} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{post.username}</span>
                  <span className="text-xs text-neutral-400">{post.location}</span>
                </div>
              </div>
              <button className="text-neutral-400 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            {/* POST IMAGE */}
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
                <button className="text-white hover:text-neutral-300"><Send className="w-6 h-6" /></button>
              </div>
              <button onClick={() => toggleSave(post.id)} className="text-white">
                <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* POST BODY */}
            <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-white">{post.likes_count} likes</span>
              <p className="text-sm text-neutral-200">
                <span className="font-semibold text-white mr-2">{post.username}</span>
                {post.caption}
              </p>

              {post.comments && post.comments.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {post.comments.map((c) => (
                    <div key={c.id} className="text-xs text-neutral-300">
                      <span className="font-semibold mr-1 text-white">{c.username}</span>
                      {c.text}
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
        ))}
      </div>

      {/* RIGHT SUGGESTIONS PANEL */}
      <aside className="hidden lg:flex flex-col w-80 gap-5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full object-cover" alt="Me" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">sahil_monpara</span>
              <span className="text-xs text-neutral-400">Sahil Monpara</span>
            </div>
          </div>
          <button className="text-xs font-semibold text-instagram-blue">Switch</button>
        </div>

        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-neutral-400">Suggested for you</span>
          <button className="text-white hover:text-neutral-300">See All</button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { user: 'creative_coder', subtitle: 'Followed by alex_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
            { user: 'web3_pioneer', subtitle: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
            { user: 'design_weekly', subtitle: 'New to Instagram', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
          ].map((s, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={s.avatar} className="w-9 h-9 rounded-full object-cover" alt={s.user} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">{s.user}</span>
                  <span className="text-[10px] text-neutral-400">{s.subtitle}</span>
                </div>
              </div>
              <button className="text-xs font-semibold text-instagram-blue hover:text-white">Follow</button>
            </div>
          ))}
        </div>
      </aside>

      {/* CREATE POST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-dark-border w-full max-w-3xl h-[520px] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="h-12 border-b border-dark-border flex items-center justify-between px-4 font-semibold text-sm">
              <button onClick={onCloseCreate} className="text-neutral-400 hover:text-white">Cancel</button>
              <span>Create new post</span>
              <button onClick={handleSharePost} className="text-instagram-blue font-bold">Share</button>
            </div>

            <div className="flex-1 flex">
              {/* IMAGE PREVIEW / FILE PICKER AREA */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} className={`max-w-full max-h-full object-contain ${selectedFilter}`} alt="Upload preview" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <Camera className="w-12 h-12" />
                    <span className="text-sm font-medium">Select photo to upload</span>
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
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border ${selectedFilter === f ? 'border-instagram-blue' : 'border-transparent'}`}
                    >
                      <div className={`w-full h-12 rounded bg-neutral-800 ${f}`} />
                      <span className="text-[10px] text-neutral-400 capitalize">{f.replace('filter-', '')}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Write a caption..."
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />

                <input
                  type="text"
                  placeholder="Add location (e.g. Mumbai, India)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
