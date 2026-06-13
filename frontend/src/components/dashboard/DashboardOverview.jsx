import { useEffect, useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Zap
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';

const PHASE_LABELS = {
  PRE_QUALIFY: 'Pre-Qualify',
  PREPARE:     'Prepare',
  REGISTER:    'Register',
  REVIEW:      'Review',
  LIVE:        'Live',
};

const PHASE_COLORS = {
  PRE_QUALIFY: 'text-slate-600 bg-slate-100 border-slate-200/50',
  PREPARE:     'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  REGISTER:    'text-amber-700 bg-amber-50 border-amber-200/50',
  REVIEW:      'text-purple-700 bg-purple-50 border-purple-200/50',
  LIVE:        'text-brand-green bg-brand-green/10 border-brand-green/20',
};

const TYPE_LABELS = {
  PRACTITIONER: 'Practitioner',
  CENTRE:       'Centre',
  ORGANIZER:    'Organizer',
};

export default function DashboardOverview() {
  const fetchSummaryMetrics = useOpsStore((s) => s.fetchSummaryMetrics);
  const summaryMetrics     = useOpsStore((s) => s.summaryMetrics);
  const recentActivity     = useOpsStore((s) => s.recentActivity);
  const isLoading          = useOpsStore((s) => s.isLoading);
  const error              = useOpsStore((s) => s.error);
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);
  const healthmates        = useOpsStore((s) => s.healthmates);
  const fetchHealthmates   = useOpsStore((s) => s.fetchHealthmates);
  const user               = useOpsStore((s) => s.user);

  const [dashboardTab, setDashboardTab] = useState('activity'); // 'activity' | 'recalls'

  useEffect(() => {
    fetchSummaryMetrics();
    fetchHealthmates();
  }, [fetchSummaryMetrics, fetchHealthmates]);

  if (isLoading && !summaryMetrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-3 bg-bg-base">
        <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Hydrating metrics log…</p>
      </div>
    );
  }

  const stats = summaryMetrics ?? {
    totalHealthmates: 0,
    phaseBreakdown: {},
    bottleneck: { phase: 'None', avgDays: 0 },
    taskCompletionRate: 0,
    actionRequiredCount: 0,
  };

  // Filter active recall reminders for this user (or all if admin)
  const isUserAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const myRecalls = healthmates.filter(
    (hm) =>
      hm.recallReminder &&
      (isUserAdmin || hm.opsUserId === user?.id)
  );

  // Sort recalls chronologically
  const sortedRecalls = [...myRecalls].sort(
    (a, b) => new Date(a.recallReminder) - new Date(b.recallReminder)
  );

  const activeRecallsCount = sortedRecalls.length;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base max-w-7xl mx-auto overflow-auto flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Onboarding Dashboard</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">Real-time operational health and partner pipeline metrics.</p>
        </div>
        {error ? (
          <div className="flex items-center gap-2 text-xs font-extrabold bg-red-500/10 border border-red-500/20 text-red-500 px-3.5 py-2 rounded-full shrink-0 shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
            SERVER DOWN
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-extrabold bg-red-500/10 border border-red-500/20 text-red-500 px-3.5 py-2 rounded-full shrink-0 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            LIVE
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Onboarding Partners */}
        <div className="bg-[#112421] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-brand-teal/80 text-[10px] font-extrabold uppercase tracking-wider">Total Onboarding Partners</span>
              <p className="text-3xl font-extrabold tracking-tight">{stats.totalHealthmates}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
            <span>Active registered pipelines</span>
          </div>
        </div>

        {/* Card 2: Bottleneck Alert */}
        <div className="bg-[#112421] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-amber-500/80 text-[10px] font-extrabold uppercase tracking-wider">Onboarding Bottleneck</span>
              <p className="text-xl font-extrabold tracking-tight truncate max-w-[160px]">
                {PHASE_LABELS[stats.bottleneck.phase] ?? stats.bottleneck.phase}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-4">
            <span className="text-amber-400 font-extrabold">{stats.bottleneck.avgDays}d</span> avg age in phase
          </div>
        </div>

        {/* Card 3: Task Completion Progress */}
        <div className="bg-[#112421] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-brand-green/80 text-[10px] font-extrabold uppercase tracking-wider">Overall Task Progress</span>
              <p className="text-3xl font-extrabold tracking-tight">{stats.taskCompletionRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform shrink-0 shadow-inner">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-brand-green rounded-full transition-all duration-500"
                style={{ width: `${stats.taskCompletionRate}%` }}
              />
            </div>
            <span className="block text-[9px] font-bold text-slate-400">Total checklist completed items</span>
          </div>
        </div>

        {/* Card 4: Action Required */}
        <div className="bg-[#112421] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-red-400/80 text-[10px] font-extrabold uppercase tracking-wider">Action Required</span>
              <p className="text-3xl font-extrabold tracking-tight text-red-400">{stats.actionRequiredCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-4 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Partners with overdue tasks</span>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-border-leaf/30 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border-leaf/25 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setDashboardTab('activity')}
                className={`pb-1 text-sm font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'activity'
                    ? 'border-brand-teal text-brand-teal'
                    : 'border-transparent text-text-muted/60 hover:text-text-main'
                }`}
              >
                <Briefcase className="w-4 h-4 text-brand-teal" />
                Recent Activity Log
              </button>
              <button
                onClick={() => setDashboardTab('recalls')}
                className={`pb-1 text-sm font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  dashboardTab === 'recalls'
                    ? 'border-brand-teal text-brand-teal'
                    : 'border-transparent text-text-muted/60 hover:text-text-main'
                }`}
              >
                <Clock className="w-4 h-4 text-brand-teal" />
                Recall Reminders
                {activeRecallsCount > 0 && (
                  <span className="bg-brand-teal text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold leading-none">
                    {activeRecallsCount}
                  </span>
                )}
              </button>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-slate-50 border border-border-leaf/50 px-2 py-0.5 rounded-full hidden sm:inline">
              {dashboardTab === 'activity' 
                ? 'Latest 5 active' 
                : `${activeRecallsCount} active reminder(s)`}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {dashboardTab === 'activity' ? (
              recentActivity.length === 0 ? (
                <div className="flex items-center justify-center h-56">
                  <p className="text-text-muted/50 text-sm font-semibold">No recent partner activity recorded.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border-leaf/30 text-text-muted text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Partner Name</th>
                      <th className="px-6 py-3.5">Phase</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-leaf/25">
                    {recentActivity.map((hm) => {
                      const localDate = new Date(hm.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr
                          key={hm.id}
                          onClick={() => setSelectedHealthmate(hm)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          {/* Name */}
                          <td className="px-6 py-4">
                            <span className="text-text-main font-extrabold text-xs group-hover:text-brand-teal transition-colors">
                              {hm.name}
                            </span>
                          </td>
                          {/* Phase */}
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${PHASE_COLORS[hm.phase]}`}>
                              {PHASE_LABELS[hm.phase]}
                            </span>
                          </td>
                          {/* Type */}
                          <td className="px-6 py-4">
                            <span className="text-text-muted text-xs font-semibold">
                              {TYPE_LABELS[hm.type] ?? hm.type}
                            </span>
                          </td>
                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="text-text-muted text-xs font-semibold">
                              {hm.category}
                            </span>
                          </td>
                          {/* Last Updated */}
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-text-muted/80 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {localDate}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              sortedRecalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-text-muted/50 text-sm font-semibold">No active recall reminders set.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border-leaf/30 text-text-muted text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Partner Name</th>
                      <th className="px-6 py-3.5">Recall Date & Time</th>
                      <th className="px-6 py-3.5">Remarks / Notes Preview</th>
                      <th className="px-6 py-3.5">Onboarding Phase</th>
                      {isUserAdmin && <th className="px-6 py-3.5">Assignee</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-leaf/25">
                    {sortedRecalls.map((hm) => {
                      const isOverdue = new Date(hm.recallReminder) < new Date();
                      const localDate = new Date(hm.recallReminder).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const remarksPreview = hm.screeningRemarks || hm.notes || '—';

                      return (
                        <tr
                          key={hm.id}
                          onClick={() => setSelectedHealthmate(hm)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          {/* Name */}
                          <td className="px-6 py-4">
                            <span className="text-text-main font-extrabold text-xs group-hover:text-brand-teal transition-colors">
                              {hm.name}
                            </span>
                          </td>
                          {/* Recall Reminder Date */}
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${isOverdue ? 'text-red-500 font-extrabold' : 'text-text-muted'}`}>
                              <Clock className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-brand-teal'}`} />
                              {localDate}
                              {isOverdue && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-black">OVERDUE</span>}
                            </span>
                          </td>
                          {/* Remarks Preview */}
                          <td className="px-6 py-4 max-w-[200px] truncate">
                            <span className="text-text-muted text-xs font-semibold">
                              {remarksPreview}
                            </span>
                          </td>
                          {/* Phase */}
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${PHASE_COLORS[hm.phase]}`}>
                              {PHASE_LABELS[hm.phase]}
                            </span>
                          </td>
                          {/* Assignee if Admin */}
                          {isUserAdmin && (
                            <td className="px-6 py-4">
                              <span className="text-text-muted text-xs font-semibold">
                                {hm.opsUser?.name || 'Unassigned'}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

        {/* Right Column: Pipeline Breakdown & Stress Buster (1 Col) */}
        <div className="space-y-6 flex flex-col justify-start">
          {/* Operational Pipeline Status breakdown */}
          <div className="bg-white border border-border-leaf/30 rounded-3xl shadow-sm p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-text-main font-extrabold text-sm tracking-wide">Pipeline Breakdown</h3>
              </div>
              
              <div className="space-y-3.5">
                {Object.keys(PHASE_LABELS).map((phase) => {
                  const count = stats.phaseBreakdown[phase] || 0;
                  const percentage = stats.totalHealthmates > 0
                    ? Math.round((count / stats.totalHealthmates) * 100)
                    : 0;

                  const indicatorColor = {
                    PRE_QUALIFY: 'bg-slate-400',
                    PREPARE:     'bg-brand-teal',
                    REGISTER:    'bg-amber-500',
                    REVIEW:      'bg-purple-500',
                    LIVE:        'bg-brand-green',
                  }[phase];

                  return (
                    <div key={phase} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-text-main">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
                          <span>{PHASE_LABELS[phase]}</span>
                        </div>
                        <span className="text-text-muted">{count} partner{count !== 1 ? 's' : ''} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-50 border border-slate-200/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${indicatorColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border-leaf/30 shrink-0">
              <span className="text-[10px] font-bold text-text-muted block">
                Want to manage listings?
              </span>
              <button
                onClick={() => {
                  // Navigate to pipeline board
                  const layout = document.querySelector('nav button:nth-child(2)');
                  if (layout) layout.click();
                }}
                className="mt-2 w-full bg-slate-50 border border-border-leaf/80 hover:bg-slate-100 hover:border-brand-teal text-text-main font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                Open Pipeline Board
                <ArrowRight className="w-3.5 h-3.5 text-brand-teal" />
              </button>
            </div>
          </div>

          {/* Stress Buster Mini-game widget */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-brand-teal/80 text-[10px] font-extrabold uppercase tracking-wider">Stress-Buster Break</span>
                <h3 className="text-white font-extrabold text-sm tracking-wide mt-1">Ticket Deflector</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <TrendingUp className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
              Feeling overwhelmed by onboarding checkouts? Take a quick 60-second deflector run to clear your head!
            </p>
            <div className="pt-4 border-t border-white/5 shrink-0 mt-4">
              <button
                onClick={() => {
                  window.__initialStressBusterTab = 'deflector';
                  const btn = Array.from(document.querySelectorAll('nav button')).find(el => el.textContent.includes('Stress Buster'));
                  if (btn) btn.click();
                }}
                className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10 hover:shadow-lg"
              >
                Launch Ticket Deflector
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Tug of War Mini-game widget */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[145px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-brand-teal/80 text-[10px] font-extrabold uppercase tracking-wider">Stress-Buster Break</span>
                <h3 className="text-white font-extrabold text-sm tracking-wide mt-1">Server Tug of War</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
              Relentless traffic is crashing server health! Mash spacebar or click rapidly to stabilize the SLA.
            </p>
            <div className="pt-4 border-t border-white/5 shrink-0 mt-4">
              <button
                onClick={() => {
                  window.__initialStressBusterTab = 'tug_of_war';
                  const btn = Array.from(document.querySelectorAll('nav button')).find(el => el.textContent.includes('Stress Buster'));
                  if (btn) btn.click();
                }}
                className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10 hover:shadow-lg"
              >
                Launch Tug of War
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
