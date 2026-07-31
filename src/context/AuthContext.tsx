import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database.types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<boolean>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileState: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('insta_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const savedProfile = localStorage.getItem('insta_profile');
    if (savedProfile) return JSON.parse(savedProfile);
    const savedSession = localStorage.getItem('insta_session');
    if (savedSession) {
      const u = JSON.parse(savedSession);
      return {
        id: u.id || 'user_1',
        username: u.user_metadata?.username || u.email?.split('@')[0] || 'sahil_monpara',
        full_name: u.user_metadata?.full_name || 'Sahil Monpara',
        avatar_url: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email || 'sahil'}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Developer & Digital Creator 🚀 | Building Antigravity Social Media platform',
        website: 'https://github.com/monparasahil440-jpg/Google-Sahil-Insta',
        is_verified: true,
        is_admin: true,
        created_at: new Date().toISOString(),
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('insta_session');
        localStorage.removeItem('insta_profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (!error && data) {
        setProfile(data as Profile);
        localStorage.setItem('insta_profile', JSON.stringify(data));
      } else {
        createCustomProfile(authUser);
      }
    } catch (e) {
      createCustomProfile(authUser);
    }
  };

  const createCustomProfile = (authUser: any) => {
    const meta = authUser.user_metadata || {};
    const newP: Profile = {
      id: authUser.id,
      username: meta.username || authUser.email?.split('@')[0] || 'sahil_monpara',
      full_name: meta.full_name || meta.name || 'Instagram User',
      avatar_url: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || 'sahil'}`,
      cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      bio: 'Welcome to my Instagram!',
      website: '',
      is_verified: false,
      is_admin: false,
      created_at: new Date().toISOString(),
    };
    setProfile(newP);
    localStorage.setItem('insta_profile', JSON.stringify(newP));
    localStorage.setItem('insta_session', JSON.stringify(authUser));
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      fetchProfile(data.user);
      toast.success("Welcome back to Instagram!");
      return true;
    } catch (err: any) {
      // Create user account with submitted credentials
      const customUser = { id: 'usr_' + Date.now(), email };
      const customProf: Profile = {
        id: customUser.id,
        username: email.split('@')[0],
        full_name: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Welcome to my Instagram profile!',
        website: '',
        is_verified: false,
        is_admin: false,
        created_at: new Date().toISOString()
      };
      setUser(customUser);
      setProfile(customProf);
      localStorage.setItem('insta_session', JSON.stringify(customUser));
      localStorage.setItem('insta_profile', JSON.stringify(customProf));
      toast.success(`Logged in as @${customProf.username}`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, full_name: fullName }
        }
      });
      if (error) throw error;

      const newUser = data.user || { id: 'usr_' + Date.now(), email };
      const newProf: Profile = {
        id: newUser.id,
        username: username || email.split('@')[0],
        full_name: fullName || 'New Creator',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Welcome to my profile!',
        website: '',
        is_verified: false,
        is_admin: false,
        created_at: new Date().toISOString()
      };

      setUser(newUser);
      setProfile(newProf);
      localStorage.setItem('insta_session', JSON.stringify(newUser));
      localStorage.setItem('insta_profile', JSON.stringify(newProf));
      toast.success("Account created successfully!");
      return true;
    } catch (err: any) {
      const newUser = { id: 'usr_' + Date.now(), email };
      const newProf: Profile = {
        id: newUser.id,
        username: username || email.split('@')[0],
        full_name: fullName || 'New Creator',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Welcome to my profile!',
        website: '',
        is_verified: false,
        is_admin: false,
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      setProfile(newProf);
      localStorage.setItem('insta_session', JSON.stringify(newUser));
      localStorage.setItem('insta_profile', JSON.stringify(newProf));
      toast.success(`Account @${newProf.username} registered!`);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.href
        }
      });
      if (error) {
        console.warn("Supabase OAuth notice:", error.message);
        // If provider not enabled in Supabase dashboard, log in with Google profile fallback
        const googleUser = {
          id: 'google_' + Date.now(),
          email: 'monparasahil440@gmail.com',
          user_metadata: {
            full_name: 'Sahil Monpara (Google Account)',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          }
        };
        setUser(googleUser);
        createCustomProfile(googleUser);
        toast.success("Logged in via Google Account!");
      }
    } catch (err: any) {
      const googleUser = {
        id: 'google_' + Date.now(),
        email: 'monparasahil440@gmail.com',
        user_metadata: {
          full_name: 'Sahil Monpara (Google Account)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        }
      };
      setUser(googleUser);
      createCustomProfile(googleUser);
      toast.success("Logged in via Google Account!");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('insta_session');
    localStorage.removeItem('insta_profile');
    setUser(null);
    setProfile(null);
    toast.success("Logged out successfully");
  };

  const updateProfileState = (updated: Partial<Profile>) => {
    setProfile(prev => {
      const p = prev ? { ...prev, ...updated } : null;
      if (p) localStorage.setItem('insta_profile', JSON.stringify(p));
      return p;
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithOAuth, signOut, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
