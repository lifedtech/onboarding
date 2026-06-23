import { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Search,
  Filter,
  Plus,
  X,
  ChevronRight,
  Calendar,
  IndianRupee,
  LifeBuoy,
  User,
  Mail,
  Phone,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Tag,
  CreditCard,
  Notebook
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import ConfirmDeleteUserModal from './ConfirmDeleteUserModal';


export default function ServiceUsersList() {
  const serviceUsers = useOpsStore((s) => s.serviceUsers);
  const fetchServiceUsers = useOpsStore((s) => s.fetchServiceUsers);
  const createServiceUser = useOpsStore((s) => s.createServiceUser);
  const updateServiceUser = useOpsStore((s) => s.updateServiceUser);
  const deleteServiceUser = useOpsStore((s) => s.deleteServiceUser);

  // Sub-resource actions
  const addBooking = useOpsStore((s) => s.addBooking);
  const updateBooking = useOpsStore((s) => s.updateBooking);
  const deleteBooking = useOpsStore((s) => s.deleteBooking);

  const addPayment = useOpsStore((s) => s.addPayment);
  const updatePayment = useOpsStore((s) => s.updatePayment);
  const deletePayment = useOpsStore((s) => s.deletePayment);

  const addSupportTicket = useOpsStore((s) => s.addSupportTicket);
  const updateSupportTicket = useOpsStore((s) => s.updateSupportTicket);
  const deleteSupportTicket = useOpsStore((s) => s.deleteSupportTicket);

  const isLoading = useOpsStore((s) => s.isLoading);

  // Component local states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal / Drawer open states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'bookings', 'payments', 'support'


  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'SILVER',
    status: 'ACTIVE',
    notes: ''
  });

  const [bookingForm, setBookingForm] = useState({
    serviceName: '',
    providerName: '',
    bookingDate: '',
    amount: '',
    paymentStatus: 'UNPAID',
    status: 'CONFIRMED'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    status: 'PAID',
    method: 'CREDIT_CARD',
    transactionId: '',
    description: '',
    billingDate: ''
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    severity: 'MEDIUM',
    status: 'OPEN'
  });

  // Fetch on mount
  useEffect(() => {
    fetchServiceUsers();
  }, [fetchServiceUsers]);

  // Statistics calculation
  const totalActiveUsers = serviceUsers.filter((u) => u.status === 'ACTIVE').length;
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayBookingsCount = serviceUsers.reduce((acc, u) => {
    const upcoming = u.bookings?.filter(b => new Date(b.bookingDate) >= todayStart && b.status !== 'CANCELLED') || [];
    return acc + upcoming.length;
  }, 0);

  const totalRevenue = serviceUsers.reduce((acc, u) => {
    const paidSum = u.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
    return acc + paidSum;
  }, 0);

  const openTicketsCount = serviceUsers.reduce((acc, u) => {
    const activeTkts = u.supportTickets?.filter(t => t.status !== 'RESOLVED') || [];
    return acc + activeTkts.length;
  }, 0);

  // Filters
  const filteredUsers = serviceUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    
    const matchesTier = filterTier === 'ALL' || user.tier === filterTier;
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Add User handler
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      toast.error('Name and Email are required.');
      return;
    }
    const res = await createServiceUser(userForm);
    if (res.success) {
      setShowAddUserModal(false);
      setUserForm({ name: '', email: '', phone: '', tier: 'SILVER', status: 'ACTIVE', notes: '' });
    } else {
      toast.error(res.message);
    }
  };

  // Edit User details handler
  const handleUpdateUserDetails = async (updatedFields) => {
    if (!selectedUser) return;
    const res = await updateServiceUser(selectedUser.id, updatedFields);
    if (res.success) {
      setSelectedUser(res.data);
    } else {
      toast.error(res.message);
    }
  };

  // Delete User handler
  const handleDeleteUser = (id) => {
    setShowDeleteModal(true);
  };


  // Booking handlers
  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.serviceName || !bookingForm.providerName || !bookingForm.bookingDate) {
      toast.error('Please fill in service name, provider name, and appointment date.');
      return;
    }
    const res = await addBooking(selectedUser.id, bookingForm);
    if (res.success) {
      setSelectedUser(res.data.user);
      setBookingForm({
        serviceName: '',
        providerName: '',
        bookingDate: '',
        amount: '',
        paymentStatus: 'UNPAID',
        status: 'CONFIRMED'
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId, nextStatus, nextPaymentStatus) => {
    const res = await updateBooking(selectedUser.id, bookingId, {
      status: nextStatus,
      paymentStatus: nextPaymentStatus
    });
    if (res.success) {
      setSelectedUser(res.data.user);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const res = await deleteBooking(selectedUser.id, bookingId);
      if (res.success) {
        // useOpsStore returns updated user data
        const updatedUser = serviceUsers.find(u => u.id === selectedUser.id);
        if (updatedUser) setSelectedUser(updatedUser);
      }
    }
  };

  // Payment handlers
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount) {
      toast.error('Amount is required.');
      return;
    }
    const res = await addPayment(selectedUser.id, paymentForm);
    if (res.success) {
      setSelectedUser(res.data.user);
      setPaymentForm({
        amount: '',
        status: 'PAID',
        method: 'CREDIT_CARD',
        transactionId: '',
        description: '',
        billingDate: ''
      });
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, nextStatus) => {
    const res = await updatePayment(selectedUser.id, paymentId, { status: nextStatus });
    if (res.success) {
      setSelectedUser(res.data.user);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      const res = await deletePayment(selectedUser.id, paymentId);
      if (res.success) {
        const updatedUser = serviceUsers.find(u => u.id === selectedUser.id);
        if (updatedUser) setSelectedUser(updatedUser);
      }
    }
  };

  // Support handlers
  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.title) {
      toast.error('Ticket title is required.');
      return;
    }
    const res = await addSupportTicket(selectedUser.id, ticketForm);
    if (res.success) {
      setSelectedUser(res.data.user);
      setTicketForm({
        title: '',
        description: '',
        category: 'GENERAL',
        severity: 'MEDIUM',
        status: 'OPEN'
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    const res = await updateSupportTicket(selectedUser.id, ticketId, { status: nextStatus });
    if (res.success) {
      setSelectedUser(res.data.user);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this support ticket log?')) {
      const res = await deleteSupportTicket(selectedUser.id, ticketId);
      if (res.success) {
        const updatedUser = serviceUsers.find(u => u.id === selectedUser.id);
        if (updatedUser) setSelectedUser(updatedUser);
      }
    }
  };

  // Styling helper status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INACTIVE':
        return 'text-slate-500 bg-slate-50 border-slate-200';
      case 'SUSPENDED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'PLATINUM':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'GOLD':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      case 'SILVER':
      default:
        return 'text-teal-800 bg-teal-50 border-teal-200';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base w-full h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-brand-teal" /> Service Users Registry
          </h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            Track user account profiles, schedule and coordinate bookings, manage billing/payments, and review support history.
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-teal/15 flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Service User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        {/* Card 1: Active Users */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Active Users</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{totalActiveUsers}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Out of {serviceUsers.length} total profiles</p>
          </div>
        </div>

        {/* Card 2: Today's Bookings */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Upcoming Bookings</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{todayBookingsCount}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Scheduled or in-progress sessions</p>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Revenue Collected</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">From successful transactions</p>
          </div>
        </div>

        {/* Card 4: Open Tickets */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Open Support Tickets</p>
            <h3 className="text-text-main font-extrabold text-xl leading-tight mt-0.5">{openTicketsCount}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Awaiting agent resolution</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm shrink-0">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service users by name, email, phone..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main rounded-xl py-2.5 px-3 pl-9 text-xs font-bold transition-all focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-brand-teal" /> Tier:
            </span>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-text-main text-[11px] font-bold py-1.5 px-3 rounded-lg focus:outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="PLATINUM">Platinum</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-teal" /> Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-text-main text-[11px] font-bold py-1.5 px-3 rounded-lg focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid/Table */}
      <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h3 className="text-text-main font-extrabold text-sm tracking-wide">Registered Accounts List</h3>
          <span className="text-[10px] font-bold text-text-muted bg-slate-200/50 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
            {filteredUsers.length} user(s) matching
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading && serviceUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Clock className="w-8 h-8 text-brand-teal animate-spin" />
              <p className="text-slate-400 text-sm font-semibold">Loading registry details...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="text-slate-400 text-sm font-semibold">No service users found matching the filter criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100 text-text-muted text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email & Phone</th>
                  <th className="px-6 py-4">Account Tier</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Active Bookings</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const initials = user.name
                    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'SU';

                  const activeBookings = user.bookings?.filter(b => b.status === 'CONFIRMED').length || 0;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setActiveTab('profile');
                      }}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal text-[10px] font-extrabold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-text-main font-bold text-xs group-hover:text-brand-teal transition-colors">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-text-muted font-semibold">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {user.email}</span>
                          {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {user.phone}</span>}
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${getTierBadge(user.tier)}`}>
                          {user.tier}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Active Bookings count */}
                      <td className="px-6 py-4">
                        <span className="text-text-main text-xs font-bold flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${activeBookings > 0 ? 'bg-brand-teal' : 'bg-slate-300'}`} />
                          {activeBookings} bookings
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 group-hover:text-brand-teal transition-colors">
                          <ChevronRight className="w-4 h-4" />
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

      {/* Manual Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 relative flex flex-col space-y-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h3 className="text-text-main font-extrabold text-base flex items-center gap-2">
                <User className="w-5 h-5 text-brand-teal" /> Register Service User
              </h3>
              <p className="text-slate-400 text-xs font-semibold">Manually input profile information for new clients.</p>
            </div>
            <form onSubmit={handleAddUserSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+61 400 000 000"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Membership Tier</label>
                  <select
                    value={userForm.tier}
                    onChange={(e) => setUserForm({ ...userForm, tier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                  >
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Initial Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record client medical focus, preferences, or referral context..."
                  value={userForm.notes}
                  onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal/80 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-brand-teal/10 mt-2"
              >
                Create Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sliding Detailed Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          {/* Drawer body */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal text-xs font-extrabold">
                  {selectedUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'SU'}
                </div>
                <div>
                  <h3 className="text-text-main font-extrabold text-sm">{selectedUser.name}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Client Profile · {selectedUser.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 px-6 shrink-0 gap-6 bg-slate-50/30">
              {[
                { id: 'profile', label: 'Details', icon: User },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'payments', label: 'Payments', icon: IndianRupee },
                { id: 'support', label: 'Support History', icon: LifeBuoy }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 py-3.5 font-extrabold text-xs transition-all border-b-2 focus:outline-none ${
                      active
                        ? 'border-brand-teal text-brand-teal'
                        : 'border-transparent text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Details Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Account Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50/75 p-4 border border-slate-100 rounded-2xl">
                    <div className="text-center space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Total Paid</p>
                      <p className="text-text-main font-extrabold text-base">
                        ₹{selectedUser.payments?.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0}
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-200/50 space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Bookings Count</p>
                      <p className="text-text-main font-extrabold text-base">{selectedUser.bookings?.length || 0}</p>
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Pending Tickets</p>
                      <p className="text-text-main font-extrabold text-base">
                        {selectedUser.supportTickets?.filter((t) => t.status !== 'RESOLVED').length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={selectedUser.name || ''}
                          onChange={(e) => handleUpdateUserDetails({ name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          value={selectedUser.email || ''}
                          onChange={(e) => handleUpdateUserDetails({ email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          value={selectedUser.phone || ''}
                          onChange={(e) => handleUpdateUserDetails({ phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Membership Tier</label>
                        <select
                          value={selectedUser.tier || 'SILVER'}
                          onChange={(e) => handleUpdateUserDetails({ tier: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="SILVER">Silver</option>
                          <option value="GOLD">Gold</option>
                          <option value="PLATINUM">Platinum</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Account Status</label>
                        <select
                          value={selectedUser.status || 'ACTIVE'}
                          onChange={(e) => handleUpdateUserDetails({ status: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Notes & Special Requirements</label>
                      <textarea
                        rows={6}
                        value={selectedUser.notes || ''}
                        onChange={(e) => handleUpdateUserDetails({ notes: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-text-main text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Add client medical history or slot requirements..."
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-[10px] font-extrabold px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  {/* Create Booking Form */}
                  <form onSubmit={handleAddBooking} className="bg-slate-50/75 p-5 border border-slate-100 rounded-2xl space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-teal" /> Schedule New Booking
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Service Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Physiotherapy Consult"
                          value={bookingForm.serviceName}
                          onChange={(e) => setBookingForm({ ...bookingForm, serviceName: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Provider / Partner Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Jenkins"
                          value={bookingForm.providerName}
                          onChange={(e) => setBookingForm({ ...bookingForm, providerName: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Appointment Date/Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={bookingForm.bookingDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Consultation Fee (₹)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={bookingForm.amount}
                          onChange={(e) => setBookingForm({ ...bookingForm, amount: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Payment Status</label>
                        <select
                          value={bookingForm.paymentStatus}
                          onChange={(e) => setBookingForm({ ...bookingForm, paymentStatus: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="UNPAID">Unpaid</option>
                          <option value="PAID">Paid</option>
                          <option value="PENDING">Pending</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-md shadow-brand-teal/5"
                    >
                      Schedule Booking
                    </button>
                  </form>

                  {/* Bookings List */}
                  <div className="space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs">Booking History</h4>
                    {!selectedUser.bookings || selectedUser.bookings.length === 0 ? (
                      <p className="text-slate-400 text-xs font-medium">No bookings logged for this user.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border border-slate-200/80 p-4 rounded-2xl bg-white hover:border-brand-teal/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h5 className="text-text-main font-extrabold text-xs">{booking.serviceName}</h5>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Partner: {booking.providerName} · ID: {booking.id}</p>
                              </div>
                              <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                                booking.status === 'COMPLETED' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                booking.status === 'CANCELLED' ? 'text-rose-700 bg-rose-50 border-rose-100' :
                                'text-indigo-700 bg-indigo-50 border-indigo-100'
                              }`}>
                                {booking.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-text-muted font-bold border-t border-slate-100 pt-3 flex-wrap gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(booking.bookingDate).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-semibold">Fee:</span> ₹{booking.amount}
                                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border tracking-wide uppercase ${
                                  booking.paymentStatus === 'PAID' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                                }`}>
                                  {booking.paymentStatus}
                                </span>
                              </span>
                            </div>

                            {/* Booking Action Buttons */}
                            <div className="flex justify-end gap-2 mt-1">
                              {booking.status === 'CONFIRMED' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED', 'PAID')}
                                    className="text-[8px] font-extrabold px-2 py-1 rounded bg-brand-green hover:bg-brand-green-hover text-white transition-all shadow-sm"
                                  >
                                    Mark Completed
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED', booking.paymentStatus)}
                                    className="text-[8px] font-extrabold px-2 py-1 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="text-[8px] font-extrabold px-2 py-1 rounded border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center gap-1"
                                title="Delete Log Record"
                              >
                                <Trash2 className="w-3 h-3" /> Delete Log
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  {/* Log Payment Form */}
                  <form onSubmit={handleAddPayment} className="bg-slate-50/75 p-5 border border-slate-100 rounded-2xl space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-brand-teal" /> Record Financial Statement
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Transaction Amount (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="0.00"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Payment Status</label>
                        <select
                          value={paymentForm.status}
                          onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="PAID">Paid</option>
                          <option value="PENDING">Pending</option>
                          <option value="FAILED">Failed</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Payment Method</label>
                        <select
                          value={paymentForm.method}
                          onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="UPI">UPI</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="PAYPAL">PayPal</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Transaction ID</label>
                        <input
                          type="text"
                          placeholder="e.g. txn_918239"
                          value={paymentForm.transactionId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Billing Date</label>
                        <input
                          type="date"
                          value={paymentForm.billingDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, billingDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Description</label>
                      <input
                        type="text"
                        placeholder="Membership invoice payment or specific class fee details..."
                        value={paymentForm.description}
                        onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-md shadow-brand-teal/5"
                    >
                      Record Payment Statement
                    </button>
                  </form>

                  {/* Payments List */}
                  <div className="space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs">Payment Logs</h4>
                    {!selectedUser.payments || selectedUser.payments.length === 0 ? (
                      <p className="text-slate-400 text-xs font-medium">No payment transactions recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="border border-slate-200/80 p-4 rounded-2xl bg-white hover:border-brand-teal/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                  <IndianRupee className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="text-text-main font-extrabold text-sm">₹{payment.amount}</h5>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Method: {payment.method} · Log ID: {payment.id}</p>
                                </div>
                              </div>
                              <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                                payment.status === 'PAID' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                payment.status === 'PENDING' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                'text-rose-700 bg-rose-50 border-rose-100'
                              }`}>
                                {payment.status}
                              </span>
                            </div>

                            {payment.description && (
                              <p className="text-slate-500 text-xs font-medium leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                {payment.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-text-muted font-bold border-t border-slate-100 pt-3 flex-wrap gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Billing Date: {new Date(payment.billingDate).toLocaleDateString()}
                              </span>
                              <span>Txn Ref: <span className="text-text-main font-extrabold">{payment.transactionId || 'N/A'}</span></span>
                            </div>

                            {/* Payment Actions */}
                            <div className="flex justify-end gap-2 mt-1">
                              {payment.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'PAID')}
                                  className="text-[8px] font-extrabold px-2 py-1 rounded bg-brand-green hover:bg-brand-green-hover text-white transition-all shadow-sm"
                                >
                                  Mark as Paid
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="text-[8px] font-extrabold px-2 py-1 rounded border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove Record
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Support History Tab */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  {/* File Support Ticket Form */}
                  <form onSubmit={handleAddTicket} className="bg-slate-50/75 p-5 border border-slate-100 rounded-2xl space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs flex items-center gap-1.5">
                      <LifeBuoy className="w-4 h-4 text-brand-teal" /> Log Support Ticket
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Ticket Title / Short Description</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mobile portal fails login authorization"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Category</label>
                        <select
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="GENERAL">General Query</option>
                          <option value="BOOKING">Booking Issue</option>
                          <option value="BILLING">Billing Issue</option>
                          <option value="TECH">Technical Bug</option>
                          <option value="HEALTH_PLAN">Health Plan Query</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Severity</label>
                        <select
                          value={ticketForm.severity}
                          onChange={(e) => setTicketForm({ ...ticketForm, severity: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="LOW">Low (Question)</option>
                          <option value="MEDIUM">Medium (Degradation)</option>
                          <option value="HIGH">High (Key blocker)</option>
                          <option value="CRITICAL">Critical (System Down)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Initial Status</label>
                        <select
                          value={ticketForm.status}
                          onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Details & Remarks</label>
                      <textarea
                        rows={3}
                        placeholder="Detail the error logs or user conversation context..."
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-text-main text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-md shadow-brand-teal/5"
                    >
                      Log Support Ticket
                    </button>
                  </form>

                  {/* Support Tickets List */}
                  <div className="space-y-4">
                    <h4 className="text-text-main font-extrabold text-xs">Logged Support Tickets</h4>
                    {!selectedUser.supportTickets || selectedUser.supportTickets.length === 0 ? (
                      <p className="text-slate-400 text-xs font-medium">No tickets raised for this user.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.supportTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="border border-slate-200/80 p-4 rounded-2xl bg-white hover:border-brand-teal/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-[9px] font-extrabold text-brand-teal tracking-wide">{ticket.id}</span>
                                <span className="text-slate-400 text-[10px] font-bold mx-1.5">·</span>
                                <span className="text-[8px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
                                  {ticket.category}
                                </span>
                                <h5 className="text-text-main font-extrabold text-xs mt-1.5">{ticket.title}</h5>
                              </div>
                              <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${
                                ticket.status === 'RESOLVED' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                ticket.status === 'IN_PROGRESS' ? 'text-indigo-700 bg-indigo-50 border-indigo-100' :
                                'text-yellow-700 bg-yellow-50 border-yellow-100'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>

                            {ticket.description && (
                              <p className="text-slate-500 text-xs font-medium leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                {ticket.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-text-muted font-bold border-t border-slate-100 pt-3 flex-wrap gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Raised: {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border tracking-wide uppercase ${
                                ticket.severity === 'CRITICAL' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                                ticket.severity === 'HIGH' ? 'text-orange-600 bg-orange-50 border-orange-100' :
                                ticket.severity === 'MEDIUM' ? 'text-brand-teal bg-teal-50 border-teal-100' :
                                'text-emerald-600 bg-emerald-50 border-emerald-100'
                              }`}>
                                {ticket.severity} Priority
                              </span>
                            </div>

                            {/* Ticket Actions */}
                            <div className="flex justify-end gap-2 mt-1">
                              {ticket.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                                  className="text-[8px] font-extrabold px-2 py-1 rounded bg-brand-green hover:bg-brand-green-hover text-white transition-all shadow-sm"
                                >
                                  Resolve
                                </button>
                              )}
                              {ticket.status === 'OPEN' && (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                                  className="text-[8px] font-extrabold px-2 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm"
                                >
                                  Move In-Progress
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="text-[8px] font-extrabold px-2 py-1 rounded border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove Record
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedUser && (
        <ConfirmDeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          onSuccess={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
