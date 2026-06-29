import React, { useState, useEffect } from 'react';
import useOpsStore from '../../store/useOpsStore';
import { 
  Users, Target, CalendarCheck, Wallet, PieChart, 
  MoreHorizontal, ChevronRight, TrendingUp, Clock, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const currentUser = useOpsStore((s) => s.user);
  const [activeKpi, setActiveKpi] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'LOG_BOOK'

  const fetchAdminSummary = useOpsStore((s) => s.fetchAdminSummary);
  const adminMetrics = useOpsStore((s) => s.adminMetrics);
  
  const fetchSessionLogs = useOpsStore((s) => s.fetchSessionLogs);
  const sessionLogs = useOpsStore((s) => s.sessionLogs);

  useEffect(() => {
    fetchAdminSummary();
    fetchSessionLogs();
  }, [fetchAdminSummary, fetchSessionLogs]);

  const stats = adminMetrics || {
    qualifiedLeads: 0,
    totalBookings: 0,
    grossBookingValue: 0,
    lifedCommission: 0
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const kpiData = [
    { id: 'visitors', label: 'Website visitors', value: '0', sub: 'Pending GA4 API', details: 'Organic: 0 | Social: 0 | Referral: 0', icon: Users, badgeColor: 'bg-slate-100 text-slate-600' },
    { id: 'leads', label: 'Qualified leads', value: stats.qualifiedLeads.toString(), sub: 'From Enquiries', details: 'High Intent | Medium Intent | Low Intent', icon: Target, badgeColor: 'bg-orange-100 text-orange-600' },
    { id: 'bookings', label: 'Bookings', value: stats.totalBookings.toString(), sub: 'Total confirmed', details: 'From all service users', icon: CalendarCheck, badgeColor: 'bg-brand-teal/10 text-brand-teal' },
    { id: 'gbv', label: 'Gross booking value', value: formatCurrency(stats.grossBookingValue), sub: 'Total revenue', details: 'Across all programs', icon: Wallet, badgeColor: 'bg-brand-teal/10 text-brand-teal' },
    { id: 'commission', label: 'Lifed commission', value: formatCurrency(stats.lifedCommission), sub: '15% margin', details: 'Net realized income', icon: PieChart, badgeColor: 'bg-slate-100 text-slate-600' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full overflow-y-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-black text-text-main tracking-tight mb-1">Admin Space</h1>
          <p className="text-[13px] font-medium text-text-muted">
            A single operating view for performance metrics and system logs.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-colors ${
              activeTab === 'OVERVIEW' ? 'bg-brand-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('LOG_BOOK')}
            className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'LOG_BOOK' ? 'bg-brand-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Log Book
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <>
          {/* Top 5 Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {kpiData.map((card) => {
            const Icon = card.icon;
            const isActive = activeKpi === card.id;
            return (
              <div 
                key={card.id} 
                onClick={() => setActiveKpi(isActive ? null : card.id)}
                className={`bg-white rounded-[24px] p-5 shadow-sm border cursor-pointer flex flex-col justify-between transition-all group min-h-[140px] ${
                  isActive ? 'border-brand-teal ring-1 ring-brand-teal shadow-md' : 'border-border-leaf hover:border-brand-teal/40 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-brand-teal text-white' : 'bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-brand-teal/10 group-hover:text-brand-teal group-hover:border-transparent'}`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <p className="text-[12px] font-bold text-text-muted mb-1.5">{card.label}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[26px] font-black text-text-main tracking-tight">{card.value}</h3>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${card.badgeColor}`}>
                      {card.sub}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details Pane */}
        {activeKpi && (
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-brand-teal/30 bg-brand-teal/5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand-teal" />
              <h4 className="text-[15px] font-black text-text-main">
                {kpiData.find(k => k.id === activeKpi)?.label} Breakdown
              </h4>
            </div>
            <p className="text-[13px] font-semibold text-text-muted">
              {kpiData.find(k => k.id === activeKpi)?.details}
            </p>
          </div>
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Chart - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-border-leaf p-7 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-text-main font-black text-[18px]">Journey conversion snapshot</h3>
              <p className="text-[13px] font-medium text-text-muted mt-1">Track drop-offs across the booking funnel</p>
            </div>
            <span className="text-[11px] font-black text-brand-teal bg-bg-mint px-3 py-1.5 rounded-lg tracking-wide border border-brand-teal/20">Live Well. For Real.</span>
          </div>
          
          <div className="flex-1 flex items-end gap-3 md:gap-4 h-[280px] mt-4 mb-8">
            {[
              { label: 'Visitors', value: '0', height: '0%' },
              { label: 'Program views', value: '0', height: '0%' },
              { label: 'WhatsApp starts', value: '0', height: '0%' },
              { label: 'Qualified leads', value: '0', height: '0%' },
              { label: 'Bookings', value: '0', height: '0%' },
              { label: 'Reviews', value: '0', height: '0%' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div 
                  className="w-full bg-slate-50 border border-slate-100 rounded-t-2xl flex flex-col items-center justify-end pb-4 transition-all hover:bg-brand-teal/10 hover:border-brand-teal/30 cursor-pointer" 
                  style={{ height: bar.height === '0%' ? '50px' : bar.height }}
                >
                  <p className="font-black text-slate-700 text-lg md:text-xl group-hover:text-brand-teal transition-colors">{bar.value}</p>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 text-center leading-tight px-1 group-hover:text-brand-teal/80 transition-colors">{bar.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 text-[12px] text-text-muted font-medium leading-relaxed border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-slate-500 font-bold">i</span>
            </div>
            <p><span className="font-bold text-text-main">No data available:</span> Accumulate more user journeys to view drop-off points.</p>
          </div>
        </div>

        {/* Strategic Actions */}
        <div className="bg-white rounded-[24px] shadow-sm border border-border-leaf p-7 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-main font-black text-[18px]">Strategic actions</h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">This week</span>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
               <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
                 <Target className="w-6 h-6 text-slate-400" />
               </div>
               <p className="text-[14px] font-bold text-slate-600 mb-1">No actions yet</p>
               <p className="text-[12px] font-medium text-slate-400">Your strategic recommendations will appear here based on weekly performance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Horizontal Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Top audience', data: [] },
          { title: 'Top programs', data: [] },
          { title: 'Top channels', data: [] }
        ].map((block, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-text-main font-black text-[16px]">{block.title}</h3>
              <button className="text-brand-teal hover:bg-brand-teal/10 p-1.5 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {block.data.length > 0 ? (
                <div className="space-y-4">
                  {block.data.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-28 text-[12px] font-bold text-text-muted truncate">{item.name}</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-teal rounded-full transition-all duration-500" style={{ width: item.width }} />
                      </div>
                      <span className="w-8 text-right text-[12px] font-black text-text-main">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[13px] font-bold text-slate-400">Not enough data</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-[18px] font-black text-text-main">User Access Logs</h2>
              <p className="text-[13px] font-medium text-text-muted mt-1">Automatic 7-day retention of login/logout sessions.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-brand-teal" />
              Logs auto-delete after 7 days
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Team Member</th>
                  <th className="py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Login Time</th>
                  <th className="py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Last Active (Logout)</th>
                  <th className="py-4 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.isArray(sessionLogs) && sessionLogs.length > 0 ? (
                  sessionLogs.map((log) => {
                    const loginDate = new Date(log.loginAt);
                    const lastActiveDate = new Date(log.lastActive);
                    const durationMs = lastActiveDate - loginDate;
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-text-main">{log.opsUser?.name}</span>
                            <span className="text-[11px] font-semibold text-slate-400">{log.opsUser?.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                            {log.opsUser?.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[13px] font-semibold text-slate-600">
                            {loginDate.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[13px] font-semibold text-slate-600">
                            {lastActiveDate.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[12px] font-black px-2.5 py-1 rounded-md ${
                            hours > 0 ? 'bg-brand-teal/10 text-brand-teal' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {hours > 0 ? `${hours}h ` : ''}{minutes}m
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-[14px] font-bold text-slate-500">No session logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
