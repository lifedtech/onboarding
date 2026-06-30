import { useEffect, useState } from 'react';
import { Users, AlertTriangle, TrendingUp, Calendar, Activity, MapPin, MonitorPlay, Target, BarChart2 } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';

export default function ServiceUserDashboard() {
  const serviceUsers = useOpsStore((s) => s.serviceUsers);
  const fetchServiceUsers = useOpsStore((s) => s.fetchServiceUsers);
  const isLoading = useOpsStore((s) => s.isLoading);

  useEffect(() => {
    fetchServiceUsers();
  }, [fetchServiceUsers]);

  if (isLoading && serviceUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-3 bg-slate-50/50">
        <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Loading Service Users...</p>
      </div>
    );
  }

  // Calculate some basic mock metrics
  const totalUsers = serviceUsers.length;
  const activeEnquiries = serviceUsers.filter(u => u.enquiries && u.enquiries.length > 0).length;
  const newThisWeek = Math.floor(totalUsers * 0.1) || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-text-main font-black text-2xl tracking-tight">Service Users Dashboard</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">Analytics and overview for registered clients.</p>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
        
        {/* OVERVIEW SECTION */}
        <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-white border border-border-leaf shadow-sm rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px] hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-text-muted text-[10px] font-extrabold uppercase tracking-wider">Total Registered Users</span>
                    <p className="text-[26px] font-black text-text-main tracking-tight">{totalUsers}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-4 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                  <span>Active accounts on platform</span>
                </div>
              </div>

              {/* Active Enquiries */}
              <div className="bg-white border border-border-leaf shadow-sm rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px] hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-text-muted text-[10px] font-extrabold uppercase tracking-wider">Active Enquiries</span>
                    <p className="text-[26px] font-black text-text-main tracking-tight">{activeEnquiries}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-4">
                  Pending response
                </div>
              </div>

              {/* New Signups */}
              <div className="bg-white border border-border-leaf shadow-sm rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px] hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-text-muted text-[10px] font-extrabold uppercase tracking-wider">New This Week</span>
                    <p className="text-[26px] font-black text-text-main tracking-tight">{newThisWeek}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-4 flex items-center gap-1">
                  <span>Recent registrations</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border-leaf rounded-[24px] shadow-sm p-7">
              <h2 className="text-lg font-black text-text-main mb-6">Recent Service Users</h2>
              {serviceUsers.length === 0 ? (
                <p className="text-text-muted text-sm font-medium">No service users found.</p>
              ) : (
                <div className="space-y-2">
                  {serviceUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="flex justify-between items-center p-4 hover:bg-slate-50 border border-transparent hover:border-border-leaf/50 transition-all rounded-[16px]">
                      <div>
                        <p className="font-bold text-sm text-text-main">{user.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                      </div>
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        {/* ACTIVITY SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-border-leaf rounded-[24px] shadow-sm p-7 min-h-[300px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-black text-text-main flex items-center gap-2">
                   <Activity className="w-5 h-5 text-brand-teal" />
                   Login Frequency (Last 7 Days)
                 </h2>
                 <span className="text-xs font-black text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-lg">+14% vs last week</span>
               </div>
               
               {/* Mock Bar Chart */}
               <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 pt-10 pb-2">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                   return (
                     <div key={day} className="flex flex-col items-center gap-3 flex-1 group">
                       <div className="w-full bg-slate-100 rounded-t-[12px] relative flex items-end justify-center" style={{ height: '200px' }}>
                          <div 
                            className="w-full bg-brand-teal/80 group-hover:bg-brand-teal transition-all rounded-t-[12px]" 
                            style={{ height: '0%' }}
                          />
                          {/* Tooltip */}
                          <div className="absolute -top-10 bg-text-main text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            0 Logins
                          </div>
                       </div>
                       <span className="text-[11px] font-bold text-slate-400 group-hover:text-text-main uppercase tracking-wider">{day}</span>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="bg-white border border-border-leaf rounded-[24px] shadow-sm p-7 space-y-8">
              <h2 className="text-lg font-black text-text-main flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-purple-500" />
                Feature Usage
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'Booking System', percent: 0, color: 'bg-brand-teal' },
                  { label: 'Chat Support', percent: 0, color: 'bg-amber-500' },
                  { label: 'Profile Updates', percent: 0, color: 'bg-purple-500' },
                  { label: 'Article Reads', percent: 0, color: 'bg-brand-green' }
                ].map(stat => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-main">
                      <span>{stat.label}</span>
                      <span>{stat.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* DEMOGRAPHICS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age Distribution */}
            <div className="bg-white border border-border-leaf rounded-[24px] shadow-sm p-7 flex flex-col">
              <h2 className="text-lg font-black text-text-main flex items-center gap-2 mb-8">
                <Target className="w-5 h-5 text-amber-500" />
                Age Distribution
              </h2>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {[
                  { range: '18 - 24', pct: 0 },
                  { range: '25 - 34', pct: 0 },
                  { range: '35 - 44', pct: 0 },
                  { range: '45 - 54', pct: 0 },
                  { range: '55+', pct: 0 }
                ].map(age => (
                  <div key={age.range} className="flex items-center gap-4 group">
                    <span className="w-16 text-xs font-bold text-slate-500 group-hover:text-text-main">{age.range}</span>
                    <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-brand-teal/80 group-hover:bg-brand-teal h-full transition-all duration-700" style={{ width: `${age.pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs font-black text-text-main">{age.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white border border-border-leaf rounded-[24px] shadow-sm p-7">
              <h2 className="text-lg font-black text-text-main flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-brand-green" />
                Top Countries
              </h2>
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center py-10">
                  <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </span>
                  <p className="text-xs font-bold text-slate-400 text-center">Data will populate here<br/>as users register.</p>
                </div>
              </div>
            </div>

            {/* Top Cities */}
            <div className="bg-white border border-border-leaf rounded-[24px] shadow-sm p-7">
              <h2 className="text-lg font-black text-text-main flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-brand-teal" />
                Top Cities
              </h2>
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center py-10">
                  <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </span>
                  <p className="text-xs font-bold text-slate-400 text-center">Data will populate here<br/>as users register.</p>
                </div>
              </div>
            </div>
          </div>

      </div>
    </div>
  );
}
