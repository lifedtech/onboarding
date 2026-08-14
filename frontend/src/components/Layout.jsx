import { useState, useEffect } from 'react';
import {  
  Activity, LayoutDashboard, GitBranch, CheckSquare, LogOut, Menu, X, Users, LifeBuoy, Wrench, Calendar, Target,
  MessageSquare, FileSpreadsheet, HeartHandshake, ChevronDown, ChevronRight, Search, Bell, Megaphone, ShieldCheck,
  RefreshCw, BookOpen, Sun, Moon, Sparkles, Send, PhoneCall, Link2, Camera, Mail, Clock
  } from 'lucide-react';
import useOpsStore from '../store/useOpsStore';
import useNotesStore from '../store/useNotesStore';
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
  const token = useOpsStore((s) => s.token);
  const logout = useOpsStore((s) => s.logout);
  const chatHasUnread = useOpsStore((s) => s.chatHasUnread);
  const error = useOpsStore((s) => s.error);
  const refreshAll = useOpsStore((s) => s.refreshAll);
  const isLoading = useOpsStore((s) => s.isLoading);
  const notifications = useOpsStore((s) => s.notifications);
  const markNotificationAsRead = useOpsStore((s) => s.markNotificationAsRead);
  const markAllNotificationsAsRead = useOpsStore((s) => s.markAllNotificationsAsRead);
  const toggleNotes = useNotesStore((s) => s.toggleNotes);

  const healthmates = useOpsStore(s => s.healthmates);
  const serviceUsers = useOpsStore(s => s.serviceUsers);
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);
  const setSelectedServiceUser = useOpsStore((s) => s.setSelectedServiceUser);

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Theme state: defaults to light mode
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') !== 'dark';
  });

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'light' : 'dark');
      return next;
    });
  };

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [isLightMode]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopMinimized, setDesktopMinimized] = useState(false);
  const [expanded, setExpanded] = useState({
    healthmates: false,
    serviceUsers: false,
    ops: false,
    admin: false,
    sales_marketing: false,
    support: false,
    communication_tracking: true
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
      label: 'HealthMates',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: 'healthmate_dashboard' },
        { label: 'Healthmates List', icon: Users, href: 'healthmates_list' },
        { label: 'Enquiries', icon: FileSpreadsheet, href: 'healthmate_enquiries' },
        { label: 'Pipeline', icon: GitBranch, href: 'pipeline' },
        { label: 'Calendar', icon: Calendar, href: 'healthmate_calendar' },
        { label: 'SOP - Standard Operation Protocol', icon: BookOpen, href: 'healthmate_sop' },
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
        { label: 'Promotions', icon: Megaphone, href: 'promotions' },
      ]
    });
  }

  // Dedicated Communication & Tracking Group
  GROUPS.push({
    id: 'communication_tracking',
    label: 'Communication & Tracking',
    items: [
      { label: 'Message & Media Assets', icon: MessageSquare, href: 'communication_assets' },
      { label: 'Sent Message Tracker', icon: Clock, href: 'comm_sent_tracker' },
    ]
  });

  const supportItems = [];
  if (showHealthmates) {
    supportItems.push({ label: 'Healthmate Support', icon: LifeBuoy, href: 'healthmate_support' });
  }
  if (showServiceUsers) {
    supportItems.push({ label: 'User Support', icon: LifeBuoy, href: 'service_user_support' });
  }
  supportItems.push({ label: 'Lewis Support', icon: LifeBuoy, href: 'lewis_support' });

  GROUPS.push({
    id: 'support',
    label: 'Support',
    items: supportItems
  });

  GROUPS.push({
    id: 'ops',
    label: 'Internal / Ops',
    items: [
      { label: 'Team Chat', icon: MessageSquare, href: 'team_chat', showDot: chatHasUnread },
      { label: 'Stress Buster', icon: Activity, href: 'deflector' },
      { label: 'Ops Journey', icon: BookOpen, href: 'diary' },
      { label: 'System Support', icon: LifeBuoy, href: 'system_support' },
    ]
  });

  const handleNav = (href) => {
    onNavigate(href);
    setMobileOpen(false);
  };

  // Group formatting logic for search results
  const searchPages = () => {
    if (!searchQuery) return [];
    return GROUPS.flatMap(g => g.items)
      .filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(item => ({ ...item, type: 'PAGE' }));
  };

  const searchHealthmates = () => {
    if (!searchQuery) return [];
    return healthmates
      .filter(hm => hm.name?.toLowerCase().includes(searchQuery.toLowerCase()) || hm.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(hm => ({ ...hm, type: 'HEALTHMATE' }));
  };

  const searchServiceUsers = () => {
    if (!searchQuery) return [];
    return serviceUsers
      .filter(su => su.name?.toLowerCase().includes(searchQuery.toLowerCase()) || su.email?.toLowerCase().includes(searchQuery.toLowerCase()) || (su.phone && su.phone.includes(searchQuery)))
      .map(su => ({ ...su, type: 'SERVICE_USER' }));
  };

  const handleSearchResultClick = (result) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    
    if (result.type === 'PAGE') {
      onNavigate(result.href);
    } else if (result.type === 'HEALTHMATE') {
      setSelectedHealthmate(result);
      onNavigate('healthmates_list');
    } else if (result.type === 'SERVICE_USER') {
      setSelectedServiceUser(result);
      onNavigate('service_users');
    }
  };

  const pageResults = searchPages();
  const hmResults = searchHealthmates();
  const suResults = searchServiceUsers();
  const hasSearchResults = pageResults.length > 0 || hmResults.length > 0 || suResults.length > 0;

  const SidebarContent = ({ minimized }) => (
    <div className={`flex flex-col h-full transition-colors duration-200 z-10 relative ${isLightMode ? 'bg-white text-slate-800 border-r border-slate-200/50' : 'bg-[#131c2f] text-slate-300 border-r border-white/5'}`}>
      {/* Sidebar Nav */}
      <nav className={`flex-1 ${minimized ? 'px-2' : 'px-3'} py-4 space-y-4 overflow-y-auto min-h-0 custom-scrollbar overflow-x-hidden`}>
        {GROUPS.map(group => (
          <div key={group.id} className="space-y-1">
            <button
              onClick={() => !minimized && toggleGroup(group.id)}
              className={`w-full flex items-center justify-between py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${minimized ? 'px-0 justify-center' : 'px-2'} ${isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
              title={minimized ? group.label : undefined}
            >
              {minimized ? (
                <span className={`text-[10px] font-extrabold truncate w-full text-center tracking-tight leading-tight px-1 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
              <div className={`space-y-0.5 mt-1 ${minimized ? '' : `border-l ml-2 pl-2 ${isLightMode ? 'border-slate-200' : 'border-slate-700/50'}`}`}>
                {group.items.map(({ label, icon: Icon, href, showDot }) => {
                  const active = activePage === href;

                  // Style logic based on active state and theme
                  let itemClasses = '';
                  let iconClasses = '';

                  if (active) {
                    if (isLightMode) {
                      itemClasses = 'bg-brand-teal text-white font-bold shadow-md';
                      iconClasses = 'text-white';
                    } else {
                      itemClasses = 'bg-brand-teal text-white font-bold shadow-md';
                      iconClasses = 'text-white';
                    }
                  } else {
                    if (isLightMode) {
                      itemClasses = 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
                      iconClasses = 'text-slate-400';
                    } else {
                      itemClasses = 'text-slate-400 hover:text-slate-200 hover:bg-white/5';
                      iconClasses = 'text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={href}
                      onClick={() => handleNav(href)}
                      title={minimized ? label : undefined}
                      className={`w-full flex items-center gap-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${minimized ? 'px-0 justify-center' : 'px-3'} ${itemClasses}`}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon className={`w-4 h-4 shrink-0 ${iconClasses}`} />
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
      <div className={`p-4 border-t space-y-2 shrink-0 transition-colors duration-200 ${minimized ? 'px-2 flex flex-col items-center' : ''} ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#131c2f] border-white/5'}`}>
        <button
          onClick={() => handleNav('profile')}
          className={`w-full flex items-center gap-3 py-2 rounded-md transition-colors text-left group ${minimized ? 'justify-center px-0' : 'px-2'} ${isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}
          title={minimized ? "View Profile" : undefined}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={UPLOADS_BASE + user.avatar + '?token=' + token}
                alt="avatar"
                className={`w-8 h-8 rounded-[12px] object-cover border shadow-sm ${isLightMode ? 'border-slate-300' : 'border-slate-600'}`}
              />
            ) : (
              <div className="w-8 h-8 rounded-[12px] bg-[var(--color-brand-green)] flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                {initials}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isLightMode ? 'border-slate-50' : 'border-[#0f172a]'}`}
              style={{ backgroundColor: getStatusColor(user?.statusMode) }}
            />
          </div>
          {!minimized && (
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] font-bold truncate transition-colors ${isLightMode ? 'text-black group-hover:text-brand-teal' : 'text-white group-hover:text-brand-teal'}`}>{user?.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
            </div>
          )}
        </button>
        <button
          onClick={logout}
          title={minimized ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 py-2 rounded-md text-[13px] font-medium transition-colors ${minimized ? 'justify-center px-0' : 'px-2'} ${isLightMode ? 'text-slate-600 hover:text-red-600 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!minimized && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-slate-50' : 'bg-[#0a0f1c]'}`}>

      {/* Top Navigation Bar */}
      <header className={`h-14 flex items-center justify-between px-4 shrink-0 border-b z-20 transition-colors duration-200 relative ${isLightMode ? 'bg-white text-black border-slate-200/50' : 'bg-[#131c2f] text-white border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden transition-colors ${isLightMode ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDesktopMinimized(!desktopMinimized)}
            className={`hidden md:block transition-colors ${isLightMode ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo area */}
          <div className="flex items-center gap-4 group">
            <div className="relative overflow-hidden shrink-0 transition-all duration-300 ease-in-out h-11 max-w-[350px]">
              <img src="/logo.png" alt="Lifed Logo" className="h-full w-auto max-w-none object-left object-cover" />
            </div>
            <span className={`font-semibold text-[17px] uppercase tracking-[0.15em] whitespace-nowrap transition-colors duration-200 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              OPERATIONS
            </span>
          </div>
        </div>

        {/* Global Omni-Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:flex items-center gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search resources, services, and docs"
              className={`w-full text-sm rounded-md pl-9 pr-3 py-1.5 focus:outline-none transition-all ${isLightMode
                  ? 'bg-slate-100 border-transparent focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-slate-900 placeholder-slate-400'
                  : 'bg-slate-800 border-slate-700 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-slate-200 placeholder-slate-500'
                }`}
            />

            {/* Search Dropdown Overlay */}
            {showSearchDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowSearchDropdown(false)}
                />
                <div className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 border ${isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#131c2f] border-white/5 text-slate-300'}`}>
                  
                  {!hasSearchResults && searchQuery ? (
                    <div className="p-4 text-center text-sm font-semibold opacity-70">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      
                      {/* Pages Section */}
                      {pageResults.length > 0 && (
                        <div className="py-2">
                          <div className={`px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isLightMode ? 'text-slate-400 bg-slate-50' : 'text-slate-500 bg-white/5'}`}>
                            Pages & Tabs
                          </div>
                          {pageResults.map((page, idx) => (
                            <button
                              key={`page-${idx}`}
                              onClick={() => handleSearchResultClick(page)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${isLightMode ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                            >
                              <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isLightMode ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
                                <page.icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{page.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Healthmates Section */}
                      {hmResults.length > 0 && (
                        <div className="py-2">
                          <div className={`px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isLightMode ? 'text-slate-400 bg-slate-50' : 'text-slate-500 bg-white/5'}`}>
                            HealthMates (Partners)
                          </div>
                          {hmResults.map((hm, idx) => (
                            <button
                              key={`hm-${idx}`}
                              onClick={() => handleSearchResultClick(hm)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${isLightMode ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                            >
                              <div className="w-6 h-6 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal text-[10px] font-extrabold shrink-0 border border-brand-teal/20">
                                {hm.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'HM'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-bold">{hm.name}</p>
                                <p className={`truncate text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{hm.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Service Users Section */}
                      {suResults.length > 0 && (
                        <div className="py-2">
                          <div className={`px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isLightMode ? 'text-slate-400 bg-slate-50' : 'text-slate-500 bg-white/5'}`}>
                            Service Users
                          </div>
                          {suResults.map((su, idx) => (
                            <button
                              key={`su-${idx}`}
                              onClick={() => handleSearchResultClick(su)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${isLightMode ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-[10px] font-extrabold shrink-0 border border-indigo-500/20">
                                {su.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'SU'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-bold">{su.name}</p>
                                <p className={`truncate text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{su.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {error ? (
            <div className="flex items-center gap-2 text-[10px] font-extrabold bg-red-900/40 border border-red-500/50 text-red-400 px-3 py-1 rounded-full shrink-0 shadow-sm animate-pulse mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
              SERVER DOWN
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 shadow-sm mr-2 hidden sm:flex ${isLightMode ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' : 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLightMode ? 'bg-brand-teal' : 'bg-brand-teal'}`} />
              LIVE
            </div>
          )}

          {/* To-Do List */}
          <button
            onClick={toggleNotes}
            className={`group relative p-1.5 rounded-md transition-colors ${isLightMode
                ? 'text-slate-500 hover:text-brand-teal hover:bg-slate-100'
                : 'text-slate-400 hover:text-brand-teal hover:bg-slate-800'
              }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              To-Do List
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className={`group relative p-1.5 rounded-md transition-colors ${isLightMode
                ? 'text-slate-500 hover:text-brand-teal hover:bg-slate-100'
                : 'text-slate-400 hover:text-brand-teal hover:bg-slate-800'
              }`}
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </span>
          </button>

          <button
            onClick={refreshAll}
            disabled={isLoading}
            className={`group relative p-1.5 rounded-md transition-colors disabled:opacity-50 ${isLightMode
                ? 'text-slate-500 hover:text-brand-teal hover:bg-slate-100'
                : 'text-slate-400 hover:text-brand-teal hover:bg-slate-800'
              }`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Refresh Data
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`group relative p-1.5 rounded-md transition-colors ${showNotifications
                  ? (isLightMode ? 'bg-slate-100 text-black' : 'bg-slate-800 text-white')
                  : (isLightMode ? 'text-slate-500 hover:text-black hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800')
                }`}
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 animate-pulse ${isLightMode ? 'border-white' : 'border-[#0f172a]'}`}></span>
              )}
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Notifications
              </span>
            </button>

            {showNotifications && (
              <>
                {/* Overlay for clicking away */}
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowNotifications(false)}
                />

                {/* Popover Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header */}
                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Support Notifications ({notifications.filter(n => !n.read).length})
                    </span>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className={`text-[10px] font-extrabold transition-colors bg-transparent border-0 cursor-pointer p-0 hover:underline ${isLightMode ? 'text-brand-teal hover:text-brand-teal-hover' : 'text-brand-teal hover:text-brand-teal-hover'}`}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                        No active support tickets. All clear!
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const getPriorityColor = (p) => {
                          switch (p?.toUpperCase()) {
                            case 'HIGH': return 'text-red-500 bg-red-50 border-red-100';
                            case 'MEDIUM': return 'text-amber-500 bg-amber-50 border-amber-100';
                            default: return isLightMode ? 'text-brand-teal bg-brand-teal/10 border-brand-teal/20' : 'text-brand-teal bg-brand-teal/10 border-brand-teal/20';
                          }
                        };

                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 flex flex-col gap-1 hover:bg-slate-50 transition-colors cursor-pointer text-left ${!notif.read ? (isLightMode ? 'bg-brand-teal/5 font-medium' : 'bg-brand-teal/5 font-medium') : ''
                              }`}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              // Navigate based on type
                              if (notif.type === 'SYSTEM') {
                                onNavigate('system_support');
                              } else if (notif.type === 'HEALTHMATE') {
                                onNavigate('healthmate_support');
                              } else {
                                onNavigate('service_user_support');
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">
                                {notif.title}
                              </span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${getPriorityColor(notif.priority)}`}>
                                {notif.priority}
                              </span>
                            </div>
                            <p className={`text-xs text-slate-600 line-clamp-2 ${!notif.read ? 'text-slate-900 font-bold' : ''}`}>
                              {notif.description}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold mt-1">
                              <span>By {notif.raisedBy}</span>
                              <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={`hidden sm:flex items-center gap-2 pl-3 border-l ${isLightMode ? 'border-slate-200' : 'border-slate-700'}`}>
            <span className={`text-[12px] font-semibold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{user?.name}</span>
            <div className={`w-6 h-6 rounded-[12px] text-white flex items-center justify-center text-[10px] font-extrabold ${isLightMode ? 'bg-[var(--color-brand-teal)]' : 'bg-[var(--color-brand-teal)]'}`}>
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
                <button onClick={() => setMobileOpen(false)} className={`transition-colors ${isLightMode ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {SidebarContent({ minimized: false })}
            </aside>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto relative bg-transparent">
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
