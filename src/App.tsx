import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CallProvider } from './context/CallContext';

import { Navbar } from './components/common/Navbar';
import { FeedView } from './components/feed/FeedView';
import { ReelsView } from './components/reels/ReelsView';
import { ExploreView } from './components/explore/ExploreView';
import { ProfileView } from './components/profile/ProfileView';

import { AuthModal } from './components/auth/AuthModal';
import { ChatModal } from './components/chat/ChatModal';
import { CallModal } from './components/calls/CallModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';

export const MainAppContent: React.FC = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<'feed' | 'reels' | 'explore' | 'profile'>(() => {
    const saved = localStorage.getItem('insta_current_view');
    return (saved === 'profile' || saved === 'explore' || saved === 'feed') ? saved as any : 'feed';
  });

  const [targetUsername, setTargetUsername] = useState<string | undefined>(undefined);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('insta_current_view', currentView);
  }, [currentView]);

  const handleOpenUserProfile = (username?: string) => {
    setTargetUsername(username);
    setCurrentView('profile');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-primary text-white flex items-center justify-center p-4">
        <AuthModal isOpen={true} />
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#262626', color: '#fff' } }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white flex">
      {/* NAVBAR SIDEBAR & BOTTOM BAR */}
      <Navbar
        currentView={currentView}
        unreadCount={unreadNotificationsCount}
        onNavigate={(view) => {
          if (view === 'profile') setTargetUsername(undefined);
          setCurrentView(view as any);
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 md:ml-60 p-4 pb-20 md:pb-6 min-h-screen flex justify-center">
        {currentView === 'feed' && (
          <FeedView
            isCreateOpen={isCreateOpen}
            onCloseCreate={() => setIsCreateOpen(false)}
            onOpenUserProfile={handleOpenUserProfile}
          />
        )}
        {currentView === 'reels' && <ReelsView />}
        {currentView === 'explore' && (
          <ExploreView onOpenUserProfile={handleOpenUserProfile} />
        )}
        {currentView === 'profile' && (
          <ProfileView
            targetUsername={targetUsername}
            onBackToSelf={() => setTargetUsername(undefined)}
          />
        )}
      </main>

      {/* MODALS */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenUserProfile={handleOpenUserProfile}
        onUnreadCountChange={setUnreadNotificationsCount}
      />
      <CallModal />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      <Toaster position="bottom-right" toastOptions={{ style: { background: '#262626', color: '#fff' } }} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CallProvider>
          <MainAppContent />
        </CallProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
