import { useEffect, useState } from 'react';
import {
  Wrench,
  RefreshCw,
  Clock
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function SupportDashboard() {
  const currentUser = useOpsStore((s) => s.user);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const teamMembersRaw = useOpsStore((s) => s.teamMembers);
  const teamMembers = Array.isArray(teamMembersRaw) ? teamMembersRaw : [];
  const fetchTeamMembers = useOpsStore((s) => s.fetchTeamMembers);
  const healthmates = useOpsStore((s) => s.healthmates);
  const fetchHealthmates = useOpsStore((s) => s.fetchHealthmates);
  const updateHealthmate = useOpsStore((s) => s.updateHealthmate);

  const [refreshing, setRefreshing] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const handleAssign = async (healthmateId, opsUserId) => {
    setAssigningId(healthmateId);
    await updateHealthmate(healthmateId, { opsUserId });
    setAssigningId(null);
  };
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTeamMembers();
    if (isAdmin) {
      await fetchHealthmates();
    }
    setRefreshing(false);
  };

  // Load team members and healthmates for admin reference
  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
      fetchHealthmates();
      const interval = setInterval(() => {
        fetchTeamMembers();
        fetchHealthmates();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchTeamMembers, fetchHealthmates]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-white">
        <p className="font-bold text-lg text-red-400">Access Denied</p>
        <p className="text-sm text-slate-400 mt-2">Only administrators can access the Task Manager.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Task Manager</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            Manually route and assign newly added partner enquiries to active, online operational staff.
          </p>
        </div>
      </div>

      {/* Manual Partner Assignment Workspace */}
      <div className="flex-1 min-h-0 bg-[#112421] text-white border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[300px]">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0e1d1b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-white font-extrabold text-sm tracking-wide">Manual Partner Assignment</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
              title="Refresh Registry"
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              {healthmates.length} partner(s)
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {healthmates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Clock className="w-8 h-8 text-brand-teal animate-spin" />
              <p className="text-slate-400 text-sm font-semibold">Loading partner registry...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0e1d1b]/50 border-b border-white/5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Partner Name</th>
                  <th className="px-6 py-4">Type & Category</th>
                  <th className="px-6 py-4">Current Assignee</th>
                  <th className="px-6 py-4">Assign to Online Ops</th>
                  <th className="px-6 py-4">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {healthmates.map((hm) => {
                  const initials = hm.name
                    ? hm.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'HM';
                  const localDate = hm.createdAt && !isNaN(new Date(hm.createdAt).getTime())
                    ? new Date(hm.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : '—';
                  
                  // Filter only online operations agents
                  const onlineOps = teamMembers.filter(
                    (m) => m.isOnline && m.role?.toLowerCase() !== 'admin'
                  );

                  return (
                    <tr key={hm.id} className="hover:bg-white/5 transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <span className="text-white font-extrabold text-xs flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal text-[9px] font-extrabold border border-brand-teal/30 shrink-0 shadow-sm">
                            {initials}
                          </span>
                          {hm.name}
                        </span>
                      </td>
                      {/* Type & Category */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-300 text-xs font-semibold">
                            {hm.category}
                          </span>
                          <span className="text-[8px] text-slate-500 font-extrabold tracking-wide uppercase">
                            {hm.type}
                          </span>
                        </div>
                      </td>
                      {/* Current Assignee */}
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-xs font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hm.opsUser?.isOnline ? 'bg-brand-green' : 'bg-red-500'}`} />
                          {hm.opsUser?.name || 'Unassigned'}
                        </span>
                      </td>
                      {/* Dropdown Assign */}
                      <td className="px-6 py-4">
                        <select
                          value={hm.opsUserId}
                          disabled={assigningId === hm.id}
                          onChange={(e) => handleAssign(hm.id, e.target.value)}
                          className="bg-[#0c1a18] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-1.5 px-3 text-xs font-bold transition-all focus:outline-none cursor-pointer max-w-[180px] truncate"
                        >
                          <option value={hm.opsUserId} disabled>
                            Change Assignment...
                          </option>
                          {onlineOps.map((op) => (
                            <option key={op.id} value={op.id}>
                              {op.name}
                            </option>
                          ))}
                          {onlineOps.length === 0 && (
                            <option value="" disabled>
                              No operators online
                            </option>
                          )}
                        </select>
                      </td>
                      {/* Date Added */}
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {localDate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
