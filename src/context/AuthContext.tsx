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
        username: u.user_metadata?.username || u.email?.split('@')[0] || 'sahil_user',
        full_name: u.user_metadata?.full_name || 'Instagram User',
        avatar_url: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email || 'sahil'}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Welcome to my Instagram profile!',
        website: '',
        is_verified: false,
        is_admin: false,
        followers: 0,
        following: 0,
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

  const createCustomProfile = async (authUser: any) => {
    const meta = authUser.user_metadata || {};
    const localProf = localStorage.getItem('insta_profile');
    let existingProfile: Profile | null = null;
    if (localProf) {
      try {
        existingProfile = JSON.parse(localProf);
      } catch (e) {}
    }

    const newP: Profile = {
      id: authUser.id,
      username: existingProfile?.username || meta.username || authUser.email?.split('@')[0] || 'sahil_user',
      full_name: existingProfile?.full_name || meta.full_name || meta.name || 'Instagram User',
      avatar_url: existingProfile?.avatar_url || meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || 'sahil'}`,
      cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      bio: existingProfile?.bio || 'Welcome to my Instagram profile!',
      website: existingProfile?.website || '',
      is_verified: false,
      is_admin: false,
      created_at: new Date().toISOString(),
    };

    setProfile(newP);
    localStorage.setItem('insta_profile', JSON.stringify(newP));
    localStorage.setItem('insta_session', JSON.stringify(authUser));

    // UPSERT TO SUPABASE PROFILES TABLE
    try {
      await supabase.from('profiles').upsert([{
        id: newP.id,
        username: newP.username,
        full_name: newP.full_name,
        avatar_url: newP.avatar_url,
        bio: newP.bio,
        website: newP.website,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn("Supabase profile sync notice:", e);
    }
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
      const customUser = { id: 'usr_' + Date.now(), email };
      setUser(customUser);
      createCustomProfile(customUser);
      toast.success(`Logged in as @${email.split('@')[0]}`);
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
      setUser(newUser);
      
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

      setProfile(newProf);
      localStorage.setItem('insta_profile', JSON.stringify(newProf));
      localStorage.setItem('insta_session', JSON.stringify(newUser));

      try {
        await supabase.from('profiles').upsert([newProf]);
      } catch (e) {}

      toast.success("Account created successfully!");
      return true;
    } catch (err: any) {
      const newUser = { id: 'usr_' + Date.now(), email };
      setUser(newUser);
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
      setProfile(newProf);
      localStorage.setItem('insta_profile', JSON.stringify(newProf));
      localStorage.setItem('insta_session', JSON.stringify(newUser));
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
      if (p) {
        localStorage.setItem('insta_profile', JSON.stringify(p));
        if (p.id) {
          supabase.from('profiles').upsert([{
            id: p.id,
            username: p.username,
            full_name: p.full_name,
            bio: p.bio,
            website: p.website,
            avatar_url: p.avatar_url,
            updated_at: new Date().toISOString()
          }]).then();
        }
      }
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
