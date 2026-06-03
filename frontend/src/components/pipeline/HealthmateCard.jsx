import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Tag, User, CalendarDays } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';

// ─── Type badge config ────────────────────────────────────────────────────────

const TYPE_STYLES = {
  PRACTITIONER: { label: 'Practitioner', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  CENTRE:       { label: 'Centre',       color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ORGANIZER:    { label: 'Organizer',    color: 'text-amber-700 bg-amber-50 border-amber-100' },
};

const DAYS_COLOR = (days) => {
  if (days <= 7)  return 'text-brand-green';
  if (days <= 14) return 'text-amber-600';
  return 'text-red-500';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthmateCard({ healthmate }) {
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: healthmate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Track whether a drag actually moved so we can distinguish click vs drag
  const dragMoved = useRef(false);

  const handlePointerDown = () => {
    dragMoved.current = false;
  };

  const handlePointerMove = () => {
    dragMoved.current = true;
  };

  // Only open the modal if the pointer didn't move (i.e. it was a tap/click, not a drag)
  const handleClick = () => {
    if (!dragMoved.current) {
      setSelectedHealthmate(healthmate);
    }
  };

  const typeConfig = TYPE_STYLES[healthmate.type] || TYPE_STYLES.PRACTITIONER;
  const taskCount  = healthmate.tasks?.length ?? 0;
  const doneTasks  = healthmate.tasks?.filter((t) => t.completed).length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className={`
        group bg-white border rounded-2xl p-4 cursor-grab active:cursor-grabbing
        select-none touch-none
        transition-all duration-200
        ${isDragging
          ? 'border-brand-teal shadow-xl shadow-brand-teal/10 opacity-60 scale-105 z-20'
          : 'border-border-leaf/75 hover:border-brand-teal hover:shadow-lg hover:shadow-brand-teal/5 hover:-translate-y-0.5'
        }
      `}
    >
      {/* Name + type badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-text-main font-extrabold text-sm leading-snug line-clamp-2 transition-colors group-hover:text-brand-teal">
          {healthmate.name}
        </h3>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />
        <span className="text-text-muted text-xs font-semibold truncate">{healthmate.category}</span>
      </div>

      {/* Contact name if present */}
      {healthmate.contactName && (
        <div className="flex items-center gap-2 mb-2">
          <User className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />
          <span className="text-text-muted text-xs font-semibold truncate">{healthmate.contactName}</span>
        </div>
      )}

      {/* Assignee Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${healthmate.opsUser?.isOnline ? 'bg-brand-green' : 'bg-red-400'}`}
          title={healthmate.opsUser?.isOnline ? 'Operator Online' : 'Operator Offline'}
        />
        <span className="text-text-muted text-xs font-semibold truncate">
          Assigned: <span className="font-extrabold text-text-main">{healthmate.opsUser?.name || 'Unassigned'}</span>
        </span>
      </div>

      {/* Footer: days in phase + task progress */}
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border-leaf/30">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${DAYS_COLOR(healthmate.daysInPhase)}`} />
          <span className={`text-xs font-bold ${DAYS_COLOR(healthmate.daysInPhase)}`}>
            {healthmate.daysInPhase}d in phase
          </span>
        </div>

        {taskCount > 0 && (
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-text-muted/50" />
            <span className="text-text-muted text-xs font-bold">
              {doneTasks}/{taskCount} tasks
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
