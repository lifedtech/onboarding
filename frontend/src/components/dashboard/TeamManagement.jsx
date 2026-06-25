import { useEffect, useState } from 'react';
import {
  Users, Plus, Mail, Key, Shield, Calendar, X, UserCheck, Clock, Trash2, RefreshCw, CheckSquare, Edit2
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';

export default function TeamManagement() {
  const teamMembers = useOpsStore((s) => s.teamMembers);
  const fetchTeamMembers = useOpsStore((s) => s.fetchTeamMembers);
  const createTeamMember = useOpsStore((s) => s.createTeamMember);
  const deleteTeamMember = useOpsStore((s) => s.deleteTeamMember);
  const updateTeamMember = useOpsStore((s) => s.updateTeamMember);
  const currentUser = useOpsStore((s) => s.user);
  const isLoading = useOpsStore((s) => s.isLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPS_AGENT',
    accessScopes: ['HEALTHMATES'] // Default
  });
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTeamMembers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTeamMembers();
    const interval = setInterval(fetchTeamMembers, 8000);
    return () => clearInterval(interval);
  }, [fetchTeamMembers]);

  const handleOpenModal = (member = null) => {
    if (member && member.id) {
      setEditingMemberId(member.id);
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '', // blank unless changing
        role: member.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'OPS_AGENT',
        accessScopes: member.accessScopes || ['HEALTHMATES', 'SERVICE_USERS']
      });
    } else {
      setEditingMemberId(null);
      setFormData({ name: '', email: '', password: '', role: 'OPS_AGENT', accessScopes: ['HEALTHMATES'] });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScopeToggle = (scope) => {
    setFormData(prev => {
      const scopes = prev.accessScopes.includes(scope)
        ? prev.accessScopes.filter(s => s !== scope)
        : [...prev.accessScopes, scope];
      return { ...prev, accessScopes: scopes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) return;
    if (!editingMemberId && !formData.password) return;

    setSubmitting(true);
    // Map OPS_AGENT to ops for backend model support
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role === 'ADMIN' ? 'admin' : 'ops',
      accessScopes: formData.accessScopes
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    let res;
    if (editingMemberId) {
      res = await updateTeamMember(editingMemberId, payload);
    } else {
      res = await createTeamMember(payload);
    }
    setSubmitting(false);

    if (res.success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member? This will automatically reassign any active onboarding partners they manage to you.')) {
      return;
    }
    await deleteTeamMember(id);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base max-w-7xl mx-auto h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Team Management</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">Control operational credentials, roles, and administrative staff configurations.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-4 py-2.5 rounded-xl text-sm font-extrabold shadow-md shadow-brand-teal/10 hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Main Grid: Data Card & Stats panel */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 shrink-0">
          {/* Card 1: Total Admins */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-brand-teal/80 text-[10px] font-extrabold uppercase tracking-wider">Total Administrators</span>
                <p className="text-3xl font-extrabold tracking-tight">
                  {teamMembers.filter((m) => m.role?.toLowerCase() === 'admin').length}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              System access configuration managers
            </div>
          </div>

          {/* Card 2: Total Operations Agents */}
          <div className="bg-[#112421] border border-white/5 shadow-xl text-white rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-brand-green/80 text-[10px] font-extrabold uppercase tracking-wider">Operations Agents</span>
                <p className="text-3xl font-extrabold tracking-tight">
                  {teamMembers.filter((m) => m.role?.toLowerCase() !== 'admin').length}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              Frontline onboarding coordinators
            </div>
          </div>
        </div>

        {/* Right Data Table card */}
        <div className="flex-1 bg-[#112421] text-white border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0e1d1b]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-white font-extrabold text-sm tracking-wide">Active Team Registry</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRefresh}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
                title="Refresh Registry"
                disabled={refreshing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <Clock className="w-8 h-8 text-brand-teal animate-spin" />
                <p className="text-slate-400 text-sm font-semibold">Loading team configuration...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0e1d1b]/50 border-b border-white/5 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Presence</th>
                    <th className="px-6 py-4">Authorized Role</th>
                    <th className="px-6 py-4">Access Scope</th>
                    <th className="px-6 py-4">Date Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teamMembers.map((member) => {
                    const isUserAdmin = member.role?.toLowerCase() === 'admin';
                    const localDate = new Date(member.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const isOnline = member.isOnline;
                    const scopes = member.accessScopes || ['HEALTHMATES', 'SERVICE_USERS']; // Fallback for old data

                    return (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span className="text-white font-extrabold text-xs flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isUserAdmin ? 'bg-amber-400' : 'bg-brand-green'}`} />
                            {member.name}
                          </span>
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4">
                          <span className="text-slate-300 text-xs font-semibold">
                            {member.email}
                          </span>
                        </td>
                        {/* Presence */}
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-brand-green animate-pulse' : 'bg-red-500'}`} />
                            <span className={isOnline ? 'text-brand-green' : 'text-red-400'}>
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </span>
                        </td>
                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase
                            ${isUserAdmin
                              ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                              : 'text-brand-green bg-brand-green/10 border-brand-green/20'
                            }`}
                          >
                            {isUserAdmin ? 'Administrator' : 'Ops Agent'}
                          </span>
                        </td>
                        {/* Scope Badges */}
                        <td className="px-6 py-4">
                           <div className="flex gap-1 flex-wrap">
                             {scopes.map(s => (
                               <span key={s} className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-md">
                                 {s.replace('_', ' ')}
                               </span>
                             ))}
                           </div>
                        </td>
                        {/* Join Date */}
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {localDate}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(member)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all shrink-0"
                              title="Edit Team Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              disabled={member.id === currentUser?.id}
                              onClick={() => handleDelete(member.id)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-400 transition-all shrink-0"
                              title={member.id === currentUser?.id ? "You cannot delete your own account" : "Delete Team Member"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Invite Modal (Floating overlay) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#112421] border border-white/10 rounded-3xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#0e1d1b]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm tracking-wide">
                    {editingMemberId ? 'Edit Team Member' : 'Invite Team Member'}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                    {editingMemberId ? 'Update credentials and access.' : 'Invite a team coordinator or admin manager.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g., Jane Cooper"
                    className="w-full bg-[#0c1a18] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
                  />
                  <Users className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="E.g., jane@lifed.com"
                    className="w-full bg-[#0c1a18] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">
                  {editingMemberId ? 'Reset Password (Optional)' : 'Temporary Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingMemberId}
                    placeholder={editingMemberId ? "Leave blank to keep current" : "Enter system temp password"}
                    className="w-full bg-[#0c1a18] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Authorization Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-[#0c1a18] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none appearance-none"
                  >
                    <option value="OPS_AGENT">Ops Agent (Onboarding coordinator)</option>
                    <option value="ADMIN">Administrator (Full credential controls)</option>
                  </select>
                  <Shield className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Access Scopes (Multi-select) */}
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Client Access Scope</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('HEALTHMATES')}
                      onChange={() => handleScopeToggle('HEALTHMATES')}
                      className="peer hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.accessScopes.includes('HEALTHMATES') ? 'bg-brand-teal border-brand-teal text-white' : 'border-white/20 text-transparent bg-[#0c1a18]'}`}>
                       <CheckSquare className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">HealthMates</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('SERVICE_USERS')}
                      onChange={() => handleScopeToggle('SERVICE_USERS')}
                      className="peer hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.accessScopes.includes('SERVICE_USERS') ? 'bg-brand-teal border-brand-teal text-white' : 'border-white/20 text-transparent bg-[#0c1a18]'}`}>
                       <CheckSquare className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Service Users</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 shrink-0 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.accessScopes.length === 0}
                  className="bg-brand-teal hover:bg-brand-teal-hover text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-brand-teal/10 hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
                  title={formData.accessScopes.length === 0 ? "Select at least one scope" : ""}
                >
                  {submitting ? (editingMemberId ? 'Saving...' : 'Creating member...') : (editingMemberId ? 'Save Changes' : 'Invite Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
