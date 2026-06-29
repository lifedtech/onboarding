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
      <div className="p-8 text-center text-text-main">
        <p className="font-bold text-lg text-red-500">Access Denied</p>
        <p className="text-sm text-slate-500 mt-2">Only administrators can access the Task Manager.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-black text-2xl tracking-tight">Task Manager</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            Manually route and assign newly added partner enquiries to active, online operational staff.
          </p>
        </div>
      </div>

      {/* Manual Partner Assignment Workspace */}
      <div className="flex-1 min-h-0 bg-white text-text-main border border-border-leaf rounded-[24px] shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="px-6 py-5 border-b border-border-leaf flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-text-main font-black text-sm tracking-wide ml-1">Manual Partner Assignment</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-text-main hover:bg-slate-50 transition-all focus:outline-none"
              title="Refresh Registry"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-teal' : ''}`} />
            </button>
            <span className="text-[10px] font-bold text-text-muted bg-slate-50 border border-border-leaf px-2.5 py-0.5 rounded-full">
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
                <tr className="bg-slate-50/50 border-b border-border-leaf/50 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Partner Name</th>
                  <th className="px-6 py-4">Type & Category</th>
                  <th className="px-6 py-4">Current Assignee</th>
                  <th className="px-6 py-4">Assign to Online Ops</th>
                  <th className="px-6 py-4">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-leaf/50">
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
                    <tr key={hm.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <span className="text-text-main font-bold text-xs flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal text-[9px] font-black border border-brand-teal/20 shrink-0 shadow-sm">
                            {initials}
                          </span>
                          {hm.name}
                        </span>
                      </td>
                      {/* Type & Category */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500 text-xs font-semibold">
                            {hm.category}
                          </span>
                          <span className="text-[9px] text-text-muted font-bold tracking-wide uppercase">
                            {hm.type}
                          </span>
                        </div>
                      </td>
                      {/* Current Assignee */}
                      <td className="px-6 py-4">
                        <span className="text-slate-500 text-xs font-semibold flex items-center gap-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${hm.opsUser?.isOnline ? 'bg-brand-green' : 'bg-red-500'}`} />
                          {hm.opsUser?.name || 'Unassigned'}
                        </span>
                      </td>
                      {/* Dropdown Assign */}
                      <td className="px-6 py-4">
                        <select
                          value={hm.opsUserId}
                          disabled={assigningId === hm.id}
                          onChange={(e) => handleAssign(hm.id, e.target.value)}
                          className="bg-slate-50 border border-border-leaf hover:bg-slate-100 hover:border-slate-300 focus:border-brand-teal text-text-main rounded-[12px] py-1.5 px-3 text-xs font-bold transition-all focus:outline-none cursor-pointer max-w-[180px] truncate"
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
                        <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
