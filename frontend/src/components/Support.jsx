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
  Trash2
} from 'lucide-react';
import useOpsStore from '../store/useOpsStore';
import toast from 'react-hot-toast';

export default function Support() {
  const currentUser = useOpsStore((s) => s.user);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';



  // Persistence of tickets in localStorage
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('support_tickets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'TICKET-101',
        title: 'WhatsApp message triggers throwing 400 bad request in pipeline board',
        category: 'Messaging Queue',
        severity: 'High',
        status: 'PENDING',
        raisedBy: 'Jane Cooper',
        raisedByEmail: 'jane@lifed.com',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'TICKET-102',
        title: 'Redis connection ECONNREFUSED logs repeating in backend console',
        category: 'Server Issue',
        severity: 'Medium',
        status: 'INVESTIGATING',
        raisedBy: 'Alex Carter',
        raisedByEmail: 'alex@lifed.com',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'TICKET-103',
        title: 'Need to add a yoga and mindfulness category to practitioner seeds',
        category: 'Database Config',
        severity: 'Low',
        status: 'RESOLVED',
        raisedBy: 'Jane Cooper',
        raisedByEmail: 'jane@lifed.com',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: 'Bug Report',
    severity: 'Medium'
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');


  // Sync tickets with localStorage
  useEffect(() => {
    localStorage.setItem('support_tickets', JSON.stringify(tickets));
  }, [tickets]);



  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.title.trim()) return;

    const newTicket = {
      id: `TICKET-${Math.floor(100 + Math.random() * 900)}`,
      title: ticketForm.title.trim(),
      category: ticketForm.category,
      severity: ticketForm.severity,
      status: 'PENDING',
      raisedBy: currentUser?.name || 'Operations Coordinator',
      raisedByEmail: currentUser?.email || 'ops@lifed.com',
      createdAt: new Date().toISOString()
    };

    setTickets((prev) => [newTicket, ...prev]);
    setTicketForm({ title: '', category: 'Bug Report', severity: 'Medium' });
    toast.success('Support ticket submitted successfully!');
  };

  const handleUpdateStatus = (ticketId, nextStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );
    toast.success(`Ticket ${ticketId} status updated to ${nextStatus}.`);
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    toast.success(`Ticket ${ticketId} has been deleted.`);
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-400/10 border-red-500/20';
      case 'HIGH':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'MEDIUM':
        return 'text-brand-teal bg-brand-teal/10 border-brand-teal/20';
      default:
        return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'text-brand-green bg-brand-green/10 border-brand-green/20';
      case 'INVESTIGATING':
        return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  // Filters tickets based on admin status / search query or agent specific email matching
  const filteredTickets = tickets.filter((t) => {
    // If not admin, they only see their own tickets
    if (!isAdmin && t.raisedByEmail !== currentUser?.email) return false;

    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.raisedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Support Center</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            {isAdmin
              ? 'Review technical issues, verify bug reports, and track active operations staff.'
              : 'Submit and track technical issues, server alerts, or category requests.'}
          </p>
        </div>
      </div>

      {isAdmin ? (
        /* ── Admin Support View: Raised Tickets Log ── */
        <div className="flex-1 min-h-0 flex flex-col space-y-6">
          {/* Filters & search toolbar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#22313F] border border-white/5 p-4 rounded-2xl shadow-xl shrink-0">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets, IDs, or creators..."
                className="w-full bg-[#121A21] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-brand-teal" /> Status:
              </span>
              <div className="flex bg-[#121A21] p-1 border border-white/10 rounded-xl">
                {['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${filterStatus === status
                        ? 'bg-brand-teal text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets list */}
          <div className="flex-1 bg-[#22313F] border border-white/5 rounded-3xl shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#1A252F]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <h3 className="text-white font-extrabold text-sm tracking-wide">All Raised Support Tickets</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} matches
              </span>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-brand-green" />
                  <p className="text-slate-400 text-sm font-semibold">No tickets found matching current filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#1A252F] border border-white/5 hover:border-brand-teal/30 p-5 rounded-2xl transition-all shadow-sm hover:shadow flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold text-brand-teal tracking-wide">{ticket.id}</span>
                            <span className="text-slate-500 text-[10px] font-bold">·</span>
                            <span className="text-[9px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {ticket.category}
                            </span>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-xs leading-snug break-words">
                          {ticket.title}
                        </h4>
                      </div>

                      {/* Ticket Footer & Actions */}
                      <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-white text-[9px] font-extrabold border border-white/10 shrink-0">
                            {ticket.raisedBy?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'OP'}
                          </span>
                          <div className="text-[9px] font-bold text-slate-400">
                            <p className="text-white leading-tight font-extrabold">{ticket.raisedBy}</p>
                            <p className="text-slate-500 font-semibold">{ticket.raisedByEmail}</p>
                          </div>
                        </div>

                        {/* Status Toggles for Admin */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          {ticket.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                              className="text-[8px] font-extrabold px-2 py-1 rounded bg-brand-green text-white hover:bg-brand-green/95 transition-all shadow-sm"
                            >
                              Resolve
                            </button>
                          )}
                          {ticket.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'INVESTIGATING')}
                              className="text-[8px] font-extrabold px-2 py-1 rounded bg-purple-500 text-white hover:bg-purple-600 transition-all shadow-sm"
                            >
                              Investigate
                            </button>
                          )}
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border tracking-wide uppercase ${getSeverityStyles(ticket.severity)}`}>
                            {ticket.severity} Priority
                          </span>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all focus:outline-none"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Ops Agent Support View: Submit Ticket Form & My Tickets Log ── */
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel: Ticket Form */}
          <div className="lg:col-span-1 bg-[#22313F] text-white border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-start space-y-5">
            <div className="space-y-1.5 border-b border-white/5 pb-4 shrink-0">
              <div className="flex items-center gap-2 text-brand-teal">
                <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                <h3 className="font-extrabold text-sm tracking-wide">Raise Support Ticket</h3>
              </div>
              <p className="text-slate-400 text-[10px] font-semibold">
                Submit technical issues or database configuration requests. Operational admins will resolve them.
              </p>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4">
              {/* Ticket Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Issue Description</label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Detail the issue (e.g. Multer file upload throws 500 error on 2MB PDF)..."
                  className="w-full bg-[#121A21] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Issue Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#121A21] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Server Issue">Server Issue</option>
                  <option value="Database Config">Database Config</option>
                  <option value="Messaging Queue">Messaging Queue</option>
                  <option value="Other / Question">Other / Question</option>
                </select>
              </div>

              {/* Severity */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider">Severity Level</label>
                <select
                  value={ticketForm.severity}
                  onChange={(e) => setTicketForm((p) => ({ ...p, severity: e.target.value }))}
                  className="w-full bg-[#121A21] border border-white/10 focus:border-brand-teal/80 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none"
                >
                  <option value="Low">Low (Visual tweak)</option>
                  <option value="Medium">Medium (Functional degradation)</option>
                  <option value="High">High (Key workflow blocked)</option>
                  <option value="Critical">Critical (System crashed)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!ticketForm.title.trim()}
                className="w-full bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-brand-teal/10 hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Right Panel: Agent Ticket List */}
          <div className="lg:col-span-3 bg-[#22313F] text-white border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[300px]">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#1A252F]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <h3 className="text-white font-extrabold text-sm tracking-wide">My Submitted Tickets</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                {filteredTickets.length} active
              </span>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-brand-teal animate-pulse" />
                  <p className="text-slate-400 text-sm font-semibold">No tickets raised by you yet.</p>
                  <p className="text-slate-500 text-xs font-medium max-w-[250px]">Use the panel on the left to submit any system bugs or configuration requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#1A252F] border border-white/5 hover:border-brand-teal/30 p-5 rounded-2xl transition-all shadow-sm hover:shadow flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-brand-teal tracking-wide">{ticket.id}</span>
                            <span className="text-slate-500 text-[10px] font-bold">·</span>
                            <span className="text-[9px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {ticket.category}
                            </span>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-xs leading-snug break-words">
                          {ticket.title}
                        </h4>
                      </div>

                      <div className="border-t border-white/5 pt-3 mt-2 flex items-center justify-between shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border tracking-wide uppercase ${getSeverityStyles(ticket.severity)}`}>
                            {ticket.severity} Priority
                          </span>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all focus:outline-none"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
