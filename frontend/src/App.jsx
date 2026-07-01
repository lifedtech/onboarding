import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from './lib/axios';
import Login from './components/Login';
import Layout from './components/Layout';
import PipelineBoard from './components/pipeline/PipelineBoard';
import HealthmateDashboard from './components/dashboard/HealthmateDashboard';
import HealthmatesList from './components/dashboard/HealthmatesList';
import ServiceUserDashboard from './components/dashboard/ServiceUserDashboard';
import HealthmateModal from './components/pipeline/HealthmateModal';
import TeamManagement from './components/dashboard/TeamManagement';
import MyTasks from './components/dashboard/MyTasks';
import Support from './components/Support';
import SystemSupport from './components/SystemSupport';
import SupportDashboard from './components/dashboard/SupportDashboard';
import useOpsStore from './store/useOpsStore';
import CalendarView from './components/dashboard/CalendarView';
import ChatBoxTab from './components/dashboard/ChatBoxTab';
import ProfilePage from './components/profile/ProfilePage';
import StressBuster from './components/dashboard/StressBuster';
import EnquiriesSheet from './components/enquiries/EnquiriesSheet';
import ServiceUsersList from './components/dashboard/ServiceUsersList';
import AdminDashboard from './components/dashboard/AdminDashboard';
import BookingOperations from './components/dashboard/BookingOperations';
import ProgramPerformance from './components/dashboard/ProgramPerformance';
import SalesMarketingDashboard from './components/dashboard/SalesMarketingDashboard';
import { initAudio, playNotificationSound } from './lib/audio';


// ─── Page registry ────────────────────────────────────────────────────────────

const PAGES = {
  admin_dashboard: <AdminDashboard />,
  sales_marketing_dashboard: <SalesMarketingDashboard />,
  booking_operations: <BookingOperations />,
  program_performance: <ProgramPerformance />,
  healthmate_dashboard: <HealthmateDashboard />,
  healthmates_list: <HealthmatesList />,
  service_user_dashboard: <ServiceUserDashboard />,
  healthmate_enquiries: <EnquiriesSheet enquiryType="HEALTH_PARTNER" />, 
  service_user_enquiries: <EnquiriesSheet enquiryType="SERVICE_USER" />,
  pipeline:  <PipelineBoard />,
  service_users: <ServiceUsersList />,
  tasks:     <MyTasks />,
  healthmate_calendar:  <CalendarView />, // Pass category prop later if needed
  service_user_calendar:  <CalendarView />, 
  team:      <TeamManagement />,
  healthmate_support:   <Support />,
  service_user_support:   <Support />,
  system_support: <SystemSupport />,
  support_dashboard: <SupportDashboard />,
  promotions: <div className="p-8 text-center text-text-muted">Promotions functionality coming soon.</div>,
};


// ─── Background chat notifier (active when NOT on team_chat page) ─────────────

function ChatNotifier() {
  const token            = useOpsStore((s) => s.token);
  const setChatHasUnread = useOpsStore((s) => s.setChatHasUnread);

  useEffect(() => {
    if (!token) return;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const es  = new EventSource(url);
    const notify = () => { setChatHasUnread(true); playNotificationSound(); };
    es.addEventListener('message',      notify);
    es.addEventListener('conversation', notify);
    return () => es.close();
  }, [token]);

  return null;
}

// ─── Authenticated workspace ──────────────────────────────────────────────────

