import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import HealthmateCard from './HealthmateCard';

// ─── Phase display config ─────────────────────────────────────────────────────

const PHASE_CONFIG = {
  PRE_QUALIFY: {
    label: 'Pre-Qualify',
    number: '01',
    accent: 'border-slate-300 dark:border-slate-600',
    dot: 'bg-slate-400',
    countBg: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
  },
  PREPARE: {
    label: 'Prepare',
    number: '03',
    accent: 'border-amber-400 dark:border-amber-500/50',
    dot: 'bg-amber-500',
    countBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
  },
  REGISTER: {
    label: 'Register',
    number: '02',
    accent: 'border-brand-teal dark:border-brand-teal/50',
    dot: 'bg-brand-teal',
    countBg: 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20 dark:border-brand-teal/30',
  },
  REVIEW: {
    label: 'Review',
    number: '04',
    accent: 'border-purple-400 dark:border-purple-500/50',
    dot: 'bg-purple-500',
    countBg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20',
  },
  LIVE: {
    label: 'Live',
    number: '05',
    accent: 'border-brand-green dark:border-brand-green/50',
    dot: 'bg-brand-green',
    countBg: 'bg-brand-green/10 text-brand-green border border-brand-green/20 dark:border-brand-green/30',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function KanbanColumn({ phase, healthmates }) {
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.PRE_QUALIFY;
  const ids = healthmates.map((hm) => hm.id);

  const { setNodeRef, isOver } = useDroppable({ id: phase });

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-4 px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-white/10 border-b-[3px] ${config.accent}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse ${config.dot}`} />
          <span className="text-text-main font-extrabold text-[15px] tracking-wide">{config.label}</span>
          <span className="text-text-muted/50 text-[10px] font-mono font-bold ml-1">{config.number}</span>
        </div>
        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-sm ${config.countBg}`}>
          {healthmates.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-32 rounded-2xl p-2.5 space-y-3 transition-all duration-200
          ${isOver ? 'bg-bg-mint/40 border border-brand-teal/20 ring-4 ring-brand-teal/5 shadow-inner' : 'bg-transparent'}
        `}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {healthmates.map((hm) => (
            <HealthmateCard key={hm.id} healthmate={hm} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {healthmates.length === 0 && (
          <div className={`
            flex items-center justify-center h-24 rounded-2xl border-2 border-dashed
            text-text-muted/60 text-xs font-bold transition-all duration-200 bg-white/40 dark:bg-slate-800/30 backdrop-blur-sm
            ${isOver ? 'border-brand-teal text-brand-teal bg-white/80 dark:bg-slate-800/80 shadow-sm' : 'border-slate-300/60 dark:border-slate-700'}
          `}>
            {isOver ? 'Drop here' : 'No partners yet'}
          </div>
        )}
      </div>
    </div>
  );
}
