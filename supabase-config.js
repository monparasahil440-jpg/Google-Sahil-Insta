// Supabase Configuration & Client Helper for Instagram Web Platform
// Project Folder: D:\Antigravity Social Media

const SUPABASE_URL = "https://rcjksdklfisxtignxevj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mw6Mqy3a8aY0tJKoCQpRDA_Xipjk4hk";

let supabaseClient = null;

// Initialize Supabase Client
if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase initialized successfully with project URL:", SUPABASE_URL);
  } catch (err) {
    console.warn("Supabase init warning:", err.message);
  }
} else {
  console.warn("Supabase SDK CDN not loaded yet. Demo mode active.");
}

// Database Service Layer with LocalStorage Fallback
const db = {
  // Fetch Posts
  async getPosts() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("Using local posts fallback", e);
      }
    }
    return JSON.parse(localStorage.getItem('insta_posts') || '[]');
  },

  // Create Post
  async createPost(postData) {
    let newPost = {
      id: "post_" + Date.now(),
      username: postData.username || "sahil_monpara",
      avatar_url: postData.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      image_url: postData.image_url,
      caption: postData.caption || "",
      filter_effect: postData.filter_effect || "none",
      location: postData.location || "Mumbai, India",
      likes_count: 0,
      comments: [],
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('posts')
          .insert([newPost])
          .select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {
        console.warn("Supabase post creation fallback", e);
      }
    }

    const current = JSON.parse(localStorage.getItem('insta_posts') || '[]');
    current.unshift(newPost);
    localStorage.setItem('insta_posts', JSON.stringify(current));
    return newPost;
  },

  // Upload Image File to Supabase Storage or base64 data URL fallback
  async uploadImage(file) {
    if (supabaseClient && file instanceof File) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `post_images/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from('posts')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabaseClient.storage.from('posts').getPublicUrl(filePath);
          if (data && data.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn("Storage upload failed, falling back to base64", err);
      }
    }

    if (typeof file === 'string') return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  // Fetch Stories
  async getStories() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("Stories fallback", e);
      }
    }
    return JSON.parse(localStorage.getItem('insta_stories') || '[]');
  },

  // Save Story
  async createStory(storyData) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('stories').insert([storyData]).select();
        if (!error && data && data[0]) return data[0];
      } catch (e) {}
    }
    const current = JSON.parse(localStorage.getItem('insta_stories') || '[]');
    current.unshift(storyData);
    localStorage.setItem('insta_stories', JSON.stringify(current));
    return storyData;
  },

  // Fetch Messages
  async getMessages() {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('messages').select('*').order('created_at', { ascending: true });
        if (data && data.length > 0) return data;
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('insta_messages') || '[]');
  },

  // Send Message
  async sendMessage(msgData) {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('messages').insert([msgData]).select();
        if (data && data[0]) return data[0];
      } catch (e) {}
    }
    const current = JSON.parse(localStorage.getItem('insta_messages') || '[]');
    current.push(msgData);
    localStorage.setItem('insta_messages', JSON.stringify(current));
    return msgData;
  }
};
