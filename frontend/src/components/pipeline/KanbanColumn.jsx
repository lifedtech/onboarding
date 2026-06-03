import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import HealthmateCard from './HealthmateCard';

// ─── Phase display config ─────────────────────────────────────────────────────

const PHASE_CONFIG = {
  PRE_QUALIFY: {
    label:    'Pre-Qualify',
    number:   '01',
    accent:   'border-slate-200',
    dot:      'bg-slate-400',
    countBg:  'bg-slate-100 text-slate-600 border border-slate-200',
  },
  PREPARE: {
    label:    'Prepare',
    number:   '02',
    accent:   'border-brand-teal/30',
    dot:      'bg-brand-teal',
    countBg:  'bg-brand-teal/10 text-brand-teal border border-brand-teal/20',
  },
  REGISTER: {
    label:    'Register',
    number:   '03',
    accent:   'border-amber-200',
    dot:      'bg-amber-500',
    countBg:  'bg-amber-50 text-amber-600 border border-amber-200',
  },
  REVIEW: {
    label:    'Review',
    number:   '04',
    accent:   'border-purple-200',
    dot:      'bg-purple-500',
    countBg:  'bg-purple-50 text-purple-600 border border-purple-200',
  },
  LIVE: {
    label:    'Live',
    number:   '05',
    accent:   'border-brand-green/30',
    dot:      'bg-brand-green',
    countBg:  'bg-brand-green/10 text-brand-green border border-brand-green/20',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function KanbanColumn({ phase, healthmates }) {
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.PRE_QUALIFY;
  const ids    = healthmates.map((hm) => hm.id);

  const { setNodeRef, isOver } = useDroppable({ id: phase });

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${config.accent}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse ${config.dot}`} />
          <span className="text-text-main font-extrabold text-sm tracking-wide">{config.label}</span>
          <span className="text-text-muted/40 text-xs font-mono font-bold">{config.number}</span>
        </div>
        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${config.countBg}`}>
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
            flex items-center justify-center h-24 rounded-xl border border-dashed
            text-text-muted/50 text-xs font-semibold transition-all duration-200
            ${isOver ? 'border-brand-teal text-brand-teal bg-white/80 shadow-sm' : 'border-border-leaf/80'}
          `}>
            {isOver ? 'Drop here' : 'No partners'}
          </div>
        )}
      </div>
    </div>
  );
}
