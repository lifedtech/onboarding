import { useEffect, useState } from 'react';
import {
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  Users,
  Search,
  Filter,
  Wrench,
  RefreshCw,
  Trash2,
  Activity,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import useOpsStore from '../store/useOpsStore';
import toast from 'react-hot-toast';

export default function SystemSupport() {
  const { user: currentUser, tickets, fetchTickets, createTicket, updateTicket, deleteTicket } = useOpsStore();
  
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isSuperAdmin = currentUser?.email === 'admin@lifed.com' || currentUser?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('SYSTEM'); // SYSTEM, HEALTHMATE, SERVICE_USER
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    type: 'SYSTEM',
    priority: 'MEDIUM',
    healthmateId: '',
    serviceUserEmail: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.title.trim()) return;

    const res = await createTicket({
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      type: ticketForm.type,
      priority: ticketForm.priority,
      healthmateId: ticketForm.healthmateId || undefined,
      serviceUserEmail: ticketForm.serviceUserEmail || undefined
    });

    if (res.success) {
      toast.success('Support ticket submitted successfully!');
      setTicketForm({
        title: '',
        description: '',
        type: 'SYSTEM',
        priority: 'MEDIUM',
        healthmateId: '',
        serviceUserEmail: ''
      });
      // Optionally notify super admin via socket here, but API can trigger it
    } else {
      toast.error(res.message);
    }
  };

  const handleUpdateStatus = async (ticketId, nextStatus) => {
    const res = await updateTicket(ticketId, { status: nextStatus });
    if (res.success) {
      toast.success(`Ticket status updated to ${nextStatus}.`);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const res = await deleteTicket(ticketId);
    if (res.success) {
      toast.success(`Ticket has been deleted.`);
    } else {
      toast.error(res.message);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-brand-teal bg-brand-teal/10 border-brand-teal/20';
      default:
        return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'text-brand-green bg-brand-green/10 border-brand-green/20';
      case 'IN_PROGRESS':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  // Filter based on selected tab and search/status filters
  const filteredTickets = (tickets || []).filter((t) => {
    if (t.type !== activeTab) return false;

    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const searchMatchString = `${t.title} ${t.id} ${t.raisedByOps?.name || ''} ${t.healthmate?.name || ''} ${t.serviceUserEmail || ''}`.toLowerCase();
    const matchesSearch = searchMatchString.includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-brand-teal" /> System Support
          </h1>
          <p className="text-sm font-semibold text-text-muted mt-0.5">
            {isSuperAdmin
              ? 'Manage all System-level technical issues.'
              : 'Raise System-level technical issues directly to the Super Admin.'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
              {/* Left Panel: Ticket Form */}
        {!isSuperAdmin && (
          <div className="lg:col-span-1 bg-white border border-border-leaf rounded-[24px] p-6 shadow-sm flex flex-col justify-start space-y-5 h-fit">
            <div className="space-y-1.5 border-b border-border-leaf pb-4 shrink-0">
              <div className="flex items-center gap-2 text-brand-teal">
                <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                <h3 className="font-black text-text-main text-sm tracking-wide">Raise System Ticket</h3>
              </div>
              <p className="text-slate-500 text-[11px] font-semibold">
                Submit technical issues directly to the Super Admin.
              </p>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Issue Title</label>
                <input
                  required
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm((p) => ({ ...p, title: e.target.value, type: activeTab }))}
                  placeholder="Short title..."
                  className="w-full bg-slate-50 border border-border-leaf focus:border-brand-teal/80 text-text-main rounded-[16px] py-2 px-3 text-sm font-semibold transition-all focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Description</label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Detail the issue..."
                  className="w-full bg-slate-50 border border-border-leaf focus:border-brand-teal/80 text-text-main rounded-[16px] py-2 px-3 text-sm font-semibold transition-all focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Priority</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full bg-slate-50 border border-border-leaf focus:border-brand-teal/80 text-text-main rounded-[16px] py-2 px-3 text-xs font-bold transition-all focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              
              {activeTab === 'SERVICE_USER' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Service User Email</label>
                  <input
                    required
                    type="email"
                    value={ticketForm.serviceUserEmail}
                    onChange={(e) => setTicketForm((p) => ({ ...p, serviceUserEmail: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full bg-slate-50 border border-border-leaf focus:border-brand-teal/80 text-text-main rounded-[16px] py-2 px-3 text-sm font-semibold transition-all focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!ticketForm.title.trim()}
                className="w-full bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white font-black text-sm py-2.5 rounded-[16px] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                Submit Ticket
              </button>
            </form>
          </div>
        )}

        {/* Right Panel: Ticket List */}
        <div className={`${isSuperAdmin ? 'lg:col-span-4' : 'lg:col-span-3'} bg-white border border-border-leaf rounded-[24px] shadow-sm overflow-hidden flex flex-col min-h-[500px]`}>
          <div className="px-6 py-4 border-b border-border-leaf flex items-center justify-between shrink-0 bg-slate-50/50 flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search system tickets..."
                className="w-full bg-white border border-border-leaf focus:border-brand-teal/80 text-text-main rounded-[12px] py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-brand-teal" /> Status:
              </span>
              <div className="flex bg-white p-1 border border-border-leaf rounded-[12px]">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${filterStatus === status
                        ? 'bg-brand-teal text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-2 text-center">
                <CheckCircle2 className="w-10 h-10 text-brand-green/50" />
                <p className="text-slate-500 text-sm font-semibold">No {activeTab.toLowerCase()} tickets found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTickets.map((ticket) => {
                  
                  const canManage = isSuperAdmin || (isAdmin && activeTab !== 'SYSTEM') || ticket.assignedToId === currentUser?.id;
                  
                  return (
                  <div
                    key={ticket.id}
                    className="bg-white border border-border-leaf hover:border-brand-teal/30 p-5 rounded-[24px] transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-brand-teal tracking-wide">{ticket.id.slice(0, 13)}</span>
                          <span className="text-slate-300 text-[10px] font-bold">·</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border tracking-wide uppercase ${getPriorityStyles(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${getStatusStyles(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-text-main font-black text-sm leading-snug break-words">
                        {ticket.title}
                      </h4>
                      {ticket.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                      )}
                      
                      {/* Ticket Context */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {ticket.raisedByOps && (
                          <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
                            <Users className="w-3 h-3" /> Raised by {ticket.raisedByOps.name}
                          </div>
                        )}
                        {ticket.healthmate && (
                          <div className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded flex items-center gap-1">
                            <HeartPulse className="w-3 h-3" /> {ticket.healthmate.name}
                          </div>
                        )}
                        {ticket.serviceUserEmail && (
                          <div className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> {ticket.serviceUserEmail}
                          </div>
                        )}
                        {ticket.assignedTo && (
                          <div className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> Assigned to {ticket.assignedTo.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border-leaf pt-4 flex items-center justify-between shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {canManage && ticket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                            className="text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg bg-brand-green text-white hover:bg-brand-green/95 transition-all shadow-sm"
                          >
                            Resolve
                          </button>
                        )}
                        {canManage && ticket.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                            className="text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all shadow-sm"
                          >
                            Investigate
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all focus:outline-none"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
