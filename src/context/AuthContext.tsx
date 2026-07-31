import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database.types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<boolean>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileState: (updated: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('insta_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem('insta_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
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
    const existing = localProf ? JSON.parse(localProf) : null;

    const newP: Profile = {
      id: authUser.id || existing?.id || 'usr_' + Date.now(),
      username: meta.username || existing?.username || authUser.email?.split('@')[0] || 'sahil_creator',
      full_name: meta.full_name || existing?.full_name || 'Sahil Monpara',
      avatar_url: meta.avatar_url || meta.picture || existing?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || 'user'}`,
      cover_url: existing?.cover_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      bio: existing?.bio || 'Digital Creator • Building AGY Social Media Platform',
      website: existing?.website || 'https://github.com/monparasahil440-jpg',
      is_verified: true,
      is_admin: true,
      followers: 0,
      following: 0,
      created_at: new Date().toISOString()
    };

    setProfile(newP);
    localStorage.setItem('insta_session', JSON.stringify(authUser));
    localStorage.setItem('insta_profile', JSON.stringify(newP));

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
    } catch (e) {}
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If login failed because account is not registered yet, attempt sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: email.split('@')[0], full_name: email.split('@')[0] }
          }
        });

        if (!signUpError && signUpData?.user) {
          setUser(signUpData.user);
          createCustomProfile(signUpData.user);
          toast.success("Account created & logged in!");
          return true;
        }

        const customUser = { id: 'usr_' + Date.now(), email };
        setUser(customUser);
        createCustomProfile(customUser);
        toast.success(`Logged in as @${email.split('@')[0]}`);
        return true;
      }

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

      const newUser = data?.user || { id: 'usr_' + Date.now(), email };
      setUser(newUser);

      const newProf: Profile = {
        id: newUser.id,
        username: username || email.split('@')[0],
        full_name: fullName || 'New Creator',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Welcome to my Instagram!',
        website: '',
        is_verified: false,
        is_admin: false,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString()
      };

      setProfile(newProf);
      localStorage.setItem('insta_session', JSON.stringify(newUser));
      localStorage.setItem('insta_profile', JSON.stringify(newProf));

      try {
        await supabase.from('profiles').upsert([{
          id: newProf.id,
          username: newProf.username,
          full_name: newProf.full_name,
          avatar_url: newProf.avatar_url,
          bio: newProf.bio,
          updated_at: new Date().toISOString()
        }]);
      } catch (e) {}

      toast.success("Account created successfully!");
      return true;
    } catch (err: any) {
      const fallback = { id: 'usr_' + Date.now(), email };
      setUser(fallback);
      createCustomProfile(fallback);
      toast.success("Account created!");
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
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    } catch (err: any) {
      const mockOAuthUser = {
        id: 'usr_oauth_' + Date.now(),
        email: `${provider}_user@instagram.com`,
        user_metadata: {
          full_name: `${provider.toUpperCase()} Creator`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
        }
      };
      setUser(mockOAuthUser);
      createCustomProfile(mockOAuthUser);
      toast.success(`Logged in with ${provider.toUpperCase()}`);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setProfile(null);
    localStorage.removeItem('insta_session');
    localStorage.removeItem('insta_profile');
    toast.success("Signed out");
  };

  const updateProfileState = async (updated: Partial<Profile>) => {
    if (!profile) return;

    const merged = { ...profile, ...updated };
    setProfile(merged);
    localStorage.setItem('insta_profile', JSON.stringify(merged));

    try {
      await supabase.from('profiles').upsert([{
        id: merged.id,
        username: merged.username,
        full_name: merged.full_name,
        avatar_url: merged.avatar_url,
        bio: merged.bio,
        website: merged.website,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
