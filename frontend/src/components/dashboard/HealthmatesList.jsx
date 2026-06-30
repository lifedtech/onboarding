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
  Filter
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
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatPhaseName = (phase) => {
    if (!phase) return 'UNKNOWN';
    return phase.replace('_', ' ');
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
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/60">
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
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/60">
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
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200/60">
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm shrink-0">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main rounded-xl py-2.5 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
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
            className="bg-slate-50 border border-slate-200 text-text-main text-[11px] font-bold py-1.5 px-3 rounded-lg focus:outline-none"
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
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h3 className="text-text-main font-extrabold text-sm tracking-wide">Healthmates List</h3>
          <span className="text-[10px] font-bold text-text-muted bg-slate-200/50 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
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
                <tr className="bg-slate-50/30 border-b border-slate-100 text-text-muted text-[10px] font-extrabold uppercase tracking-wider">
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
                  const initials = hm.name
                    ? hm.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
                        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 group-hover:text-brand-teal transition-colors flex items-center gap-1 text-xs font-bold">
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

      {/* Basic Details Modal (View Only) */}
      {viewingHealthmate && (
        <HealthmateModal 
          viewOnlyHealthmate={viewingHealthmate}
          onCloseViewOnly={() => setViewingHealthmate(null)}
        />
      )}
    </div>
  );
}
