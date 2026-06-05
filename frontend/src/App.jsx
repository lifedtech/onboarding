import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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


// ─── Authenticated workspace ──────────────────────────────────────────────────

function Workspace() {
  const [activePage, setActivePage] = useState('dashboard');
  const selectedHealthmate = useOpsStore((s) => s.selectedHealthmate);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {PAGES[activePage] ?? PAGES.dashboard}
      {selectedHealthmate && <HealthmateModal />}
    </Layout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const token = useOpsStore((s) => s.token);

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

      {token ? <Workspace /> : <Login />}
    </>
  );
}
