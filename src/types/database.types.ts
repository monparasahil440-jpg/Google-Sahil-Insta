// Database & Entity TypeScript Definitions

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  cover_url?: string;
  bio?: string;
  website?: string;
  gender?: string;
  date_of_birth?: string;
  is_private?: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
  followers?: number;
  following?: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  image_url: string;
  caption: string;
  filter_effect?: string;
  location?: string;
  is_video?: boolean;
  likes_count: number;
  comments_count?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  username: string;
  avatar_url?: string;
  text: string;
  likes_count?: number;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  text?: string;
  media_url?: string;
  media_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  created_at: string;
}

export interface CallSignal {
  id?: string;
  caller_id: string;
  receiver_id: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end';
  sdp_data: any;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string;
  actor_name: string;
  actor_avatar: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'call';
  post_id?: string;
  is_read: boolean;
  created_at: string;
}
