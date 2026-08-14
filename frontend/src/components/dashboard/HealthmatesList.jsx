import React, { useEffect, useState } from 'react';
import {  
  Users,
  Search,
  ChevronRight,
  Mail,
  Phone,
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
  User,
  Tag
  } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import HealthmateModal from '../pipeline/HealthmateModal';

export default function HealthmatesList() {
  const healthmates = useOpsStore((s) => s.healthmates);
  const fetchHealthmates = useOpsStore((s) => s.fetchHealthmates);
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);
  const isLoading = useOpsStore((s) => s.isLoading);
  const user = useOpsStore((s) => s.user);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const scopes = user?.accessScopes || [];
  const hasFullAccess = isAdmin || scopes.includes('FULL_ACCESS');
  const isMarketingOnly = !hasFullAccess && !scopes.includes('HEALTHMATES') && scopes.includes('SALES_MARKETING');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState('ALL');
  const [viewingHealthmate, setViewingHealthmate] = useState(null);

  useEffect(() => {
    fetchHealthmates();
  }, [fetchHealthmates]);

  const filteredHealthmates = healthmates.filter((hm) => {
    const matchesSearch =
      hm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hm.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hm.contactPhone && hm.contactPhone.includes(searchQuery));
    
    const matchesPhase = filterPhase === 'ALL' || hm.phase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  const totalHealthmates = healthmates.length;
  const liveHealthmates = healthmates.filter(hm => hm.phase === 'LIVE').length;
  const pendingReview = healthmates.filter(hm => hm.phase === 'REVIEW').length;

  const getPhaseBadge = (phase) => {
    switch (phase) {
      case 'LIVE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'REVIEW':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'REGISTER':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PREPARE':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'PRE_QUALIFY':
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const formatPhaseName = (phase) => {
    if (!phase || typeof phase !== 'string') return 'UNKNOWN';
    return phase.replace(/_/g, ' ');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-teal" /> Healthmates Registry
          </h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            View and manage Healthmates currently active in the onboarding pipeline.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        {/* Card 1: Total Pipeline */}
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Total in Pipeline</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{totalHealthmates}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Healthmates enrolled</p>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Pending Review</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{pendingReview}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Awaiting final approval</p>
          </div>
        </div>

        {/* Card 3: Live */}
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Live & Active</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{liveHealthmates}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Successfully onboarded</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 shrink-0">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-slate-50 border border-slate-200/60 focus:border-brand-teal/80 text-text-main rounded-xl py-2.5 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-brand-teal" /> Phase:
          </span>
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="bg-slate-50 border border-slate-200/60 text-text-main text-[11px] font-bold py-1.5 px-3 rounded-lg focus:outline-none"
          >
            <option value="ALL">All Phases</option>
            <option value="PRE_QUALIFY">Pre-Qualify</option>
            <option value="PREPARE">Prepare</option>
            <option value="REGISTER">Register</option>
            <option value="REVIEW">Review</option>
            <option value="LIVE">Live</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h3 className="text-text-main font-extrabold text-sm tracking-wide">Healthmates List</h3>
          <span className="text-[10px] font-bold text-text-muted bg-slate-200/50/80 px-2.5 py-0.5 rounded-full">
            {filteredHealthmates.length} found
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          {isLoading && healthmates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Clock className="w-8 h-8 text-brand-teal animate-spin" />
              <p className="text-slate-400 text-sm font-semibold">Loading Healthmates...</p>
            </div>
          ) : filteredHealthmates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Users className="w-8 h-8 text-slate-300" />
              <p className="text-slate-400 text-sm font-semibold">No healthmates match your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Healthmate Profile</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Pipeline Phase</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4">Days in Phase</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHealthmates.map((hm) => {
                  const initials = hm.name && typeof hm.name === 'string'
                    ? hm.name.trim().split(/\s+/).map((n) => n ? n[0] : '').filter(Boolean).join('').toUpperCase().slice(0, 2)
                    : 'HM';

                  return (
                    <tr
                      key={hm.id}
                      onClick={() => setViewingHealthmate(hm)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal text-[10px] font-extrabold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-text-main font-bold text-xs group-hover:text-brand-teal transition-colors">{hm.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">{hm.type?.toLowerCase() || 'Healthmate'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-text-muted font-semibold">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {isMarketingOnly ? '***@***.***' : (hm.contactEmail || '—')}</span>
                          {hm.contactPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {isMarketingOnly ? '+** **** ****' : hm.contactPhone}</span>}
                        </div>
                      </td>

                      {/* Phase / Onboarding Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${getPhaseBadge(hm.phase)}`}>
                          {formatPhaseName(hm.phase)}
                        </span>
                      </td>

                      {/* Registration Status */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-text-main">
                          {hm.registrationStatus === 'VERIFIED' ? (
                            <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified</>
                          ) : (
                            <><Clock className="w-3.5 h-3.5 text-amber-500" /> Pending</>
                          )}
                        </span>
                      </td>

                      {/* Days in Phase */}
                      <td className="px-6 py-4">
                        <span className="text-text-main text-xs font-bold">{hm.daysInPhase || 0} days</span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingHealthmate(hm);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 group-hover:text-brand-teal transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Clean Read-Only Profile & Pipeline Status Modal */}
      {viewingHealthmate && (
        <HealthmateProfileViewModal
          healthmate={viewingHealthmate}
          onClose={() => setViewingHealthmate(null)}
        />
      )}
    </div>
  );
}

// ─── READ-ONLY HEALTHMATE PROFILE & PIPELINE STATUS MODAL ──────────────────────

function HealthmateProfileViewModal({ healthmate, onClose }) {
  if (!healthmate) return null;

  const PHASES = [
    { key: 'PRE_QUALIFY', label: 'Pre-Qualify', step: 1 },
    { key: 'REGISTER', label: 'Register', step: 2 },
    { key: 'PREPARE', label: 'Prepare', step: 3 },
    { key: 'REVIEW', label: 'Review', step: 4 },
    { key: 'LIVE', label: 'Go Live', step: 5 },
  ];

  const currentIdx = PHASES.findIndex(p => p.key === healthmate.phase);
  const initials = healthmate.name && typeof healthmate.name === 'string'
    ? healthmate.name.trim().split(/\s+/).map(n => n ? n[0] : '').filter(Boolean).join('').toUpperCase().slice(0, 2)
    : 'HM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 text-text-main dark:text-white p-6 flex items-start justify-between shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-brand-teal text-base font-extrabold shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl font-extrabold tracking-tight text-text-main dark:text-white">{healthmate.name}</h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-teal-50 dark:bg-teal-950/60 text-brand-teal border border-teal-200 dark:border-teal-800">
                  {healthmate.type || 'Healthmate'}
                </span>
              </div>
              <p className="text-xs text-text-muted dark:text-slate-400 font-semibold">
                {healthmate.category || 'Wellbeing Partner'} · {[healthmate.city, healthmate.state, healthmate.country].filter(Boolean).join(', ') || 'Location Pending'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* PIPELINE PROGRESS TRACKER */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-teal" /> Onboarding Pipeline Stage
              </span>
              <span className="text-xs font-extrabold text-brand-teal bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                {healthmate.daysInPhase || 0} {healthmate.daysInPhase === 1 ? 'day' : 'days'} in {PHASES[currentIdx]?.label || 'phase'}
              </span>
            </div>

            {/* Stepper Nodes */}
            <div className="relative px-2 pt-1 pb-2">
              {/* Connecting Line (centered vertically at top-[16px]) */}
              <div className="absolute left-8 right-8 top-[16px] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
              
              <div className="relative z-10 flex items-center justify-between">
                {PHASES.map((p, idx) => {
                  const isCurrent = p.key === healthmate.phase;
                  const isPassed = currentIdx !== -1 && idx < currentIdx;

                  return (
                    <div key={p.key} className="flex flex-col items-center text-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent 
                          ? 'bg-brand-teal text-white border-brand-teal ring-4 ring-brand-teal/20 scale-110 shadow-md' 
                          : isPassed 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-600'
                      }`}>
                        {isPassed || (isCurrent && p.key === 'LIVE') ? (
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          p.step
                        )}
                      </div>
                      <span className={`text-[11px] font-extrabold mt-2.5 ${
                        isCurrent ? 'text-brand-teal scale-105' : isPassed ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                      }`}>
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTACT & REGISTRATION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Contact Details */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted dark:text-slate-400 block">
                Contact Information
              </span>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{healthmate.contactEmail || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{healthmate.contactPhone || '—'}</span>
              </div>
              {healthmate.alternatePhone && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Alt: {healthmate.alternatePhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Assignee: <span className="text-brand-teal">{healthmate.opsUser?.name || 'Unassigned'}</span></span>
              </div>
            </div>

            {/* Registration & R&D Status */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted dark:text-slate-400 block">
                Registration & Credentials
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${healthmate.registrationStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span className={`text-xs font-extrabold uppercase tracking-wider ${healthmate.registrationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {healthmate.registrationStatus || 'PENDING'}
                </span>
              </div>
              {healthmate.registrationRemark && (
                <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  "{healthmate.registrationRemark}"
                </p>
              )}
              {healthmate.programTitle && (
                <div className="pt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  Program: <span className="text-brand-teal font-extrabold">{healthmate.programTitle}</span>
                </div>
              )}
            </div>

          </div>

          {/* NOTES & SCREENING */}
          {(healthmate.notes || healthmate.screeningRemarks) && (
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              {healthmate.notes && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted dark:text-slate-400 block mb-1.5">
                    Internal Notes
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {healthmate.notes}
                  </p>
                </div>
              )}
              {healthmate.screeningRemarks && (
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted dark:text-slate-400 block mb-1.5">
                    Screening Call Remarks
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {healthmate.screeningRemarks}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-50 text-text-main border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
