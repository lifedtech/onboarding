import { useState } from 'react';
import {
  Activity,
  LayoutDashboard,
  GitBranch,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Users,
  LifeBuoy,
  Wrench,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  HeartHandshake
} from 'lucide-react';

import useOpsStore from '../store/useOpsStore';
import logo from '../assets/favicon.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const UPLOADS_BASE = API_BASE.replace('/api', '');

const getStatusColor = (mode) => {
  switch (mode) {
    case 'busy': return '#f59e0b';
    case 'dnd': return '#ef4444';
    case 'offline': return '#64748b';
    case 'online':
    default: return '#10b981';
  }
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard' },
  { label: 'Enquiries', icon: FileSpreadsheet,   href: 'enquiries' },
  { label: 'Pipeline',  icon: GitBranch,       href: 'pipeline'  },
  { label: 'Service Users', icon: HeartHandshake, href: 'service_users' },
  { label: 'My Tasks',  icon: CheckSquare,      href: 'tasks'     },
  { label: 'Calendar',  icon: Calendar,        href: 'calendar'  },
];



export default function Layout({ children, activePage, onNavigate }) {
  const user   = useOpsStore((s) => s.user);
  const logout = useOpsStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'OP';

  const SidebarContent = () => {
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
    const chatHasUnread = useOpsStore((s) => s.chatHasUnread);
    const currentNavItems = [...NAV_ITEMS];
    currentNavItems.push({ label: 'Support', icon: LifeBuoy, href: 'support' });
    currentNavItems.push({ label: 'Team Chat', icon: MessageSquare, href: 'team_chat', showDot: chatHasUnread });
    currentNavItems.push({ label: 'Stress Buster', icon: Activity, href: 'deflector' });
    if (isAdmin) {
      currentNavItems.push({ label: 'Task Manager', icon: Wrench, href: 'support_dashboard' });
      currentNavItems.push({ label: 'Team Settings', icon: Users, href: 'team' });
    }

    return (
      <div className="flex flex-col h-full bg-[#22313F] text-slate-100">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 border border-white/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-inner bg-white/10">
            <img src={logo} alt="Lifed Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight tracking-wider truncate">Lifed Healthmate</p>
            <p className="text-brand-teal/80 text-xs font-semibold">Onboarding Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          {currentNavItems.map(({ label, icon: Icon, href, showDot }) => {
            const active = activePage === href;
            return (
              <button
                key={href}
                onClick={() => { onNavigate(href); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                  ${active
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/15'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {showDot && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50" />
                )}
              </button>
            );
          })}
        </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2 shrink-0">
        <button
          onClick={() => { onNavigate('profile'); setMobileOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
          title="View Profile"
        >
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                src={UPLOADS_BASE + user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-extrabold border border-white/10 shadow-sm">
                {initials}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#22313F]"
              style={{ backgroundColor: getStatusColor(user?.statusMode) }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-bold truncate group-hover:text-brand-teal transition-colors">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
};

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border-leaf/20 shadow-md">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-border-leaf shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
              <img src={logo} alt="Lifed Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-text-main font-extrabold text-sm tracking-wide">Lifed Healthmate</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-muted hover:text-brand-teal transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-bg-base">
          {children}
        </main>
      </div>
    </div>
  );
}
