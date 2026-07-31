import React, { useState, useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Check, X, Bell, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export interface NotificationItem {
  id: string;
  type: 'follow_request' | 'follow' | 'like' | 'comment';
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  post_thumbnail?: string;
  comment_text?: string;
  time_ago: string;
  is_read: boolean;
  status?: 'pending' | 'accepted' | 'declined';
  created_at_ms?: number;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserProfile?: (username: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenUserProfile,
  onUnreadCountChange
}) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'requests' | 'likes' | 'comments'>('all');
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // READ NOTIFICATION IDS STORAGE (Ensures read status persists across reloads)
  const [readIds, setReadIds] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_read_notification_ids');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [acceptedIds, setAcceptedIds] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('insta_accepted_follow_ids');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // ALWAYS FETCH REAL NOTIFICATIONS ON MOUNT & USER CHANGE (EVEN IF MODAL IS CLOSED)
  useEffect(() => {
    if (profile?.username) {
      fetchRealNotifications();
    }
  }, [profile?.username, isOpen]);

  const fetchRealNotifications = async () => {
    if (!profile?.username) return;
    setLoading(true);
    const list: NotificationItem[] = [];

    try {
      // 1. FETCH REAL FOLLOW REQUESTS FOR ME
      const { data: followReqs } = await supabase
        .from('followers')
        .select('*')
        .eq('target_username', profile.username)
        .order('created_at', { ascending: false });

      if (followReqs && followReqs.length > 0) {
        for (const req of followReqs) {
          const reqId = req.id || 'fr_' + req.follower_id;
          const isAccepted = !!acceptedIds[reqId];
          const isRead = isAccepted || !!readIds[reqId];

          const { data: senderProf } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.follower_id)
            .single();

          const senderName = senderProf?.username || 'user';
          list.push({
            id: reqId,
            type: 'follow_request',
            user: {
              username: senderName,
              full_name: senderProf?.full_name || senderName,
              avatar_url: senderProf?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`
            },
            time_ago: req.created_at ? formatTimeAgo(req.created_at) : 'Recently',
            created_at_ms: req.created_at ? new Date(req.created_at).getTime() : Date.now(),
            is_read: isRead,
            status: isAccepted ? 'accepted' : 'pending'
          });
        }
      }

      // 2. FETCH LIKES ON MY POSTS
      const { data: myPosts } = await supabase
        .from('posts')
        .select('id, image_url')
        .eq('user_id', profile.id);

      if (myPosts && myPosts.length > 0) {
        const postIds = myPosts.map(p => p.id);
        const postThumbMap = new Map(myPosts.map(p => [p.id, p.image_url]));

        const { data: dbLikes } = await supabase
          .from('likes')
          .select('*')
          .in('post_id', postIds)
          .neq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (dbLikes && dbLikes.length > 0) {
          for (const l of dbLikes) {
            const likeId = l.id || 'lk_' + l.user_id + '_' + l.post_id;
            const { data: likerProf } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', l.user_id)
              .single();

            const likerName = likerProf?.username || 'user';
            list.push({
              id: likeId,
              type: 'like',
              user: {
                username: likerName,
                full_name: likerProf?.full_name || likerName,
                avatar_url: likerProf?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${likerName}`
              },
              post_thumbnail: postThumbMap.get(l.post_id),
              time_ago: l.created_at ? formatTimeAgo(l.created_at) : 'Recently',
              created_at_ms: l.created_at ? new Date(l.created_at).getTime() : Date.now(),
              is_read: !!readIds[likeId]
            });
          }
        }

        // 3. FETCH COMMENTS ON MY POSTS
        const { data: dbComments } = await supabase
          .from('comments')
          .select('*')
          .in('post_id', postIds)
          .neq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (dbComments && dbComments.length > 0) {
          for (const c of dbComments) {
            const commentId = c.id || 'cm_' + c.user_id + '_' + c.post_id;
            const { data: commenterProf } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', c.user_id)
              .single();

            const commenterName = commenterProf?.username || 'user';
            list.push({
              id: commentId,
              type: 'comment',
              user: {
                username: commenterName,
                full_name: commenterProf?.full_name || commenterName,
                avatar_url: commenterProf?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${commenterName}`
              },
              comment_text: c.text,
              post_thumbnail: postThumbMap.get(c.post_id),
              time_ago: c.created_at ? formatTimeAgo(c.created_at) : 'Recently',
              created_at_ms: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
              is_read: !!readIds[commentId]
            });
          }
        }
      }

      list.sort((a, b) => (b.created_at_ms || 0) - (a.created_at_ms || 0));
      const uniqueList = Array.from(new Map(list.map(item => [item.id, item])).values());

      setNotifications(uniqueList);

      // ACCURATE UNREAD COUNT: ONLY COUNT UNREAD ITEMS AND PENDING REQUESTS
      const unreadCount = uniqueList.filter(n => !n.is_read && n.status !== 'accepted').length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
    } catch (e) {
      setNotifications([]);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
      return `${Math.floor(diffSec / 86400)}d`;
    } catch (e) {
      return 'Recently';
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // SAVE READ STATUS TO LOCAL STORAGE SO IT NEVER RE-TRIGGERS BADGE
    const newReadMap = { ...readIds, [item.id]: true };
    setReadIds(newReadMap);
    localStorage.setItem('insta_read_notification_ids', JSON.stringify(newReadMap));

    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
    const remainingUnread = notifications.filter(n => n.id !== item.id && !n.is_read && !newReadMap[n.id] && n.status !== 'accepted').length;
    if (onUnreadCountChange) onUnreadCountChange(remainingUnread);

    onClose();
    if (onOpenUserProfile) {
      onOpenUserProfile(item.user.username);
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent, id: string, username: string) => {
    e.stopPropagation();
    const newAcceptedMap = { ...acceptedIds, [id]: true };
    setAcceptedIds(newAcceptedMap);
    localStorage.setItem('insta_accepted_follow_ids', JSON.stringify(newAcceptedMap));

    const newReadMap = { ...readIds, [id]: true };
    setReadIds(newReadMap);
    localStorage.setItem('insta_read_notification_ids', JSON.stringify(newReadMap));

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'accepted', is_read: true } : n));
    toast.success(`Accepted follow request from @${username}`);

    const remainingUnread = notifications.filter(n => n.id !== id && !n.is_read && !newReadMap[n.id] && n.status !== 'accepted').length;
    if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
  };

  const handleDeclineRequest = async (e: React.MouseEvent, id: string, username: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast(`Declined request from @${username}`);

    try {
      await supabase.from('followers').delete().eq('id', id);
    } catch (e) {}

    const remainingUnread = notifications.filter(n => n.id !== id && !n.is_read && n.status !== 'accepted').length;
    if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
  };

  const toggleFollowBack = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    setFollowingMap(prev => {
      const isFollowing = !prev[username];
      toast(isFollowing ? `Following @${username}` : `Unfollowed @${username}`);
      return { ...prev, [username]: isFollowing };
    });
  };

  const markAllAsRead = () => {
    const allIdsMap: { [key: string]: boolean } = { ...readIds };
    notifications.forEach(n => {
      allIdsMap[n.id] = true;
    });
    setReadIds(allIdsMap);
    localStorage.setItem('insta_read_notification_ids', JSON.stringify(allIdsMap));

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  const handleCloseModal = () => {
    markAllAsRead();
    onClose();
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'requests') return n.type === 'follow_request' && n.status === 'pending';
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'comments') return n.type === 'comment';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-start md:pl-64 p-4 items-start pt-16">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-md h-[580px] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="h-14 border-b border-dark-border flex items-center justify-between px-5">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <Bell className="w-5 h-5 text-instagram-pink" />
            <span>Notifications</span>
          </div>
          <button onClick={handleCloseModal} className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 p-3 border-b border-dark-border bg-dark-primary/50 overflow-x-auto no-scrollbar">
          {(['all', 'requests', 'likes', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${activeFilter === tab ? 'bg-white text-black' : 'bg-dark-card text-neutral-300 hover:bg-white/10'}`}
            >
              {tab === 'requests' ? 'Follow Requests' : tab}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST (NEWEST FIRST) */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {loading ? (
            <div className="h-full flex items-center justify-center text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading live notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 gap-3">
              <div className="p-4 rounded-full bg-dark-card border border-dark-border">
                <Heart className="w-8 h-8 text-neutral-500" />
              </div>
              <span className="text-sm font-semibold text-white">No Notifications Yet</span>
              <span className="text-xs max-w-xs">When users follow you, like your posts, or comment, real-time notifications will appear here.</span>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${!n.is_read ? 'bg-white/5 font-semibold' : 'hover:bg-white/5 opacity-80'}`}
              >
                {/* USER AVATAR & INFO */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <div className="relative shrink-0">
                    <img
                      src={n.user.avatar_url}
                      className="w-11 h-11 rounded-full object-cover border border-white/20"
                      alt={n.user.username}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-dark-primary rounded-full p-0.5">
                      {n.type === 'like' && <Heart className="w-3.5 h-3.5 text-instagram-like fill-instagram-like" />}
                      {n.type === 'comment' && <MessageCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />}
                      {n.type === 'follow_request' && <UserPlus className="w-3.5 h-3.5 text-instagram-blue" />}
                      {n.type === 'follow' && <UserPlus className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </div>

                  <div className="flex flex-col text-xs leading-tight min-w-0">
                    <p className="text-neutral-200 truncate">
                      <span className="font-bold text-white hover:underline mr-1">
                        @{n.user.username}
                      </span>
                      {n.type === 'follow_request' && (n.status === 'accepted' ? 'started following you.' : 'sent you a follow request.')}
                      {n.type === 'follow' && 'started following you.'}
                      {n.type === 'like' && 'liked your post.'}
                      {n.type === 'comment' && `commented: "${n.comment_text}"`}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-1">{n.time_ago}</span>
                  </div>
                </div>

                {/* RIGHT ACTION BUTTON OR POST THUMBNAIL */}
                <div className="shrink-0">
                  {n.type === 'follow_request' && (
                    n.status === 'accepted' ? (
                      <span className="text-xs font-semibold text-emerald-400">Accepted</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleAcceptRequest(e, n.id, n.user.username)}
                          className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          onClick={(e) => handleDeclineRequest(e, n.id, n.user.username)}
                          className="bg-dark-card hover:bg-white/10 text-neutral-300 font-semibold text-xs p-1.5 rounded-lg border border-dark-border transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  )}

                  {n.type === 'follow' && (
                    <button
                      onClick={(e) => toggleFollowBack(e, n.user.username)}
                      className={`font-semibold text-xs px-3 py-1.5 rounded-lg transition ${followingMap[n.user.username] ? 'bg-dark-card text-neutral-300 border border-dark-border' : 'bg-instagram-blue hover:bg-blue-600 text-white'}`}
                    >
                      {followingMap[n.user.username] ? 'Following' : 'Follow Back'}
                    </button>
                  )}

                  {(n.type === 'like' || n.type === 'comment') && n.post_thumbnail && (
                    <img src={n.post_thumbnail} className="w-10 h-10 rounded-lg object-cover border border-dark-border" alt="Post" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
