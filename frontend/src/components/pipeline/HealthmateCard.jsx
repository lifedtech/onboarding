import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Tag, User, CalendarDays, MapPin, Sparkles, Plane, Globe } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';

// ─── Type badge config ────────────────────────────────────────────────────────

const TYPE_STYLES = {
  PRACTITIONER:      { label: 'Practitioner',      color: 'text-blue-700 bg-blue-50 border-blue-200/80' },
  CENTRE:            { label: 'Centre',            color: 'text-purple-700 bg-purple-50 border-purple-200/80' },
  ORGANIZER:         { label: 'Organizer',         color: 'text-amber-700 bg-amber-50 border-amber-200/80' },
  COMMUNITY_GROUP:   { label: 'Community Group',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80' },
  PROGRAM_ORGANIZER: { label: 'Program Organizer', color: 'text-amber-700 bg-amber-50 border-amber-200/80' },
  RETREAT_CENTRE:    { label: 'Retreat Centre',    color: 'text-indigo-700 bg-indigo-50 border-indigo-200/80' },
  WELLNESS_CENTRE:   { label: 'Wellness Centre',   color: 'text-teal-700 bg-teal-50 border-teal-200/80' },
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

  // Categories parsing
  const categoriesList = healthmate.category
    ? healthmate.category.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const locationStr = [healthmate.city, healthmate.country].filter(Boolean).join(', ');

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
        select-none touch-none relative overflow-hidden
        transition-all duration-200 shadow-2xs hover:shadow-md
        ${isDragging
          ? 'border-brand-teal shadow-xl shadow-brand-teal/10 opacity-60 scale-105 z-20'
          : 'border-border-leaf/75 hover:border-brand-teal hover:shadow-brand-teal/5 hover:-translate-y-0.5'
        }
      `}
    >
      {/* R&D Credential Status Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          healthmate.registrationStatus === 'VERIFIED'
            ? 'bg-brand-green'
            : healthmate.registrationStatus === 'ESCALATED'
              ? 'bg-red-500 animate-pulse'
              : 'bg-slate-300'
        }`} 
        title={`R&D Credentials: ${healthmate.registrationStatus || 'PENDING'}`} 
      />

      {/* Name + type badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h3 className="text-text-main font-extrabold text-sm leading-snug line-clamp-2 transition-colors group-hover:text-brand-teal">
          {healthmate.name}
        </h3>
        <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Expertise Categories Chips */}
      {categoriesList.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {categoriesList.slice(0, 3).map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[10px] font-bold bg-teal-50/80 text-teal-800 border border-teal-200/60 px-2 py-0.5 rounded-md"
            >
              {cat}
            </span>
          ))}
          {categoriesList.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 self-center">
              +{categoriesList.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Contact Name & Location */}
      <div className="space-y-1 mb-2.5">
        {healthmate.contactName && (
          <div className="flex items-center gap-1.5 text-text-muted text-xs font-semibold">
            <User className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />
            <span className="truncate">{healthmate.contactName}</span>
          </div>
        )}

        {locationStr && (
          <div className="flex items-center gap-1.5 text-text-muted text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate text-slate-600">{locationStr}</span>
          </div>
        )}

        {healthmate.yearsOfExperience && (
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="text-amber-700">{healthmate.yearsOfExperience} yrs experience</span>
          </div>
        )}
      </div>

      {/* Assignee Indicator */}
      <div className="flex items-center gap-2 mb-2 pt-1 border-t border-slate-100">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${healthmate.opsUser?.isOnline ? 'bg-brand-green' : 'bg-red-400'}`}
          title={healthmate.opsUser?.isOnline ? 'Operator Online' : 'Operator Offline'}
        />
        <span className="text-text-muted text-[11px] font-semibold truncate">
          Assigned: <span className="font-extrabold text-text-main">{healthmate.opsUser?.name || 'Unassigned'}</span>
        </span>
      </div>

      {/* Recall Reminder Indicator */}
      {healthmate.recallReminder && (
        <div className="flex items-center gap-2 mb-2 p-1.5 bg-brand-teal/5 border border-brand-teal/10 rounded-xl">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${new Date(healthmate.recallReminder) < new Date() ? 'text-red-500 animate-pulse' : 'text-brand-teal'}`} />
          <span className={`text-[10px] font-bold truncate ${new Date(healthmate.recallReminder) < new Date() ? 'text-red-500 font-extrabold' : 'text-text-muted'}`}>
            Recall: {new Date(healthmate.recallReminder).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Footer: days in phase + task progress */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-leaf/30">
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
