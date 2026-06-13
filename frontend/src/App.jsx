import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from './lib/axios';
import Login from './components/Login';
import Layout from './components/Layout';
import PipelineBoard from './components/pipeline/PipelineBoard';
import DashboardOverview from './components/dashboard/DashboardOverview';
import HealthmateModal from './components/pipeline/HealthmateModal';
import TeamManagement from './components/dashboard/TeamManagement';
import MyTasks from './components/dashboard/MyTasks';
import Support from './components/Support';
import SupportDashboard from './components/dashboard/SupportDashboard';
import useOpsStore from './store/useOpsStore';
import CalendarView from './components/dashboard/CalendarView';
import ChatBoxTab from './components/dashboard/ChatBoxTab';
import ProfilePage from './components/profile/ProfilePage';
import StressBuster from './components/dashboard/StressBuster';
import { initAudio, playNotificationSound } from './lib/audio';

// ─── Page registry ────────────────────────────────────────────────────────────

const PAGES = {
  dashboard: <DashboardOverview />,
  pipeline:  <PipelineBoard />,
  tasks:     <MyTasks />,
  calendar:  <CalendarView />,
  team:      <TeamManagement />,
  support:   <Support />,
  support_dashboard: <SupportDashboard />,
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
  const [activePage, setActivePage] = useState('dashboard');
  const selectedHealthmate = useOpsStore((s) => s.selectedHealthmate);
  const [gameSession, setGameSession] = useState(null);
  const token = useOpsStore((s) => s.token);
  const currentUser = useOpsStore((s) => s.user);

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
          <span className="font-extrabold text-xs text-[#142b27] flex items-center gap-1.5">
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
              className="px-3 py-1 bg-[#00ad9c] hover:bg-[#009687] text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all"
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

    return () => es.close();
  }, [token, currentUser]);

  const currentPage =
    activePage === 'team_chat' ? <ChatBoxTab onClose={() => setActivePage('dashboard')} /> :
    activePage === 'profile'   ? <ProfilePage onClose={() => setActivePage('dashboard')} /> :
    activePage === 'deflector' ? <StressBuster onClose={() => { setActivePage('dashboard'); setGameSession(null); }} gameSession={gameSession} setGameSession={setGameSession} /> :
    (PAGES[activePage] ?? PAGES.dashboard);

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
      "color: #00ad9c; font-size: 13px; font-weight: bold; font-family: monospace;"
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
            color: '#142b27',
            border: '1px solid #d3ebd7',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '700',
            padding: '10px 14px',
            boxShadow: '0 10px 35px rgba(20,43,39,0.07)',
          },
          success: {
            iconTheme: { primary: '#5fba46', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
          loading: {
            iconTheme: { primary: '#00ad9c', secondary: '#ffffff' },
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
