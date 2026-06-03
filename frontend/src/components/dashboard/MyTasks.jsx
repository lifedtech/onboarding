import { useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  User,
  Inbox,
  Smile,
  ShieldAlert
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

const PHASE_LABELS = {
  PRE_QUALIFY: 'Pre-Qualify',
  PREPARE:     'Prepare',
  REGISTER:    'Register',
  REVIEW:      'Review',
  LIVE:        'Live',
};

const PHASE_BADGES = {
  PRE_QUALIFY: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  PREPARE:     'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  REGISTER:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
  REVIEW:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  LIVE:        'text-brand-green bg-brand-green/10 border-brand-green/20',
};

export default function MyTasks() {
  const pendingTasks      = useOpsStore((s) => s.pendingTasks);
  const fetchPendingTasks = useOpsStore((s) => s.fetchPendingTasks);
  const toggleTask        = useOpsStore((s) => s.toggleTask);
  const isLoading         = useOpsStore((s) => s.isLoading);
  const user              = useOpsStore((s) => s.user);

  useEffect(() => {
    fetchPendingTasks();
  }, [fetchPendingTasks]);

  const handleToggle = async (healthmateId, taskId) => {
    const task = pendingTasks.find((t) => t.id === taskId);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
    const canModify = isAdmin || (task?.healthmate?.opsUser?.id === user?.id);

    if (!canModify) {
      toast.error("Access Denied: Only the assigned coordinator or an Admin can modify tasks for this partner.");
      return;
    }

    // Optimistically triggers complete (checking item closes it off)
    await toggleTask(healthmateId, taskId, true);
  };

  const totalCount = pendingTasks.length;
  
  // Calculate overdue tasks count (due date in past and completed is false)
  const overdueCount = pendingTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base max-w-7xl mx-auto h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Centralized Checklist</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">Manage outstanding action items across all onboarding pipelines from a single console.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-extrabold bg-red-500/10 border border-red-500/20 text-red-500 px-3.5 py-2 rounded-full shrink-0 shadow-sm animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              {overdueCount} OVERDUE
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-extrabold bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-3.5 py-2 rounded-full shrink-0 shadow-sm">
            <CheckSquare className="w-3.5 h-3.5" />
            {totalCount} PENDING ACTION{totalCount !== 1 ? 'S' : ''}
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Metrics Card */}
        <div className="space-y-6 lg:col-span-1 flex flex-col justify-start">
          {/* Stats Deck 1: Tasks Overdue */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-red-400/80 text-[10px] font-extrabold uppercase tracking-wider">Critical Deadlines</span>
                <p className="text-3xl font-extrabold tracking-tight text-red-400">{overdueCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              Action items past their due dates
            </div>
          </div>

          {/* Stats Deck 2: Caught Up Rate */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-brand-green/80 text-[10px] font-extrabold uppercase tracking-wider">Operational Focus</span>
                <p className="text-lg font-extrabold tracking-tight truncate max-w-[155px]">
                  Checklist Deck
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              Mark tasks complete directly to sync pipelines
            </div>
          </div>
        </div>

        {/* Right Pending Task Aggregation Card */}
        <div className="lg:col-span-3 bg-[#112421] text-white border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0e1d1b]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-white font-extrabold text-sm tracking-wide">Pending Deliverables</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Real-time sync
            </span>
          </div>

          {/* Aggregated List Block */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading && totalCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Clock className="w-8 h-8 text-brand-teal animate-spin" />
                <p className="text-slate-400 text-sm font-semibold">Consolidating pipelines checklist...</p>
              </div>
            ) : totalCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20 animate-bounce">
                  <Smile className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-extrabold text-sm tracking-wide">All Caught Up!</h4>
                  <p className="text-slate-400 text-xs font-semibold">No pending onboarding tasks. Excellent job keeping all partner pipelines in sync!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => {
                  const hasDeadline = !!task.dueDate;
                  const isOverdue = hasDeadline && new Date(task.dueDate) < new Date();
                  const localDate = hasDeadline
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '';

                  return (
                    <div
                      key={task.id}
                      className="bg-[#0e1d1b] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-teal/40 transition-all group"
                    >
                      {/* Checkbox wrapper */}
                      <button
                        onClick={() => handleToggle(task.healthmateId, task.id)}
                        className="w-5 h-5 rounded-lg border border-white/20 hover:border-brand-teal flex items-center justify-center shrink-0 transition-colors bg-white/5 focus:outline-none"
                        aria-label="Complete task"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-brand-teal scale-0 group-hover:scale-100 transition-transform" />
                      </button>

                      {/* Info blocks */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
                        
                        {/* Title and Badge */}
                        <div className="lg:col-span-1 space-y-1">
                          <p className="text-white font-bold text-xs tracking-wide truncate group-hover:text-brand-teal transition-colors">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{task.healthmate?.name}</span>
                          </div>
                        </div>

                        {/* Onboarding Phase */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${PHASE_BADGES[task.phase]}`}>
                            {PHASE_LABELS[task.phase]}
                          </span>
                        </div>

                        {/* Calendar Deadlines */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          {hasDeadline ? (
                            <>
                              <Calendar className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`} />
                              <span className={isOverdue ? 'text-red-400 font-extrabold' : ''}>
                                {isOverdue ? `Overdue: ${localDate}` : `Due: ${localDate}`}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-600 font-semibold italic">No deadline set</span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
