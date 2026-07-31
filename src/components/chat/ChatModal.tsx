import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon, Phone, Video, MessageCircle, SquarePen, Search, Loader2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  text?: string;
  image_url?: string;
  isMe?: boolean;
  time: string;
  created_at_ms?: number;
  reaction?: string;
}

interface ChatUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  lastMessage?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { profile: myProfile } = useAuth();
  const { startCall } = useCall();

  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // FULL SCREEN LIGHTBOX IMAGE VIEW STATE
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // NEW CONVERSATION SEARCH MODAL STATE
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searching, setSearching] = useState(false);

  // FETCH RECENT CHAT USERS ON MOUNT
  useEffect(() => {
    if (isOpen && myProfile?.username) {
      fetchRegisteredProfiles();
    }
  }, [isOpen, myProfile?.username]);

  // SUPABASE REALTIME BROADCAST CHANNEL FOR BOTH SIDES MESSAGING
  useEffect(() => {
    if (!isOpen || !myProfile) return;

    const channel = supabase.channel('global_direct_chat_channel', {
      config: { broadcast: { self: true } }
    });

    channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      if (!payload) return;

      const myUname = myProfile.username;
      const myId = myProfile.id;

      const isForMe = payload.receiver_id === myUname || payload.receiver_id === myId;
      const isFromMe = payload.sender_id === myUname || payload.sender_id === myId;

      if (isForMe || isFromMe) {
        try {
          const savedRaw = localStorage.getItem('insta_direct_messages');
          const allMsgs: MessageItem[] = savedRaw ? JSON.parse(savedRaw) : [];
          if (!allMsgs.some(m => m.id === payload.id)) {
            localStorage.setItem('insta_direct_messages', JSON.stringify([...allMsgs, payload]));
          }
        } catch (e) {}

        if (activeChatUser) {
          const friendUname = activeChatUser.username;
          const friendId = activeChatUser.id;
          const isBetweenActiveUsers =
            ((payload.sender_id === myId || payload.sender_id === myUname) && (payload.receiver_id === friendId || payload.receiver_id === friendUname)) ||
            ((payload.sender_id === friendId || payload.sender_id === friendUname) && (payload.receiver_id === myId || payload.receiver_id === myUname));

          if (isBetweenActiveUsers) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
          }
        }

        const otherUsername = isFromMe ? payload.receiver_id : payload.sender_id;
        setConversations(prev => prev.map(c => {
          if (c.username === otherUsername || c.id === otherUsername) {
            return { ...c, lastMessage: payload.text || 'Sent an image' };
          }
          return c;
        }));
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, activeChatUser?.username, myProfile?.username, myProfile?.id]);

  // POLL & FETCH MESSAGES FOR ACTIVE CHAT USER
  useEffect(() => {
    if (!activeChatUser || !myProfile) return;

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 1500);

    return () => clearInterval(interval);
  }, [activeChatUser?.username, myProfile?.id, myProfile?.username]);

  const fetchRegisteredProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);

      if (!error && data) {
        const mapped = data
          .filter((u: any) => u.username !== myProfile?.username && u.id !== myProfile?.id)
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            full_name: u.full_name || u.username,
            avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
            lastMessage: 'Tap to start chatting'
          }));
        setConversations(mapped);
      }
    } catch (e) {}
  };

  const fetchMessages = async () => {
    if (!activeChatUser || !myProfile) return;

    const myId = myProfile.id;
    const myUname = myProfile.username;
    const friendId = activeChatUser.id;
    const friendUname = activeChatUser.username;

    let localMsgs: MessageItem[] = [];
    try {
      const savedRaw = localStorage.getItem('insta_direct_messages');
      if (savedRaw) {
        const allMsgs: MessageItem[] = JSON.parse(savedRaw);
        localMsgs = allMsgs.filter(m => 
          ((m.sender_id === myId || m.sender_id === myUname) && (m.receiver_id === friendId || m.receiver_id === friendUname)) ||
          ((m.sender_id === friendId || m.sender_id === friendUname) && (m.receiver_id === myId || m.receiver_id === myUname))
        );
      }
    } catch (e) {}

    let dbMsgs: MessageItem[] = [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*');

      if (!error && data && data.length > 0) {
        dbMsgs = data
          .filter((m: any) => 
            ((m.sender_id === myId || m.sender_id === myUname) && (m.receiver_id === friendId || m.receiver_id === friendUname)) ||
            ((m.sender_id === friendId || m.sender_id === friendUname) && (m.receiver_id === myId || m.receiver_id === myUname))
          )
          .map((m: any) => ({
            id: m.id || 'msg_' + Math.random(),
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            text: m.text,
            image_url: m.image_url,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
            created_at_ms: m.created_at ? new Date(m.created_at).getTime() : Date.now()
          }));
      }
    } catch (e) {}

    const merged = [...localMsgs, ...dbMsgs];
    const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());
    unique.sort((a, b) => (a.created_at_ms || 0) - (b.created_at_ms || 0));

    setMessages(unique);

    if (unique.length > 0) {
      const last = unique[unique.length - 1];
      setConversations(prev => prev.map(c => {
        if (c.username === activeChatUser.username) {
          return { ...c, lastMessage: last.text || 'Sent an image' };
        }
        return c;
      }));
    }
  };

  // SEARCH USERS FOR NEW CHAT
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsersForChat(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, myProfile?.username]);

  const searchUsersForChat = async (query: string) => {
    setSearching(true);
    const clean = query.toLowerCase().replace('@', '');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${clean}%,full_name.ilike.%${clean}%`)
        .limit(10);

      if (!error && data) {
        const filtered = data
          .filter((u: any) => u.username !== myProfile?.username && u.id !== myProfile?.id)
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            full_name: u.full_name || u.username,
            avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
          }));
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const startNewConversationWithUser = (user: ChatUser) => {
    setConversations(prev => {
      if (prev.some(c => c.username === user.username)) return prev;
      return [user, ...prev];
    });

    setActiveChatUser(user);
    setIsNewChatOpen(false);
    setSearchQuery('');
    setMessages([]);
    toast.success(`Started conversation with @${user.username}`);
  };

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imgUrl = evt.target?.result as string;
        setSelectedImage(imgUrl);
        toast.success("Image attached to message");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = handleImageFileChange;

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;
    if (!activeChatUser || !myProfile) return;

    const textToSend = inputText.trim();
    const imageToSend = selectedImage;
    const msgId = 'msg_' + Date.now();

    const senderIdentifier = myProfile.username || myProfile.id;
    const receiverIdentifier = activeChatUser.username || activeChatUser.id;

    const newMsgPayload: MessageItem = {
      id: msgId,
      sender_id: senderIdentifier,
      receiver_id: receiverIdentifier,
      text: textToSend || undefined,
      image_url: imageToSend || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at_ms: Date.now()
    };

    try {
      const savedRaw = localStorage.getItem('insta_direct_messages');
      const allMsgs: MessageItem[] = savedRaw ? JSON.parse(savedRaw) : [];
      const updatedMsgs = [...allMsgs, newMsgPayload];
      localStorage.setItem('insta_direct_messages', JSON.stringify(updatedMsgs));
    } catch (e) {}

    setMessages(prev => [...prev, newMsgPayload]);
    setInputText('');
    setSelectedImage(null);

    try {
      const channel = supabase.channel('global_direct_chat_channel');
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsgPayload
      });
    } catch (e) {}

    try {
      await supabase.from('messages').insert([{
        id: msgId,
        sender_id: senderIdentifier,
        receiver_id: receiverIdentifier,
        text: textToSend || null,
        image_url: imageToSend || null
      }]);
    } catch (e) {}

    toast.success("Message sent!");

    setConversations(prev => prev.map(c => {
      if (c.username === activeChatUser.username) {
        return { ...c, lastMessage: textToSend || 'Sent an image' };
      }
      return c;
    }));
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, reaction: emoji };
      }
      return m;
    }));
  };

  const renderNewChatSearchResults = () => {
    if (searchQuery.trim().length > 0) {
      if (searchResults.length === 0) {
        return <div className="py-8 text-center text-xs text-neutral-400">No account matching "{searchQuery}"</div>;
      }
      return searchResults.map((user) => (
        <div
          key={user.id}
          onClick={() => startNewConversationWithUser(user)}
          className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={user.username} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">@{user.username}</span>
              <span className="text-[10px] text-neutral-400">{user.full_name}</span>
            </div>
          </div>
          <button className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1 rounded-lg">Chat</button>
        </div>
      ));
    }

    return (
      <div className="flex flex-col gap-2 p-2">
        <span className="text-[11px] font-semibold text-neutral-400">Suggested Contacts</span>
        {conversations.map((user) => (
          <div
            key={user.id}
            onClick={() => startNewConversationWithUser(user)}
            className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={user.username} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">@{user.username}</span>
                <span className="text-[10px] text-neutral-400">{user.full_name}</span>
              </div>
            </div>
            <button className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1 rounded-lg">Chat</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-3xl h-[560px] rounded-2xl flex overflow-hidden shadow-2xl relative">
        
        {/* LEFT CONTACTS SIDEBAR */}
        <div className="w-72 border-r border-dark-border flex flex-col bg-dark-primary/60">
          <div className="p-4 border-b border-dark-border font-bold text-sm text-white flex items-center justify-between">
            <span className="truncate">{myProfile?.username || 'Direct Messages'}</span>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition"
              title="Start New Conversation"
            >
              <SquarePen className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {conversations.length === 0 ? (
              <div className="flex-1 text-xs text-neutral-400 text-center flex flex-col items-center justify-center p-4 gap-2">
                <MessageCircle className="w-8 h-8 text-neutral-500" />
                <span>No active chats yet</span>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition mt-1"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              conversations.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setActiveChatUser(user);
                    setMessages([]);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${activeChatUser?.username === user.username ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" alt={user.username} />
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-white truncate">@{user.username}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{user.lastMessage || user.full_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT ACTIVE CHAT VIEWPORT */}
        <div className="flex-1 flex flex-col bg-dark-secondary">
          {activeChatUser ? (
            <>
              {/* CHAT HEADER */}
              <div className="h-14 border-b border-dark-border px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeChatUser.avatar_url} className="w-8 h-8 rounded-full object-cover border border-white/20" alt={activeChatUser.username} />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-white">@{activeChatUser.username}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Active now</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <button onClick={() => startCall(activeChatUser.username, false)} className="p-2 hover:bg-white/10 rounded-full transition" title="Voice Call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button onClick={() => startCall(activeChatUser.username, true)} className="p-2 hover:bg-white/10 rounded-full transition" title="Video Call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* MESSAGES LIST */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <img src={activeChatUser.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-white/20" alt={activeChatUser.username} />
                    <span className="font-bold text-white text-sm">@{activeChatUser.username}</span>
                    <span className="text-xs">{activeChatUser.full_name}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Send a message to start chatting</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMessageFromMe = m.sender_id === myProfile?.username || m.sender_id === myProfile?.id;

                    return (
                      <div key={m.id} className={`flex items-end gap-2 ${isMessageFromMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMessageFromMe && (
                          <img src={activeChatUser.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 mb-1" alt="Avatar" />
                        )}

                        <div className={`max-w-[75%] rounded-2xl p-3 text-xs relative group ${isMessageFromMe ? 'bg-instagram-blue text-white rounded-br-none' : 'bg-dark-card border border-dark-border text-neutral-200 rounded-bl-none'}`}>
                          {m.image_url && (
                            <div className="relative group/img cursor-pointer mb-2 overflow-hidden rounded-lg border border-white/10" onClick={() => setLightboxImageUrl(m.image_url!)}>
                              <img src={m.image_url} className="rounded-lg max-h-48 object-cover transition transform group-hover/img:scale-105" alt="Attachment" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                                <Maximize2 className="w-5 h-5" />
                              </div>
                            </div>
                          )}
                          {m.text && <p className="leading-relaxed">{m.text}</p>}
                          <span className="text-[9px] opacity-60 block text-right mt-1">{m.time}</span>

                          {/* REACTION POPUP ON HOVER */}
                          <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-1 bg-dark-card border border-dark-border p-1 rounded-full shadow-lg">
                            {['❤️', '🔥', '😂', '👍'].map(emoji => (
                              <button key={emoji} onClick={() => handleAddReaction(m.id, emoji)} className="text-xs hover:scale-125 transition">
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {m.reaction && (
                            <span className="absolute -bottom-2 -right-1 text-xs bg-dark-card rounded-full px-1 border border-dark-border">{m.reaction}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* INPUT BAR */}
              <div className="p-3 border-t border-dark-border flex items-center gap-2">
                <label className="p-2 text-neutral-400 hover:text-white cursor-pointer rounded-full hover:bg-white/10 transition">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="Message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-dark-primary border border-dark-border rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-instagram-blue"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() && !selectedImage}
                  className="p-2 text-instagram-blue hover:text-blue-400 disabled:opacity-40 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            /* EMPTY UNSELECTED CHAT STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>

              <div className="p-5 rounded-full border-2 border-white/20">
                <MessageCircle className="w-12 h-12 text-white stroke-1" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Messages</h3>
                <p className="text-xs text-neutral-400 max-w-xs">Send private photos and messages to a friend or account.</p>
              </div>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="bg-instagram-blue hover:bg-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                <SquarePen className="w-4 h-4" /> Send Message
              </button>
            </div>
          )}
        </div>

        {/* START NEW CONVERSATION SEARCH MODAL */}
        {isNewChatOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-secondary border border-dark-border w-full max-w-md h-[450px] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
              
              <div className="h-12 border-b border-dark-border flex items-center justify-between px-4 font-semibold text-sm">
                <button onClick={() => setIsNewChatOpen(false)} className="text-neutral-400 hover:text-white">Cancel</button>
                <span className="text-white">New Message</span>
                <span className="w-8"></span>
              </div>

              {/* SEARCH INPUT */}
              <div className="p-3 border-b border-dark-border flex items-center gap-2 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-6" />
                <input
                  type="text"
                  placeholder="Search user to message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-instagram-blue"
                  autoFocus
                />
                {searching && <Loader2 className="w-4 h-4 text-instagram-blue animate-spin absolute right-6" />}
              </div>

              {/* SEARCH RESULTS LIST */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                {renderNewChatSearchResults()}
              </div>
            </div>
          </div>
        )}

        {/* FULL SCREEN LIGHTBOX IMAGE PREVIEW MODAL */}
        {lightboxImageUrl && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
            onClick={() => setLightboxImageUrl(null)}
          >
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              title="Close Full Screen"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImageUrl}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10 cursor-default transform transition-transform duration-300 scale-100"
              alt="Full Screen Preview"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};
