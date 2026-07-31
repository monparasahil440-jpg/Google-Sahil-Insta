import React from 'react';
import { Home, Search, Film, MessageCircle, PlusSquare, User, Moon, Sun, ShieldAlert, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  currentView: string;
  unreadCount?: number;
  onNavigate: (view: string) => void;
  onOpenCreate: () => void;
  onOpenChat: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  unreadCount = 0,
  onNavigate,
  onOpenCreate,
  onOpenChat,
  onOpenNotifications,
  onOpenAdmin
}) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-60 h-screen fixed top-0 left-0 border-r border-dark-border bg-dark-primary p-5 z-40">
        <div>
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight bg-instagram-gradient bg-clip-text text-transparent mb-8 pl-2">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-instagram-pink">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Instagram
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => onNavigate('feed')}
              className={`flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 ${currentView === 'feed' ? 'font-bold text-white' : 'text-neutral-300'}`}
            >
              <Home className="w-6 h-6" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className={`flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 ${currentView === 'explore' ? 'font-bold text-white' : 'text-neutral-300'}`}
            >
              <Search className="w-6 h-6" />
              <span>Search</span>
            </button>

            <button
              onClick={onOpenChat}
              className="flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 text-neutral-300 relative"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Messages</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 text-neutral-300 relative"
            >
              <div className="relative">
                <Heart className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-instagram-like text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 text-neutral-300"
            >
              <PlusSquare className="w-6 h-6" />
              <span>Create</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 ${currentView === 'profile' ? 'font-bold text-white' : 'text-neutral-300'}`}
            >
              <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'me'}`} className="w-6 h-6 rounded-full object-cover border border-white/20" alt="Profile" />
              <span>Profile</span>
            </button>

            {profile?.is_admin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 text-amber-400 font-semibold"
              >
                <ShieldAlert className="w-6 h-6" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 p-3 rounded-xl transition hover:bg-white/10 text-neutral-300 w-full"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-300" /> : <Moon className="w-6 h-6" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-500 pl-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Supabase Live
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-14 bg-dark-primary border-t border-dark-border flex justify-around items-center z-40">
        <button onClick={() => onNavigate('feed')} className={`p-2 ${currentView === 'feed' ? 'text-white' : 'text-neutral-400'}`}>
          <Home className="w-6 h-6" />
        </button>
        <button onClick={() => onNavigate('explore')} className={`p-2 ${currentView === 'explore' ? 'text-white' : 'text-neutral-400'}`}>
          <Search className="w-6 h-6" />
        </button>
        <button onClick={onOpenCreate} className="p-2 text-neutral-400">
          <PlusSquare className="w-6 h-6" />
        </button>
        <button onClick={onOpenNotifications} className="p-2 text-neutral-400 relative">
          <Heart className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-instagram-like text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={onOpenChat} className="p-2 text-neutral-400">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button onClick={() => onNavigate('profile')} className={`p-2 ${currentView === 'profile' ? 'text-white' : 'text-neutral-400'}`}>
          <User className="w-6 h-6" />
        </button>
      </nav>
    </>
  );
};