function Workspace() {
  const currentUser = useOpsStore((s) => s.user);
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';
  const scopes = currentUser?.accessScopes || [];
  const hasFullAccess = isAdmin || scopes.includes('FULL_ACCESS');
  
  let defaultPage = 'healthmate_dashboard';
  if (hasFullAccess) {
    defaultPage = 'admin_dashboard';
  } else if (currentUser?.role?.toUpperCase() === 'MARKETING' || scopes.includes('SALES_MARKETING')) {
    defaultPage = 'sales_marketing_dashboard';
  } else if (scopes.includes('SERVICE_USERS') && !scopes.includes('HEALTHMATES')) {
    defaultPage = 'service_user_dashboard';
  }
  
  const [activePage, setActivePage] = useState(defaultPage);
  const selectedHealthmate = useOpsStore((s) => s.selectedHealthmate);
  const [gameSession, setGameSession] = useState(null);
  const token = useOpsStore((s) => s.token);
  const logout = useOpsStore((s) => s.logout);
  const addNotification = useOpsStore((s) => s.addNotification);

  // Inactivity idle timer (15 minutes auto-logout)
  useEffect(() => {
    if (!token) return;

    const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    let timeoutId;

    const handleLogout = () => {
      logout();
      toast('Session expired due to inactivity. Please log in again.', {
        icon: '⏰',
        duration: 8000,
        id: 'idle-logout-toast'
      });
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, IDLE_TIMEOUT);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    resetTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/stream?token=${token}`;
    const es = new EventSource(url);

    // Listen for multiplayer game invitations
    es.addEventListener('game_invite', (event) => {
      const { gameId, hostName, gameType } = JSON.parse(event.data);
      playNotificationSound();

      const isTug = gameType === 'tug_of_war';
      const gameTitle = isTug ? 'Server Tug of War' : 'Ticket Deflector';
      const gameDuration = isTug ? '30-second' : '60-second';

      toast((t) => (
        <div className="flex flex-col gap-1.5 p-1">
          <span className="font-extrabold text-xs text-text-main flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
            🎮 {gameTitle} Invite from {hostName}!
          </span>
          <p className="text-[10px] text-slate-500 font-semibold">
            Join them for a {gameDuration} {gameTitle} match.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                api.post('/game/reject', { gameId }).catch(() => {});
              }}
              className="px-3 py-1 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-50 text-[10px] font-extrabold transition-all"
            >
              Decline
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.post('/game/accept', { gameId });
                } catch {
                  toast.error('Failed to join game. Session might have expired.');
                }
              }}
              className="px-3 py-1 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all"
            >
              Accept
            </button>
          </div>
        </div>
      ), { duration: 15000, id: `invite-${gameId}` });
    });

    // Listen for invite accepted / game start
    es.addEventListener('game_start', (event) => {
      const data = JSON.parse(event.data);
      if (data.hostId === currentUser?.id || data.guestId === currentUser?.id) {
        setGameSession(data);
        setActivePage('deflector');
      }
    });

    // Listen for support tickets being raised
    es.addEventListener('ticket_created', (event) => {
      const ticket = JSON.parse(event.data);
      
      // Ignore if raised by the current user themselves
      if (ticket.raisedByOpsId === currentUser?.id) return;
      
      // Add to store tickets & notifications
      addNotification(ticket);
      playNotificationSound();
      
      // Show elegant toast
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-[12px] text-brand-teal">
            New Support Ticket Raised!
          </span>
          <span className="text-[11px] font-bold text-text-main line-clamp-1">
            {ticket.title}
          </span>
          <span className="text-[10px] font-semibold text-text-muted">
            Raised by {ticket.raisedByOps?.name || 'Unknown'} · {ticket.priority}
          </span>
        </div>,
        { id: `ticket-${ticket.id}` }
      );
    });

    return () => es.close();
  }, [token, currentUser, addNotification]);

  const currentPage =
    activePage === 'team_chat' ? <ChatBoxTab onClose={() => setActivePage('healthmate_dashboard')} /> :
    activePage === 'profile'   ? <ProfilePage onClose={() => setActivePage('healthmate_dashboard')} /> :
    activePage === 'deflector' ? <StressBuster onClose={() => { setActivePage('healthmate_dashboard'); setGameSession(null); }} gameSession={gameSession} setGameSession={setGameSession} /> :
    (PAGES[activePage] ?? PAGES.healthmate_dashboard);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {/* Background SSE notifier — only active when not on team_chat */}
      {activePage !== 'team_chat' && <ChatNotifier />}
      {currentPage}
      {selectedHealthmate && <HealthmateModal />}
    </Layout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const token = useOpsStore((s) => s.token);

  useEffect(() => {
    console.log(
      "%c🎨 Crafted with care by Ayush",
      "color: #00B09B; font-size: 13px; font-weight: bold; font-family: monospace;"
    );
    initAudio(); // Unlock Web Audio API on first user gesture
  }, []);

  useEffect(() => {
    if (!token) return;
    const sendHeartbeat = () => api.post('/users/heartbeat').catch(() => {});
    sendHeartbeat(); // Initial ping
    const interval = setInterval(sendHeartbeat, 8000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      {/* Toast container — sits above everything, styled to match the dark theme */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#2C3E50',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '700',
            padding: '10px 14px',
            boxShadow: '0 10px 35px rgba(20,43,39,0.07)',
          },
          success: {
            iconTheme: { primary: '#78C652', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
          loading: {
            iconTheme: { primary: '#00B09B', secondary: '#ffffff' },
          },
        }}
      />

      {token ? (
        <Workspace />
      ) : (
        <Login />
      )}
    </>
  );
}
