import { useState } from 'react';
import {
  Activity, LayoutDashboard, GitBranch, CheckSquare, LogOut, Menu, X, Users, LifeBuoy, Wrench, Calendar, Target,
  MessageSquare, FileSpreadsheet, HeartHandshake, ChevronDown, ChevronRight, Search, Bell, Megaphone, ShieldCheck
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
    case 'online': default: return '#10b981';
  }
};

export default function Layout({ children, activePage, onNavigate }) {
  const user = useOpsStore((s) => s.user);
  const logout = useOpsStore((s) => s.logout);
  const chatHasUnread = useOpsStore((s) => s.chatHasUnread);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopMinimized, setDesktopMinimized] = useState(false);
  const [expanded, setExpanded] = useState({
    healthmates: true,
    serviceUsers: true,
    ops: true,
    admin: true
  });

  const toggleGroup = (group) => {
    setExpanded(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'OP';

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const scopes = user?.accessScopes || [];
  const hasFullAccess = isAdmin || scopes.includes('FULL_ACCESS');
  const hasSalesMarketing = hasFullAccess || scopes.includes('SALES_MARKETING');
  const showHealthmates = hasFullAccess || scopes.includes('HEALTHMATES');
  const showServiceUsers = hasFullAccess || scopes.includes('SERVICE_USERS');

  const GROUPS = [];

  if (hasFullAccess) {
    GROUPS.push({
      id: 'admin',
      label: 'Admin',
      items: [
        { label: 'God View Analytics', icon: ShieldCheck, href: 'admin_dashboard' },
        { label: 'Task Manager', icon: Wrench, href: 'support_dashboard' },
        { label: 'Team Settings', icon: Users, href: 'team' },
      ]
    });
  }

  if (hasSalesMarketing) {
    GROUPS.push({
      id: 'sales_marketing',
      label: 'Sales & Marketing',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: 'sales_marketing_dashboard' },
        { label: 'Program Performance', icon: Target, href: 'program_performance' },
        { label: 'Booking Operations', icon: Activity, href: 'booking_operations' },
      ]
    });
  }

  if (showHealthmates) {
    GROUPS.push({
      id: 'healthmates',
      label: 'HealthMates - SuperHeros',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: 'healthmate_dashboard' },
        { label: 'Healthmates List', icon: Users, href: 'healthmates_list' },
        { label: 'Enquiries', icon: FileSpreadsheet, href: 'healthmate_enquiries' },
        { label: 'Pipeline', icon: GitBranch, href: 'pipeline' },
        { label: 'Support', icon: LifeBuoy, href: 'healthmate_support' },
        { label: 'Calendar', icon: Calendar, href: 'healthmate_calendar' },
      ]
    });
  }

  if (showServiceUsers) {
    GROUPS.push({
      id: 'serviceUsers',
      label: 'Service Users',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: 'service_user_dashboard' },
        { label: 'Users List', icon: HeartHandshake, href: 'service_users' },
        { label: 'Enquiries', icon: FileSpreadsheet, href: 'service_user_enquiries' },
        { label: 'User Support', icon: LifeBuoy, href: 'service_user_support' },
        { label: 'Promotions', icon: Megaphone, href: 'promotions' },
      ]
    });
  }

  GROUPS.push({
    id: 'ops',
    label: 'Internal / Ops',
    items: [

      { label: 'Team Chat', icon: MessageSquare, href: 'team_chat', showDot: chatHasUnread },
      { label: 'Stress Buster', icon: Activity, href: 'deflector' },
    ]
  });

  const handleNav = (href) => {
    onNavigate(href);
    setMobileOpen(false);
  };

  const SidebarContent = ({ minimized }) => (
    <div className="flex flex-col h-full bg-[#1e293b] text-slate-300">
      {/* Sidebar Nav */}
      <nav className={`flex-1 ${minimized ? 'px-2' : 'px-3'} py-4 space-y-4 overflow-y-auto min-h-0 custom-scrollbar overflow-x-hidden`}>
        {GROUPS.map(group => (
          <div key={group.id} className="space-y-1">
            <button
              onClick={() => !minimized && toggleGroup(group.id)}
              className={`w-full flex items-center justify-between py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors ${minimized ? 'px-0 justify-center' : 'px-2'}`}
              title={minimized ? group.label : undefined}
            >
              {minimized ? (
                <span className="text-[10px] text-slate-500 font-extrabold truncate w-full text-center tracking-tight leading-tight px-1">
                  {group.label.slice(0, 3)}
                </span>
              ) : (
                <>
                  <span className="truncate">{group.label}</span>
                  {expanded[group.id] ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </>
              )}
            </button>
            {(expanded[group.id] || minimized) && (
              <div className={`space-y-0.5 mt-1 ${minimized ? '' : 'border-l border-slate-700/50 ml-2 pl-2'}`}>
                {group.items.map(({ label, icon: Icon, href, showDot }) => {
                  const active = activePage === href;
                  return (
                    <button
                      key={href}
                      onClick={() => handleNav(href)}
                      title={minimized ? label : undefined}
                      className={`w-full flex items-center gap-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200
                        ${minimized ? 'px-0 justify-center' : 'px-3'}
                        ${active
                          ? 'bg-brand-teal/10 text-brand-teal font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-teal' : 'text-slate-500'}`} />
                        {showDot && (
                          <span className={`absolute ${minimized ? '-top-1 -right-1' : 'hidden'} w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50`} />
                        )}
                      </div>
                      
                      {!minimized && (
                        <>
                          <span className="flex-1 text-left truncate">{label}</span>
                          {showDot && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`p-4 border-t border-slate-700/50 space-y-2 shrink-0 bg-[#0f172a] ${minimized ? 'px-2 flex flex-col items-center' : ''}`}>
        <button
          onClick={() => handleNav('profile')}
          className={`w-full flex items-center gap-3 py-2 rounded-md hover:bg-white/5 transition-colors text-left group ${minimized ? 'justify-center px-0' : 'px-2'}`}
          title={minimized ? "View Profile" : undefined}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={UPLOADS_BASE + user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                {initials}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a]"
              style={{ backgroundColor: getStatusColor(user?.statusMode) }}
            />
          </div>
          {!minimized && (
            <div className="min-w-0 flex-1">
              <p className="text-white text-[13px] font-bold truncate group-hover:text-brand-teal transition-colors">{user?.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
            </div>
          )}
        </button>
        <button
          onClick={logout}
          title={minimized ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 py-2 rounded-md text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${minimized ? 'justify-center px-0' : 'px-2'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!minimized && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      
      {/* Top Navigation Bar (AWS Style) */}
      <header className="h-14 bg-[#0f172a] text-white flex items-center justify-between px-4 shrink-0 border-b border-slate-800 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDesktopMinimized(!desktopMinimized)}
            className="hidden md:block text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              <img src={logo} alt="Lifed Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-sm tracking-wide text-slate-100 hidden sm:inline-block">Lifed Operations</span>
          </div>
        </div>

        {/* Global Search Bar (Mock) */}
        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search resources, services, and docs" 
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all placeholder-slate-500"
            />
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            {chatHasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700">
            <span className="text-[12px] font-semibold text-slate-300">{user?.name}</span>
            <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center text-[10px] font-extrabold">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className={`hidden md:flex flex-col shrink-0 shadow-xl z-10 transition-all duration-300 ${desktopMinimized ? 'w-[72px]' : 'w-64'}`}>
          {SidebarContent({ minimized: desktopMinimized })}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 z-50 shadow-2xl">
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {SidebarContent({ minimized: false })}
            </aside>
          </div>
        )}

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
