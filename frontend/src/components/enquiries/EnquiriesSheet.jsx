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
import PromotePartnerModal from './PromotePartnerModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import OnboardUserModal from './OnboardUserModal';
import EnquiryDetailsModal from './EnquiryDetailsModal';
import toast from 'react-hot-toast';


export default function EnquiriesSheet({ enquiryType }) {
  const enquiries = useOpsStore((s) => s.enquiries);
  const isLoading = useOpsStore((s) => s.isLoading);
  const fetchEnquiries = useOpsStore((s) => s.fetchEnquiries);
  const updateEnquiry = useOpsStore((s) => s.updateEnquiry);
  const deleteEnquiry = useOpsStore((s) => s.deleteEnquiry);
  const promoteEnquiry = useOpsStore((s) => s.promoteEnquiry);
  const promoteEnquiryToUser = useOpsStore((s) => s.promoteEnquiryToUser);


  // States
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(enquiryType || 'ALL'); // 'ALL' | 'HEALTH_PARTNER' | 'SERVICE_USER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONTACTED' | 'PENDING'
  const [reminderFilter, setReminderFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'FUTURE'

  // Promote modal states
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteEnquiryId, setPromoteEnquiryId] = useState('');
  const [promoteEnquiryName, setPromoteEnquiryName] = useState('');

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEnquiryId, setDeleteEnquiryId] = useState('');
  const [deleteEnquiryName, setDeleteEnquiryName] = useState('');

  // Onboard user modal states
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardEnquiryId, setOnboardEnquiryId] = useState('');
  const [onboardEnquiryName, setOnboardEnquiryName] = useState('');

  // Selected enquiry for details view
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);


  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAlternateContact, setEditAlternateContact] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editClientType, setEditClientType] = useState('');
  const [editCallbackLater, setEditCallbackLater] = useState(false);
  const [editReminderDate, setEditReminderDate] = useState('');

  const [editSubcategory, setEditSubcategory] = useState('');
  const [editPlatformFound, setEditPlatformFound] = useState('');
  const [editProgramPossibility, setEditProgramPossibility] = useState('');
  const [editFormat, setEditFormat] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

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
      (!enquiryType || enquiryType === 'HEALTH_PARTNER') &&
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

  const handleDelete = (id, name) => {
    setDeleteEnquiryId(id);
    setDeleteEnquiryName(name);
    setDeleteModalOpen(true);
  };

  const handlePromote = (id, name) => {
    setPromoteEnquiryId(id);
    setPromoteEnquiryName(name);
    setPromoteModalOpen(true);
  };

  const handleOnboardUser = (id, name) => {
    setOnboardEnquiryId(id);
    setOnboardEnquiryName(name);
    setOnboardModalOpen(true);
  };



  // Inline editing actions
  const startEditing = (enq) => {
    setEditingId(enq.id);
    setEditName(enq.name);
    setEditContact(enq.contact);
    setEditEmail(enq.email || '');
    setEditAlternateContact(enq.alternateContact || '');
    setEditCity(enq.city || '');
    setEditState(enq.state || '');
    setEditCountry(enq.country || '');
    setEditRemarks(enq.remarks || '');
    setEditClientType(enq.clientType);
    setEditCallbackLater(enq.callbackLater);
    setEditSubcategory(enq.subcategory || '');
    setEditPlatformFound(enq.platformFound || '');
    setEditProgramPossibility(enq.programPossibility || '');
    setEditFormat(enq.format || '');
    setEditPriceRange(enq.priceRange || '');
    setEditCapacity(enq.capacity || '');
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
      email: editEmail.trim() || null,
      alternateContact: editAlternateContact.trim() || null,
      city: editCity.trim() || null,
      state: editState.trim() || null,
      country: editCountry.trim() || null,
      remarks: editRemarks.trim() || null,
      clientType: editClientType,
      subcategory: editSubcategory.trim() || null,
      platformFound: editPlatformFound.trim() || null,
      programPossibility: editProgramPossibility.trim() || null,
      format: editFormat.trim() || null,
      priceRange: editPriceRange.trim() || null,
      capacity: editCapacity.trim() || null,
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
              {isLoading ? 'Loading…' : `${enquiries.filter(e => enquiryType ? e.clientType === enquiryType : true).length} intake enquiries registered`}
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
                <div 
                  key={req.id} 
                  onClick={() => setSelectedEnquiry(req)}
                  className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-3 hover:bg-white/15 transition-all cursor-pointer"
                >
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
                      onClick={(e) => { e.stopPropagation(); handleToggleContacted(req.id, false); }}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white text-[11px] font-extrabold py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Contacted
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePromote(req.id, req.name); }}
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
          {!enquiryType && (
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
          )}

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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-[1000px]">
            <table className="w-full text-left border-collapse table-fixed">
              {/* Table Headers */}
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-4 w-[12%]">Name</th>
                  <th className="py-3 px-4 w-[14%]">Contact Info</th>
                  <th className="py-3 px-4 w-[12%]">Location</th>
                  <th className="py-3 px-4 w-[8%] text-center">Score</th>
                  <th className="py-3 px-4 w-[10%]">Client Type</th>
                  <th className="py-3 px-4 w-[12%] text-center">Status</th>
                  <th className="py-3 px-4 w-[14%]">Remarks</th>
                  <th className="py-3 px-4 w-[9%]">Reminder Callback</th>
                  <th className="py-3 px-4 w-[9%]">Entered At (IST)</th>
                  <th className="py-3 px-4 w-[160px] text-center">Actions</th>
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
                      onClick={!isEditing ? () => setSelectedEnquiry(enq) : undefined}
                      className={`hover:bg-slate-50/50 transition-colors ${!isEditing ? 'cursor-pointer' : ''} ${
                        callbackToday && !enq.contacted ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-extrabold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          <div className="truncate">{enq.name}</div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 truncate">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={editContact}
                              onChange={(e) => setEditContact(e.target.value)}
                              placeholder="Phone Number"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="Email Address"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editAlternateContact}
                              onChange={(e) => setEditAlternateContact(e.target.value)}
                              placeholder="Alternate Phone"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-text-main">{enq.contact}</span>
                            {enq.email && (
                              <span className="text-[10px] text-slate-500">{enq.email}</span>
                            )}
                            {enq.alternateContact && (
                              <span className="text-[10px] text-slate-500">{enq.alternateContact} (Alt)</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              placeholder="City"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editState}
                              onChange={(e) => setEditState(e.target.value)}
                              placeholder="State"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editCountry}
                              onChange={(e) => setEditCountry(e.target.value)}
                              placeholder="Country"
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-teal focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span className={(!enq.city && !enq.state && !enq.country) ? "text-slate-400 font-semibold" : "truncate block max-w-[150px]"}>
                            {[enq.city, enq.state, enq.country].filter(Boolean).join(', ') || '—'}
                          </span>
                        )}
                      </td>



                      {/* Score */}
                      <td className="py-3 px-4 text-center">
                        {enq.clientType === 'HEALTH_PARTNER' ? (
                          <span className="inline-flex items-center justify-center min-w-[32px] h-6 bg-brand-teal/10 text-brand-teal font-extrabold text-xs rounded-lg">
                            {(enq.scoreRelevance || 0) + (enq.scoreSafety || 0) + (enq.scoreExperience || 0) + (enq.scoreCredibility || 0) + (enq.scoreLocation || 0) + (enq.scoreVisual || 0) + (enq.scoreBooking || 0) + (enq.scoreUniqueness || 0) + (enq.scoreCorporate || 0) + (enq.scoreRepeatability || 0)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Client Type */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={editClientType}
                            onChange={(e) => setEditClientType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none cursor-pointer"
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
                          onClick={(e) => { e.stopPropagation(); if (!isEditing) handleToggleContacted(enq.id, enq.contacted); }}
                          disabled={isEditing}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 mx-auto ${
                            enq.contacted
                              ? 'bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green/20'
                              : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
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
                      <td className="py-3 px-4 italic font-medium text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-teal focus:outline-none"
                          />
                        ) : (
                          <div className="truncate">{enq.remarks || '—'}</div>
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
                                  className="w-3.5 h-3.5 text-brand-teal rounded border-slate-300 focus:ring-brand-teal cursor-pointer"
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
                                onClick={(e) => { e.stopPropagation(); saveEditing(enq.id); }}
                                className="p-1 text-brand-green hover:bg-brand-green/5 rounded-lg transition-colors cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
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
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 py-1.5 px-2 bg-indigo-50 rounded-lg border border-indigo-100 whitespace-nowrap">
                                      <Check className="w-3 h-3 text-indigo-600" />
                                      In Pipeline
                                    </span>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePromote(enq.id, enq.name); }}
                                    className="p-1.5 text-brand-teal hover:bg-brand-teal/5 border border-brand-teal/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                                    title="Promote to pipeline partner"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Promote
                                  </button>
                                )
                              )}
                              {enq.clientType === 'SERVICE_USER' && (
                                enq.movedToPipeline ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 py-1.5 px-2 bg-indigo-50 rounded-lg border border-indigo-100 whitespace-nowrap">
                                    <Check className="w-3 h-3 text-indigo-600" />
                                    Onboarded User
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOnboardUser(enq.id, enq.name); }}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                                    title="Onboard as Service User"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Onboard
                                  </button>
                                )
                              )}

                              <button
                                onClick={(e) => { e.stopPropagation(); startEditing(enq); }}
                                className="p-1 text-slate-400 hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit enquiry row"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(enq.id, enq.name); }}
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
      <AddEnquiryModal isOpen={isOpenAdd} onClose={() => setIsOpenAdd(false)} defaultType={enquiryType} />

      {/* Promote Partner Modal */}
      <PromotePartnerModal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        enquiryId={promoteEnquiryId}
        enquiryName={promoteEnquiryName}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        enquiryId={deleteEnquiryId}
        enquiryName={deleteEnquiryName}
      />

      {/* Onboard User Modal */}
      <OnboardUserModal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        enquiryId={onboardEnquiryId}
        enquiryName={onboardEnquiryName}
      />

      {/* Details Modal */}
      <EnquiryDetailsModal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        enquiry={selectedEnquiry}
      />
    </div>

  );
}
