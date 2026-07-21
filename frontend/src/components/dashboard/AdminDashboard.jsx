import React, { useState, useEffect } from 'react';
import useOpsStore from '../../store/useOpsStore';
import {  
  Users, Target, CalendarCheck, Wallet, PieChart,
  MoreHorizontal, ChevronRight, TrendingUp, Clock, AlertCircle,
  Download, UserPlus, CheckCircle, Activity, Repeat, HeartPulse, Handshake,
  Globe, Percent, Mail, IndianRupee, LineChart, X
  } from 'lucide-react';

export default function AdminDashboard() {
  const currentUser = useOpsStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'LOG_BOOK'

  const fetchAdminSummary = useOpsStore((s) => s.fetchAdminSummary);
  const adminMetrics = useOpsStore((s) => s.adminMetrics);

  const fetchSessionLogs = useOpsStore((s) => s.fetchSessionLogs);
  const sessionLogs = useOpsStore((s) => s.sessionLogs);

  useEffect(() => {
    fetchAdminSummary();
    fetchSessionLogs();
  }, [fetchAdminSummary, fetchSessionLogs]);

  const stats = {
    qualifiedLeads: adminMetrics?.qualifiedLeads || 0,
    totalBookings: adminMetrics?.totalBookings || 0,
    grossBookingValue: adminMetrics?.grossBookingValue || 0,
    lifedCommission: adminMetrics?.lifedCommission || 0
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent w-full h-full overflow-y-auto">

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-black text-text-main tracking-tight mb-1">Admin Space</h1>
          <p className="text-[13px] font-medium text-text-muted">
            A single operating view for performance metrics and system logs.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-colors ${activeTab === 'OVERVIEW' ? 'bg-brand-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('LOG_BOOK')}
            className={`px-5 py-2 text-[13px] font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'LOG_BOOK' ? 'bg-brand-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Clock className="w-4 h-4" />
            Log Book
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <>
          {/* Top KPIs Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Website Traffic', value: '0', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Total Users', value: '0', icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
              { label: 'Total Booking', value: stats.totalBookings.toString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Gross Revenue', value: formatCurrency(stats.grossBookingValue), icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'CPA', value: '₹0', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'ROAS', value: '0x', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[120px] hover:shadow-md hover:border-brand-teal/30 transition-all cursor-default">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[12px] font-bold text-slate-500 leading-tight">{kpi.label}</p>
                    <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <h3 className="text-[22px] font-black text-slate-800 tracking-tight">{kpi.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Metrics Dashboard */}
          <div className="space-y-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                <LineChart className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="text-[22px] font-black text-slate-800 tracking-tight">Metrics Dashboard</h2>
            </div>

            <div className="space-y-8">
              {/* User Growth */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-brand-teal stroke-[2.5]" />
                  <h3 className="text-[18px] font-bold text-text-main">User Growth</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'App Downloads', value: '0', sub: 'Pending API', icon: Download },
                    { label: 'User Registrations', value: '0', sub: 'Pending API', icon: UserPlus },
                    { label: 'LEWIS Completions', value: '0', sub: 'Pending API', icon: CheckCircle },
                    { label: 'Active Monthly Users', value: '0', sub: 'Pending API', icon: Activity }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[130px] hover:shadow-md hover:border-brand-teal/30 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[13px] font-bold text-slate-500 leading-tight">{item.label}</p>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[24px] font-black text-slate-800 tracking-tight mb-1.5">{item.value}</h3>
                          <span className="text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md">{item.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Business Growth */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-brand-teal stroke-[2.5]" />
                  <h3 className="text-[18px] font-bold text-text-main">Business Growth</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Programme Bookings', value: '0', sub: 'Pending API', icon: CalendarCheck },
                    { label: 'Repeat Bookings', value: '0', sub: 'Pending API', icon: Repeat },
                    { label: 'Healthmate Growth', value: '0', sub: 'Pending API', icon: HeartPulse },
                    { label: 'Partner Conversions', value: '0', sub: 'Pending API', icon: Handshake }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[130px] hover:shadow-md hover:border-brand-teal/30 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[13px] font-bold text-slate-500 leading-tight">{item.label}</p>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[24px] font-black text-slate-800 tracking-tight mb-1.5">{item.value}</h3>
                          <span className="text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md">{item.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marketing ROI */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="w-5 h-5 text-brand-teal stroke-[2.5]" />
                  <h3 className="text-[18px] font-bold text-text-main">Marketing ROI</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Conversion Rate', value: '0%', sub: 'Pending API', icon: Percent },
                    { label: 'CPA & ROAS', value: '0', sub: 'Pending API', icon: TrendingUp },
                    { label: 'Customer LTV', value: '0', sub: 'Pending API', icon: HeartPulse },
                    { label: 'Email & Referral Opt', value: '0', sub: 'Pending API', icon: Mail }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[130px] hover:shadow-md hover:border-brand-teal/30 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[13px] font-bold text-slate-500 leading-tight">{item.label}</p>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[24px] font-black text-slate-800 tracking-tight mb-1.5">{item.value}</h3>
                          <span className="text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-md">{item.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
                      className="w-full bg-slate-50 rounded-t-2xl flex flex-col items-center justify-end pb-4 transition-all hover:bg-brand-teal/10 hover:border-brand-teal/30 cursor-pointer"
                      style={{ height: bar.height === '0%' ? '50px' : bar.height }}
                    >
                      <p className="font-black text-slate-700 text-lg md:text-xl group-hover:text-brand-teal transition-colors">{bar.value}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1.5 text-center leading-tight px-1 group-hover:text-brand-teal/80 transition-colors">{bar.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#e7f0e3] rounded-2xl p-5 text-[12px] text-brand-teal font-medium leading-relaxed border border-[#e7f0e3] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0">
                  <span className="text-brand-teal font-bold">↑</span>
                </div>
                <p><span className="font-bold text-text-main">Healthy conversion:</span> The journey from Visitors to Program views is highly optimized. Consider pushing more Top-of-Funnel traffic.</p>
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
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                    <Target className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-600 mb-1">Boost WhatsApp Starts</p>
                  <p className="text-[12px] font-medium text-slate-400">Add an incentive for users to reach out on WhatsApp to improve the 32% conversion rate from Program Views.</p>
                </div>
              </div>
            </div>
          </div>

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
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-[18px] font-black text-text-main">User Access Logs</h2>
              <p className="text-[13px] font-medium text-text-muted mt-1">Automatic 7-day retention of login/logout sessions.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
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
                          <span className={`text-[12px] font-black px-2.5 py-1 rounded-md ${hours > 0 ? 'bg-brand-teal/10 text-brand-teal' : 'bg-slate-100 text-slate-600'
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
