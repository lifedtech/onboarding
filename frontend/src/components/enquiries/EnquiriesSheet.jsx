import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  Edit2
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import AddEnquiryModal from './AddEnquiryModal';
import toast from 'react-hot-toast';

export default function EnquiriesSheet() {
  const enquiries = useOpsStore((s) => s.enquiries);
  const isLoading = useOpsStore((s) => s.isLoading);
  const fetchEnquiries = useOpsStore((s) => s.fetchEnquiries);
  const updateEnquiry = useOpsStore((s) => s.updateEnquiry);
  const deleteEnquiry = useOpsStore((s) => s.deleteEnquiry);
  const promoteEnquiry = useOpsStore((s) => s.promoteEnquiry);

  // States
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'HEALTH_PARTNER' | 'SERVICE_USER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONTACTED' | 'PENDING'
  const [reminderFilter, setReminderFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'FUTURE'

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editClientType, setEditClientType] = useState('');
  const [editCallbackLater, setEditCallbackLater] = useState(false);
  const [editReminderDate, setEditReminderDate] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Helpers
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const formatIST = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get active reminders for today
  const todayReminders = enquiries.filter(
    (enq) =>
      enq.clientType === 'HEALTH_PARTNER' &&
      enq.callbackLater &&
      enq.reminderDate &&
      isToday(enq.reminderDate) &&
      !enq.contacted &&
      !enq.movedToPipeline
  );

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name.toLowerCase().includes(search.toLowerCase()) ||
      enq.contact.toLowerCase().includes(search.toLowerCase()) ||
      (enq.remarks && enq.remarks.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || enq.clientType === typeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONTACTED' && enq.contacted) ||
      (statusFilter === 'PENDING' && !enq.contacted);

    let matchesReminder = true;
    if (reminderFilter === 'TODAY') {
      matchesReminder = enq.callbackLater && enq.reminderDate && isToday(enq.reminderDate);
    } else if (reminderFilter === 'FUTURE') {
      matchesReminder =
        enq.callbackLater &&
        enq.reminderDate &&
        new Date(enq.reminderDate) > new Date() &&
        !isToday(enq.reminderDate);
    }

    return matchesSearch && matchesType && matchesStatus && matchesReminder;
  });

  // Action handlers
  const handleToggleContacted = async (id, currentVal) => {
    const result = await updateEnquiry(id, { contacted: !currentVal });
    if (result && result.success) {
      toast.success(`Enquiry marked as ${!currentVal ? 'contacted' : 'pending contact'}.`);
    } else {
      toast.error('Failed to update contacted status.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the enquiry for ${name}?`)) {
      const result = await deleteEnquiry(id);
      if (result && !result.success) {
        toast.error('Failed to delete enquiry.');
      }
    }
  };

  const handlePromote = async (id) => {
    const category = window.prompt("Enter Partner Category (e.g. Yoga, Physiotherapy):", "Wellness");
    if (category === null) return; // user cancelled

    const type = window.prompt("Enter Partner Type (PRACTITIONER, CENTRE, or ORGANIZER):", "PRACTITIONER");
    if (type === null) return; // user cancelled

    const validTypes = ['PRACTITIONER', 'CENTRE', 'ORGANIZER'];
    if (!validTypes.includes(type.toUpperCase())) {
      toast.error("Invalid Partner Type. Must be PRACTITIONER, CENTRE, or ORGANIZER.");
      return;
    }

    const toastId = toast.loading('Promoting enquiry to pipeline...');
    const result = await promoteEnquiry(id, category, type.toUpperCase());
    toast.dismiss(toastId);

    if (result && result.success) {
      toast.success('Successfully promoted to partner pipeline!');
    } else {
      toast.error(result.message || 'Failed to promote enquiry.');
    }
  };

  // Inline editing actions
  const startEditing = (enq) => {
    setEditingId(enq.id);
    setEditName(enq.name);
    setEditContact(enq.contact);
    setEditLocation(enq.location || '');
    setEditRemarks(enq.remarks || '');
    setEditClientType(enq.clientType);
    setEditCallbackLater(enq.callbackLater);
    if (enq.reminderDate) {
      // Input datetime-local format requires YYYY-MM-DDTHH:MM
      const date = new Date(enq.reminderDate);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISO = new Date(date.getTime() - tzOffset).toISOString();
      setEditReminderDate(localISO.slice(0, 16));
    } else {
      setEditReminderDate('');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = async (id) => {
    if (!editName.trim() || !editContact.trim()) {
      toast.error('Name and Contact are required.');
      return;
    }

    const toastId = toast.loading('Saving changes...');
    const payload = {
      name: editName,
      contact: editContact,
      location: editLocation.trim() || null,
      remarks: editRemarks,
      clientType: editClientType,
      callbackLater: editClientType === 'HEALTH_PARTNER' ? editCallbackLater : false,
      reminderDate: (editClientType === 'HEALTH_PARTNER' && editCallbackLater && editReminderDate)
        ? new Date(editReminderDate).toISOString()
        : null
    };

    const result = await updateEnquiry(id, payload);
    toast.dismiss(toastId);

    if (result && result.success) {
      setEditingId(null);
    } else {
      toast.error(result.message || 'Failed to save changes.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/30 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
            <FileSpreadsheet className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h1 className="text-text-main font-extrabold text-xl leading-tight tracking-wide">Enquiries</h1>
            <p className="text-text-muted text-xs font-semibold mt-0.5">
              {isLoading ? 'Loading…' : `${enquiries.length} intake enquiries registered`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpenAdd(true)}
            className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover text-white px-4 py-2.5 rounded-xl text-sm font-extrabold shadow-md shadow-brand-teal/10 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Enquiry
          </button>

          <button
            onClick={fetchEnquiries}
            disabled={isLoading}
            className="flex items-center gap-2 text-text-muted hover:text-brand-teal border border-border-leaf/50 hover:bg-brand-teal/5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Today's Callback Reminders Banner */}
      {todayReminders.length > 0 && (
        <div className="px-6 pt-5 shrink-0">
          <div className="bg-gradient-to-r from-[#22313F] to-indigo-950 border border-indigo-900 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
              </span>
              <h3 className="text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                Callbacks Scheduled For Today ({todayReminders.length})
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[160px] overflow-y-auto pr-1">
              {todayReminders.map((req) => (
                <div key={req.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-3 hover:bg-white/15 transition-all">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-white text-sm font-bold truncate">{req.name}</p>
                      <span className="text-[10px] bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-full font-bold">
                        Partner
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs font-semibold truncate mt-1">{req.contact}</p>
                    {req.remarks && (
                      <p className="text-slate-400 text-[11px] mt-1.5 italic line-clamp-2 leading-relaxed">
                        "{req.remarks}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleToggleContacted(req.id, false)}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white text-[11px] font-extrabold py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => handlePromote(req.id)}
                      className="flex-1 bg-brand-teal hover:bg-brand-teal-hover text-white text-[11px] font-extrabold py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Promote Partner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Grid */}
      <div className="px-6 py-4 border-b border-border-leaf/20 bg-slate-50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enquiries by name, contact, remarks..."
            className="w-full bg-white border border-border-leaf/75 text-text-main placeholder-text-muted/40 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-border-leaf/75 text-text-main text-[10px] font-extrabold uppercase tracking-wider rounded-xl py-1.5 px-3 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="HEALTH_PARTNER">Partners</option>
              <option value="SERVICE_USER">Service Users</option>
            </select>
          </div>

          {/* Contact Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-border-leaf/75 text-text-main text-[10px] font-extrabold uppercase tracking-wider rounded-xl py-1.5 px-3 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="CONTACTED">Contacted</option>
              <option value="PENDING">Pending Contact</option>
            </select>
          </div>

          {/* Reminder Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Callbacks:</span>
            <select
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
              className="bg-white border border-border-leaf/75 text-text-main text-[10px] font-extrabold uppercase tracking-wider rounded-xl py-1.5 px-3 focus:outline-none"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today's Callback</option>
              <option value="FUTURE">Future Callbacks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Excel Sheet Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-slate-200 rounded-3xl bg-white p-8">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <h4 className="text-text-main font-extrabold text-sm">No Enquiries Found</h4>
            <p className="text-text-muted text-xs font-semibold mt-1 max-w-sm">
              Try adjusting your search query, filtering variables, or add a brand new enquiry to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-[800px]">
            <table className="w-full text-left border-collapse table-fixed">
              {/* Table Headers */}
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-4 w-[15%]">Name</th>
                  <th className="py-3 px-4 w-[15%]">Contact Info</th>
                  <th className="py-3 px-4 w-[15%]">Location</th>
                  <th className="py-3 px-4 w-[12%]">Client Type</th>
                  <th className="py-3 px-4 w-[10%] text-center">Status</th>
                  <th className="py-3 px-4 w-[18%]">Remarks</th>
                  <th className="py-3 px-4 w-[15%]">Reminder Callback</th>
                  <th className="py-3 px-4 w-[15%]">Entered At (IST)</th>
                  <th className="py-3 px-4 w-[120px] text-center">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-xs text-text-main font-bold">
                {filteredEnquiries.map((enq) => {
                  const isEditing = editingId === enq.id;
                  const callbackToday = enq.callbackLater && enq.reminderDate && isToday(enq.reminderDate);

                  return (
                    <tr
                      key={enq.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        callbackToday && !enq.contacted ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4 truncate font-extrabold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{enq.name}</span>
                            {enq.movedToPipeline && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200/50">
                                Moved to Pipeline
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 truncate">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editContact}
                            onChange={(e) => setEditContact(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          enq.contact
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 truncate">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          enq.location || <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Client Type */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={editClientType}
                            onChange={(e) => setEditClientType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="HEALTH_PARTNER">Health Partner</option>
                            <option value="SERVICE_USER">Service User</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              enq.clientType === 'HEALTH_PARTNER'
                                ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20'
                                : 'bg-[#2C3E50]/10 text-[#2C3E50] border border-[#2C3E50]/15'
                            }`}
                          >
                            {enq.clientType === 'HEALTH_PARTNER' ? 'Partner' : 'Service User'}
                          </span>
                        )}
                      </td>

                      {/* Contacted Status checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleContacted(enq.id, enq.contacted)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all ${
                            enq.contacted
                              ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                              : 'bg-red-50 text-red-500 border-red-200'
                          }`}
                        >
                          {enq.contacted ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Contacted
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </button>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4 truncate italic font-medium text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          enq.remarks || '—'
                        )}
                      </td>

                      {/* Reminder Callback */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          editClientType === 'HEALTH_PARTNER' ? (
                            <div className="flex flex-col gap-1.5">
                              <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editCallbackLater}
                                  onChange={(e) => setEditCallbackLater(e.target.checked)}
                                  className="w-3.5 h-3.5 text-brand-teal"
                                />
                                Callback later
                              </label>
                              {editCallbackLater && (
                                <input
                                  type="datetime-local"
                                  value={editReminderDate}
                                  onChange={(e) => setEditReminderDate(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                />
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not applicable</span>
                          )
                        ) : enq.callbackLater && enq.reminderDate ? (
                          <div className="flex items-center gap-1.5">
                            {callbackToday && !enq.contacted ? (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            ) : (
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span
                              className={`text-[11px] ${
                                callbackToday && !enq.contacted
                                  ? 'text-amber-600 font-extrabold'
                                  : 'text-text-main'
                              }`}
                            >
                              {new Date(enq.reminderDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400/60 font-semibold">—</span>
                        )}
                      </td>

                      {/* Entered At */}
                      <td className="py-3 px-4 truncate font-semibold text-slate-500 text-[11px]">
                        {formatIST(enq.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEditing(enq.id)}
                                className="p-1 text-brand-green hover:bg-brand-green/5 rounded-lg transition-colors cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Cancel editing"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {enq.clientType === 'HEALTH_PARTNER' && (
                                enq.movedToPipeline ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 py-1.5 px-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <Check className="w-3 h-3 text-indigo-600" />
                                    Moved to Pipeline
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePromote(enq.id)}
                                    className="p-1.5 text-brand-teal hover:bg-brand-teal/5 border border-brand-teal/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                                    title="Promote to pipeline partner"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Promote
                                  </button>
                                )
                              )}
                              <button
                                onClick={() => startEditing(enq)}
                                className="p-1 text-slate-400 hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit enquiry row"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(enq.id, enq.name)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete enquiry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Enquiry Modal */}
      <AddEnquiryModal isOpen={isOpenAdd} onClose={() => setIsOpenAdd(false)} />
    </div>
  );
}
