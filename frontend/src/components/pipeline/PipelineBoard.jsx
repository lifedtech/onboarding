import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import HealthmateCard from './HealthmateCard';
import AddHealthmateModal from './AddHealthmateModal';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import { GitBranch, RefreshCw, Plus, Clock } from 'lucide-react';

const PHASES = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];

export default function PipelineBoard() {
  const healthmates           = useOpsStore((s) => s.healthmates);
  const isLoading             = useOpsStore((s) => s.isLoading);
  const fetchHealthmates      = useOpsStore((s) => s.fetchHealthmates);
  const updateHealthmatePhase = useOpsStore((s) => s.updateHealthmatePhase);
  const user                  = useOpsStore((s) => s.user);
  const pendingInboundTakeovers = useOpsStore((s) => s.pendingInboundTakeovers);
  const fetchPendingTakeovers = useOpsStore((s) => s.fetchPendingTakeovers);
  const respondToTakeover     = useOpsStore((s) => s.respondToTakeover);

  // Local copy for optimistic drag-and-drop rendering
  const [localHealthmates, setLocalHealthmates] = useState([]);
  const [activeHealthmate, setActiveHealthmate] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  // Sync local state whenever the store updates
  useEffect(() => {
    setLocalHealthmates(healthmates);
  }, [healthmates]);

  useEffect(() => {
    fetchHealthmates();
    fetchPendingTakeovers();
    const interval = setInterval(() => {
      fetchPendingTakeovers();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchHealthmates, fetchPendingTakeovers]);

  // ── dnd-kit sensors ────────────────────────────────────────────────────────
  // Require 8px movement before drag starts — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getHealthmateById = (id) =>
    localHealthmates.find((hm) => hm.id === id);

  const getPhaseForHealthmate = (id) =>
    localHealthmates.find((hm) => hm.id === id)?.phase;

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = ({ active }) => {
    setActiveHealthmate(getHealthmateById(active.id));
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeId   = active.id;
    const healthmate = getHealthmateById(activeId);
    if (healthmate) {
      const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
      const canModify = isAdmin || (healthmate.opsUserId === user?.id);
      if (!canModify) return;
    }

    const overId     = over.id;
    const activePhase = getPhaseForHealthmate(activeId);

    // Determine the target phase — over could be a column id or a card id
    const targetPhase = PHASES.includes(overId)
      ? overId
      : getPhaseForHealthmate(overId);

    if (!targetPhase || activePhase === targetPhase) return;

    // Gatekeeper check: block optimistic drag over to REVIEW if not verified
    if (targetPhase === 'REVIEW' && healthmate?.registrationStatus !== 'VERIFIED') {
      return;
    }

    // Optimistically move the card to the new column
    setLocalHealthmates((prev) =>
      prev.map((hm) =>
        hm.id === activeId ? { ...hm, phase: targetPhase, daysInPhase: 0 } : hm
      )
    );
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveHealthmate(null);
    if (!over) return;

    const activeId    = active.id;
    const healthmate  = getHealthmateById(activeId);
    if (healthmate) {
      const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
      const canModify = isAdmin || (healthmate.opsUserId === user?.id);
      if (!canModify) {
        toast.error("Access Denied: Only the assigned coordinator or an Admin can move this partner.");
        handleDragCancel();
        return;
      }
    }

    const overId      = over.id;
    const activePhase = getPhaseForHealthmate(activeId);

    const targetPhase = PHASES.includes(overId)
      ? overId
      : getPhaseForHealthmate(overId);

    if (!targetPhase) return;

    // Gatekeeper check: block drop into REVIEW if not verified
    if (targetPhase === 'REVIEW' && healthmate?.registrationStatus !== 'VERIFIED') {
      toast.error("Movement Blocked: Credentials Pending R&D Verification.");
      handleDragCancel();
      return;
    }

    if (activePhase !== targetPhase) {
      // Phase changed — persist to backend (store handles optimistic update too)
      updateHealthmatePhase(activeId, targetPhase);
    } else {
      // Same column reorder — just update local order (cosmetic only, not persisted)
      const columnItems = localHealthmates
        .filter((hm) => hm.phase === activePhase)
        .map((hm) => hm.id);

      const oldIndex = columnItems.indexOf(activeId);
      const newIndex = columnItems.indexOf(overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnItems, oldIndex, newIndex);
        setLocalHealthmates((prev) => {
          const others = prev.filter((hm) => hm.phase !== activePhase);
          const reorderedItems = reordered.map((id) => prev.find((hm) => hm.id === id));
          return [...others, ...reorderedItems];
        });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveHealthmate(null);
    // Reset to store state on cancel
    setLocalHealthmates(healthmates);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalCount = localHealthmates.length;

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/30 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
            <GitBranch className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h1 className="text-text-main font-extrabold text-xl leading-tight tracking-wide">Partner Pipeline</h1>
            <p className="text-text-muted text-xs font-semibold mt-0.5">
              {isLoading ? 'Loading…' : `${totalCount} partner${totalCount !== 1 ? 's' : ''} across all phases`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-4 py-2.5 rounded-xl text-sm font-extrabold shadow-md shadow-brand-teal/10 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
          
          <button
            onClick={fetchHealthmates}
            disabled={isLoading}
            className="flex items-center gap-2 text-text-muted hover:text-brand-teal border border-border-leaf/50 hover:bg-brand-teal/5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Inbound Takeovers Banner */}
      {pendingInboundTakeovers && pendingInboundTakeovers.length > 0 && (
        <div className="px-6 pt-6 shrink-0">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 flex flex-col gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <h3 className="text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                Pending Take Over Requests ({pendingInboundTakeovers.length})
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingInboundTakeovers.map((req) => (
                <div key={req.id} className="bg-white border border-amber-100 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-sm">
                  <div>
                    <p className="text-text-main text-xs font-bold leading-normal">
                      <span className="font-extrabold text-amber-700">{req.requesterName}</span> wants to take over partner <span className="font-extrabold">{req.healthmateName}</span>.
                    </p>
                    <p className="text-[10px] text-text-muted/60 font-semibold mt-1">
                      Requested {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => respondToTakeover(req.id, 'ACCEPTED')}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white text-[11px] font-extrabold py-2 px-3 rounded-lg shadow-sm transition-all"
                    >
                      Accept & Transfer
                    </button>
                    <button
                      onClick={() => respondToTakeover(req.id, 'REJECTED')}
                      className="flex-1 bg-white hover:bg-slate-50 text-text-muted border border-border-leaf/60 text-[11px] font-extrabold py-2 px-3 rounded-lg transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="flex gap-5 p-6 min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {PHASES.map((phase) => (
              <KanbanColumn
                key={phase}
                phase={phase}
                healthmates={localHealthmates.filter((hm) => hm.phase === phase)}
              />
            ))}

            {/* Drag overlay — renders the card under the cursor while dragging */}
            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
              {activeHealthmate ? (
                <div className="rotate-2 opacity-95 shadow-2xl shadow-brand-teal/15">
                  <HealthmateCard healthmate={activeHealthmate} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      {/* Add Partner Modal */}
      <AddHealthmateModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
