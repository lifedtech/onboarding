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
    accessScopes: ['HEALTHMATES', 'SERVICE_USERS'] // Default for operations
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
        role: member.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : member.role?.toUpperCase() === 'MARKETING' ? 'MARKETING' : 'OPS_AGENT',
        accessScopes: member.accessScopes || ['HEALTHMATES', 'SERVICE_USERS']
      });
    } else {
      setEditingMemberId(null);
      setFormData({ name: '', email: '', password: '', role: 'OPS_AGENT', accessScopes: ['HEALTHMATES', 'SERVICE_USERS'] });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData((prev) => {
        let newScopes = [];
        if (value === 'MARKETING') {
          newScopes = ['SALES_MARKETING'];
        } else if (value === 'ADMIN') {
          newScopes = ['FULL_ACCESS']; // Or leave it empty and let logic handle Admin. Let's give FULL_ACCESS
        } else {
          newScopes = ['HEALTHMATES', 'SERVICE_USERS']; // Default ops scopes
        }
        return { ...prev, [name]: value, accessScopes: newScopes };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      role: formData.role === 'ADMIN' ? 'admin' : formData.role === 'MARKETING' ? 'marketing' : 'ops',
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
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 max-w-7xl mx-auto h-full flex flex-col font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-black text-2xl tracking-tight">Team Management</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Control operational credentials, roles, and administrative staff configurations.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-5 py-3 rounded-[16px] text-sm font-black shadow-sm transition-all self-start sm:self-auto hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Main Grid: Data Card & Stats panel */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0">
          {/* Card 1: Full Access */}
          <div className="bg-white border border-border-leaf shadow-sm text-text-main rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Full Access</span>
                <p className="text-3xl font-black tracking-tight text-text-main">
                  {teamMembers.filter((m) => m.role?.toLowerCase() === 'admin').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[16px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[12px] font-bold text-slate-400 mt-4">
              System access configuration managers
            </div>
          </div>

          {/* Card 2: Department-wise Access */}
          <div className="bg-white border border-border-leaf shadow-sm text-text-main rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Department Access</span>
                <p className="text-3xl font-black tracking-tight text-text-main">
                  {teamMembers.filter((m) => m.role?.toLowerCase() !== 'admin' && m.role?.toLowerCase() !== 'marketing').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[16px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[12px] font-bold text-slate-400 mt-4">
              Frontline onboarding coordinators
            </div>
          </div>

          {/* Card 3: Marketing */}
          <div className="bg-white border border-border-leaf shadow-sm text-text-main rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[120px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Marketing</span>
                <p className="text-3xl font-black tracking-tight text-text-main">
                  {teamMembers.filter((m) => m.role?.toLowerCase() === 'marketing').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[16px] bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[12px] font-bold text-slate-400 mt-4">
              Sales and performance managers
            </div>
          </div>
        </div>

        {/* Right Data Table card */}
        <div className="flex-1 bg-white border border-border-leaf rounded-[24px] shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-5 border-b border-border-leaf flex items-center justify-between shrink-0 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[12px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-text-main font-black text-sm tracking-wide">Active Team Registry</h3>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleManualRefresh}
                className="p-2 rounded-[12px] text-slate-400 hover:text-text-main hover:bg-slate-200 transition-all focus:outline-none"
                title="Refresh Registry"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[11px] font-black text-slate-500 bg-white border border-border-leaf px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Clock className="w-8 h-8 text-brand-teal animate-spin" />
                <p className="text-slate-500 text-sm font-semibold">Loading team configuration...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-border-leaf text-slate-400 text-[11px] font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Presence</th>
                    <th className="px-6 py-4">Authorized Role</th>
                    <th className="px-6 py-4">Access Scope</th>
                    <th className="px-6 py-4">Date Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-leaf">
                  {teamMembers.map((member) => {
                    const isUserAdmin = member.role?.toLowerCase() === 'admin';
                    const isMarketing = member.role?.toLowerCase() === 'marketing';
                    const localDate = new Date(member.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const isOnline = member.isOnline;
                    let scopes = member.accessScopes;
                    if (!scopes || scopes.length === 0) {
                      // Fallback for old data or if scopes are empty
                      scopes = isUserAdmin 
                        ? ['FULL_ACCESS'] 
                        : isMarketing 
                          ? ['SALES_MARKETING'] 
                          : ['HEALTHMATES', 'SERVICE_USERS'];
                    }

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                        {/* Name */}
                        <td className="px-6 py-4">
                          <span className="text-text-main font-black text-sm flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full border shadow-sm ${isUserAdmin ? 'bg-amber-400 border-white' : isMarketing ? 'bg-blue-400 border-white' : 'bg-brand-green border-white'}`} />
                            {member.name}
                          </span>
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4">
                          <span className="text-slate-500 text-sm font-semibold">
                            {member.email}
                          </span>
                        </td>
                        {/* Presence */}
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                            <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${isOnline ? 'bg-brand-green animate-pulse' : 'bg-slate-300'}`} />
                            <span className={isOnline ? 'text-brand-green' : 'text-slate-400'}>
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </span>
                        </td>
                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-[8px] border tracking-wider uppercase shadow-sm
                            ${isUserAdmin
                              ? 'text-amber-600 bg-amber-50 border-amber-200'
                              : isMarketing
                                ? 'text-blue-600 bg-blue-50 border-blue-200'
                                : 'text-brand-teal bg-brand-teal/10 border-brand-teal/20'
                            }`}
                          >
                            {isUserAdmin ? 'Admin' : isMarketing ? 'Marketing' : 'Operations'}
                          </span>
                        </td>
                        {/* Scope Badges */}
                        <td className="px-6 py-4">
                           <div className="flex gap-1.5 flex-wrap">
                             {scopes.map(s => (
                               <span key={s} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-border-leaf text-slate-500 px-2 py-1 rounded-[6px] shadow-sm">
                                 {s.replace('_', ' ')}
                               </span>
                             ))}
                           </div>
                        </td>
                        {/* Join Date */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            {localDate}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(member)}
                              className="inline-flex items-center justify-center p-2 rounded-[12px] text-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all shrink-0 border border-transparent hover:border-blue-200"
                              title="Edit Team Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              disabled={member.id === currentUser?.id}
                              onClick={() => handleDelete(member.id)}
                              className="inline-flex items-center justify-center p-2 rounded-[12px] text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all shrink-0 border border-transparent hover:border-red-200"
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white border border-border-leaf rounded-[24px] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border-leaf flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shadow-sm">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-text-main font-black text-sm tracking-wide">
                    {editingMemberId ? 'Edit Team Member' : 'Invite Team Member'}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    {editingMemberId ? 'Update credentials and access.' : 'Invite a team coordinator or admin manager.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-text-main hover:bg-slate-200 p-2 rounded-[12px] transition-colors bg-white border border-border-leaf shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g., Jane Cooper"
                    className="w-full bg-white border border-border-leaf focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-text-main rounded-[12px] py-2.5 px-3 pl-10 text-sm font-bold transition-all focus:outline-none shadow-sm placeholder-slate-400"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="E.g., jane@lifed.com"
                    className="w-full bg-white border border-border-leaf focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-text-main rounded-[12px] py-2.5 px-3 pl-10 text-sm font-bold transition-all focus:outline-none shadow-sm placeholder-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
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
                    className="w-full bg-white border border-border-leaf focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-text-main rounded-[12px] py-2.5 px-3 pl-10 text-sm font-bold transition-all focus:outline-none shadow-sm placeholder-slate-400"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Authorization Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white border border-border-leaf focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-text-main rounded-[12px] py-2.5 px-3 pl-10 text-sm font-bold transition-all focus:outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="OPS_AGENT">Operations</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <div className="absolute right-3.5 top-3.5 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Access Scopes (Multi-select) */}
              <div className="space-y-3 mt-6 pt-5 border-t border-border-leaf">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Client Access Scope</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('FULL_ACCESS')}
                      onChange={() => handleScopeToggle('FULL_ACCESS')}
                      className="peer hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.accessScopes.includes('FULL_ACCESS') ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-border-leaf text-transparent'}`}>
                       <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-text-main transition-colors">Full Access</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('HEALTHMATES')}
                      onChange={() => handleScopeToggle('HEALTHMATES')}
                      className="peer hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.accessScopes.includes('HEALTHMATES') ? 'bg-brand-teal border-brand-teal text-white' : 'bg-white border-border-leaf text-transparent'}`}>
                       <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-text-main transition-colors">HealthMates</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('SERVICE_USERS')}
                      onChange={() => handleScopeToggle('SERVICE_USERS')}
                      className="peer hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.accessScopes.includes('SERVICE_USERS') ? 'bg-brand-teal border-brand-teal text-white' : 'bg-white border-border-leaf text-transparent'}`}>
                       <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-text-main transition-colors">Service Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.accessScopes.includes('SALES_MARKETING')}
                      onChange={() => handleScopeToggle('SALES_MARKETING')}
                      className="peer hidden"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.accessScopes.includes('SALES_MARKETING') ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-border-leaf text-transparent'}`}>
                       <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-text-main transition-colors">Sales & Marketing</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-border-leaf shrink-0 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-white hover:bg-slate-50 border border-border-leaf text-slate-600 px-5 py-2.5 rounded-[12px] text-xs font-black transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.accessScopes.length === 0}
                  className="bg-brand-teal hover:bg-brand-teal-hover text-white px-6 py-2.5 rounded-[12px] text-xs font-black shadow-sm hover:shadow-md transition-all flex items-center justify-center disabled:opacity-50"
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
