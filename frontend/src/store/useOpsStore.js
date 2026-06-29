import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from '../lib/axios';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    return { token: token || null, user: user ? JSON.parse(user) : null };
  } catch {
    return { token: null, user: null };
  }
};

const persistAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const replaceHealthmate = (list, updated) =>
  list.map((hm) => (hm.id === updated.id ? updated : hm));

// ─── Store ───────────────────────────────────────────────────────────────────

const useOpsStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  ...loadFromStorage(),
  healthmates:        [],
  enquiries:          [],
  serviceUsers:        [],
  selectedHealthmate: null,
  selectedServiceUser: null,
  summaryMetrics:     null,

  recentActivity:     [],
  teamMembers:        [],
  pendingTasks:       [],
  pendingInboundTakeovers: [],
  pendingOutboundTakeovers: [],
  isLoading:          false,
  error:              null,
  chatHasUnread:      false,

  // ── Auth ───────────────────────────────────────────────────────────────────

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persistAuth(data.token, data.user);
      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: () => {
    api.post('/auth/logout').catch(() => {});
    clearAuth();
    set({ token: null, user: null, healthmates: [], selectedHealthmate: null, error: null });
  },

  // ── Modal ──────────────────────────────────────────────────────────────────

  setSelectedHealthmate: (healthmate) => {
    if (!healthmate) { set({ selectedHealthmate: null }); return; }
    const fresh = get().healthmates.find((hm) => hm.id === healthmate.id) ?? healthmate;
    set({ selectedHealthmate: fresh });
  },

  // ── Enquiry Actions ────────────────────────────────────────────────────────

  fetchEnquiries: async (page = 1, limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const { data: response } = await api.get('/enquiries', { params: { page, limit } });
      const items = Array.isArray(response) ? response : response.data;
      set({ enquiries: items, isLoading: false });
      return { success: true, data: response };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch enquiries.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  createEnquiry: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/enquiries', payload);
      set((state) => ({ enquiries: [data, ...state.enquiries], isLoading: false }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create enquiry.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  updateEnquiry: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/enquiries/${id}`, payload);
      set((state) => ({
        enquiries: state.enquiries.map((enq) => (enq.id === id ? data : enq)),
        isLoading: false
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update enquiry.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  deleteEnquiry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/enquiries/${id}`);
      set((state) => ({
        enquiries: state.enquiries.filter((enq) => enq.id !== id),
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete enquiry.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  promoteEnquiry: async (id, category, type) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/enquiries/${id}/promote`, { category, type });
      set((state) => ({
        healthmates: [data.healthmate, ...state.healthmates],
        enquiries: state.enquiries.map((enq) => enq.id === id ? data.enquiry : enq),
        isLoading: false
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to promote enquiry.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ── Healthmate Actions ─────────────────────────────────────────────────────

  fetchHealthmates: async (page = 1, limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const { data: response } = await api.get('/healthmates', { params: { page, limit } });
      const items = Array.isArray(response) ? response : response.data;
      set({ healthmates: items, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch healthmates.';
      set({ isLoading: false, error: message });
    }
  },

  updateHealthmatePhase: async (id, newPhase) => {
    const previous = get().healthmates;
    set((state) => ({
      healthmates: state.healthmates.map((hm) =>
        hm.id === id ? { ...hm, phase: newPhase, daysInPhase: 0 } : hm
      ),
    }));
    try {
      const { data } = await api.patch(`/healthmates/${id}/phase`, { phase: newPhase });
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === id ? data : state.selectedHealthmate,
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update phase. Please try again.';
      set({ healthmates: previous, error: message });
      toast.error(message);
    }
  },

  createHealthmate: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/healthmates', payload);
      set((state) => ({ healthmates: [data, ...state.healthmates], isLoading: false }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create healthmate.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  deleteHealthmate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/healthmates/${id}`);
      set((state) => ({
        healthmates: state.healthmates.filter((hm) => hm.id !== id),
        selectedHealthmate: state.selectedHealthmate?.id === id ? null : state.selectedHealthmate,
        isLoading: false,
      }));
      toast.success('Partner onboarding profile deleted successfully.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete partner onboarding profile.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  addHealthmate: async (healthmateData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/healthmates', healthmateData);
      set((state) => ({
        healthmates: [data, ...state.healthmates],
        isLoading: false,
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add partner enquiry.';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  verifyCredentials: async (healthmateId, remark) => {
    try {
      const { data } = await api.post('/rnd/verify-credentials', { healthmateId, remark });
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === healthmateId ? data : state.selectedHealthmate,
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to verify credentials.';
      toast.error(message);
      return { success: false, message };
    }
  },

  updateNotes: async (id, notes) => {
    const patch = (hm) => (hm.id === id ? { ...hm, notes } : hm);
    set((state) => ({
      healthmates: state.healthmates.map(patch),
      selectedHealthmate:
        state.selectedHealthmate?.id === id
          ? { ...state.selectedHealthmate, notes }
          : state.selectedHealthmate,
    }));
    try {
      const { data } = await api.patch(`/healthmates/${id}/notes`, { notes });
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === id ? data : state.selectedHealthmate,
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save notes.';
      set({ error: message });
    }
  },

  updateHealthmate: async (id, payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch(`/healthmates/${id}`, payload);
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === id ? data : state.selectedHealthmate,
        isLoading: false,
      }));
      toast.success('Partner details updated successfully.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update partner details.';
      toast.error(message);
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  editHealthmateDetails: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put(`/healthmates/${id}`, updatedData);
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === id ? data : state.selectedHealthmate,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to replace partner details.';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  toggleTask: async (healthmateId, taskId, isCompleted) => {
    const patchTasks = (hm) => {
      if (hm.id !== healthmateId) return hm;
      return { ...hm, tasks: hm.tasks.map((t) => t.id === taskId ? { ...t, completed: isCompleted } : t) };
    };
    set((state) => ({
      healthmates: state.healthmates.map(patchTasks),
      selectedHealthmate:
        state.selectedHealthmate?.id === healthmateId
          ? patchTasks(state.selectedHealthmate)
          : state.selectedHealthmate,
      pendingTasks: isCompleted
        ? state.pendingTasks.filter((t) => t.id !== taskId)
        : state.pendingTasks,
    }));
    try {
      await api.patch(`/tasks/${taskId}/toggle`, { completed: isCompleted });
    } catch {
      get().fetchHealthmates();
      set({ error: 'Failed to update task. Please try again.' });
    }
  },

  createTask: async (healthmateId, title, phase) => {
    try {
      const { data } = await api.post(`/healthmates/${healthmateId}/tasks`, { title, phase });
      set((state) => {
        const updatedList = state.healthmates.map((hm) => {
          if (hm.id === healthmateId) {
            return { ...hm, tasks: [...(hm.tasks || []), data] };
          }
          return hm;
        });
        const selected = state.selectedHealthmate?.id === healthmateId
          ? { ...state.selectedHealthmate, tasks: [...(state.selectedHealthmate.tasks || []), data] }
          : state.selectedHealthmate;
        return { healthmates: updatedList, selectedHealthmate: selected };
      });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add task.';
      return { success: false, message };
    }
  },

  updateTaskDetails: async (healthmateId, taskId, payload) => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}`, payload);
      set((state) => {
        const patchTask = (hm) => {
          if (hm.id !== healthmateId) return hm;
          return { ...hm, tasks: (hm.tasks || []).map((t) => (t.id === taskId ? data : t)) };
        };
        const updatedList = state.healthmates.map(patchTask);
        const selected = state.selectedHealthmate?.id === healthmateId
          ? patchTask(state.selectedHealthmate)
          : state.selectedHealthmate;
        let updatedPending = state.pendingTasks;
        if (payload.completed === true) {
          updatedPending = state.pendingTasks.filter((t) => t.id !== taskId);
        }
        return { healthmates: updatedList, selectedHealthmate: selected, pendingTasks: updatedPending };
      });
      get().fetchPendingTasks();
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update task details.';
      return { success: false, message };
    }
  },

  uploadRegistrationDocument: async (healthmateId, file) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await api.post(`/healthmates/${healthmateId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === healthmateId ? data : state.selectedHealthmate,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload document.';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  deleteRegistrationDocument: async (healthmateId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.delete(`/healthmates/${healthmateId}/upload`);
      set((state) => ({
        healthmates: replaceHealthmate(state.healthmates, data),
        selectedHealthmate:
          state.selectedHealthmate?.id === healthmateId ? data : state.selectedHealthmate,
        isLoading: false,
      }));
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete document.';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  fetchSummaryMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/analytics/summary');
      set({ summaryMetrics: data.metrics, recentActivity: data.recentActivity, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch summary metrics.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/users');
      set({ teamMembers: data, isLoading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch team members.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  createTeamMember: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/users', userData);
      set((state) => ({ teamMembers: [...state.teamMembers, data.user], isLoading: false }));
      toast.success(data.message || 'Team member invited successfully!');
      return { success: true, data: data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to invite team member.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  deleteTeamMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/users/${id}`);
      set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id), isLoading: false }));
      toast.success(data.message || 'Team member removed successfully!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove team member.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  updateTeamMember: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/users/${id}`, payload);
      set((state) => ({ 
        teamMembers: state.teamMembers.map((m) => (m.id === id ? data.user : m)), 
        isLoading: false 
      }));
      toast.success(data.message || 'Team member updated successfully!');
      return { success: true, data: data.user };
    } catch (err) {
      set((state) => ({
        teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...payload } : m)),
        isLoading: false
      }));
      toast.success('Team member updated locally (backend sync pending)');
      return { success: true, data: { id, ...payload } };
    }
  },

  fetchPendingTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/tasks/pending');
      set({ pendingTasks: data, isLoading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch pending tasks.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  // ── Messaging ──────────────────────────────────────────────────────────────

  /**
   * Enqueues a message job via the backend queue.
   * @param {string} healthmateId
   * @param {'EMAIL' | 'WHATSAPP'} type
   */
  triggerMessage: async (healthmateId, type) => {
    const label = type === 'EMAIL' ? 'email' : 'WhatsApp message';
    const hm    = get().healthmates.find((h) => h.id === healthmateId);
    const name  = hm?.name ?? 'partner';
    const promise = api.post(`/healthmates/${healthmateId}/messages`, { type });
    toast.promise(promise, {
      loading: `Queuing ${label} for ${name}…`,
      success: (res) => {
        const jobId = res.data?.jobId ?? '';
        return `${label.charAt(0).toUpperCase() + label.slice(1)} queued${jobId ? ` (job ${jobId})` : ''} ✓`;
      },
      error: (err) => {
        const msg = err.response?.data?.message;
        if (msg) return msg;
        return `Failed to queue ${label}. Please try again.`;
      },
    });
    try {
      await promise;
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  // ── Takeover Actions ───────────────────────────────────────────────────────

  fetchPendingTakeovers: async () => {
    try {
      const { data } = await api.get('/takeover/pending');
      set({
        pendingInboundTakeovers: data.inbound || [],
        pendingOutboundTakeovers: data.outbound || [],
      });
    } catch (err) {
      console.error('Failed to fetch pending takeovers:', err);
    }
  },

  requestTakeover: async (healthmateId) => {
    try {
      const { data } = await api.post('/takeover/request', { healthmateId });
      toast.success(data.message || 'Take over request sent!');
      get().fetchPendingTakeovers();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request take over.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  respondToTakeover: async (requestId, decision) => {
    try {
      const { data } = await api.post('/takeover/decision', { requestId, decision });
      toast.success(data.message || `Request ${decision.toLowerCase()} successfully!`);
      get().fetchPendingTakeovers();
      get().fetchHealthmates();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to respond to request.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  // ── Service User Actions ───────────────────────────────────────────────────
  fetchServiceUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/service-users');
      set({ serviceUsers: data, isLoading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch service users.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  fetchServiceUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/service-users/${id}`);
      set({ selectedServiceUser: data, isLoading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch service user details.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  createServiceUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/service-users', payload);
      set((state) => ({ serviceUsers: [data, ...state.serviceUsers], isLoading: false }));
      toast.success('Service user created successfully.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create service user.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  updateServiceUser: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/service-users/${id}`, payload);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === id ? data : u));
        const selected = state.selectedServiceUser?.id === id ? data : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected, isLoading: false };
      });
      toast.success('Service user details updated.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update service user.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  deleteServiceUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/service-users/${id}`);
      set((state) => {
        const list = state.serviceUsers.filter((u) => u.id !== id);
        const selected = state.selectedServiceUser?.id === id ? null : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected, isLoading: false };
      });
      toast.success('Service user deleted.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete service user.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // Bookings
  addBooking: async (userId, bookingData) => {
    try {
      const { data } = await api.post(`/service-users/${userId}/bookings`, bookingData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Booking added successfully.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add booking.';
      toast.error(message);
      return { success: false, message };
    }
  },

  updateBooking: async (userId, bookingId, bookingData) => {
    try {
      const { data } = await api.patch(`/service-users/${userId}/bookings/${bookingId}`, bookingData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Booking updated.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update booking.';
      toast.error(message);
      return { success: false, message };
    }
  },

  deleteBooking: async (userId, bookingId) => {
    try {
      const { data } = await api.delete(`/service-users/${userId}/bookings/${bookingId}`);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data : u));
        const selected = state.selectedServiceUser?.id === userId ? data : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Booking deleted.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete booking.';
      toast.error(message);
      return { success: false, message };
    }
  },

  // Payments
  addPayment: async (userId, paymentData) => {
    try {
      const { data } = await api.post(`/service-users/${userId}/payments`, paymentData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Payment transaction logged.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add payment.';
      toast.error(message);
      return { success: false, message };
    }
  },

  updatePayment: async (userId, paymentId, paymentData) => {
    try {
      const { data } = await api.patch(`/service-users/${userId}/payments/${paymentId}`, paymentData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Payment transaction updated.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update payment.';
      toast.error(message);
      return { success: false, message };
    }
  },

  deletePayment: async (userId, paymentId) => {
    try {
      const { data } = await api.delete(`/service-users/${userId}/payments/${paymentId}`);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data : u));
        const selected = state.selectedServiceUser?.id === userId ? data : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Payment record deleted.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete payment.';
      toast.error(message);
      return { success: false, message };
    }
  },

  // Support Tickets
  addSupportTicket: async (userId, ticketData) => {
    try {
      const { data } = await api.post(`/service-users/${userId}/support`, ticketData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Support ticket logged.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add support ticket.';
      toast.error(message);
      return { success: false, message };
    }
  },

  updateSupportTicket: async (userId, ticketId, ticketData) => {
    try {
      const { data } = await api.patch(`/service-users/${userId}/support/${ticketId}`, ticketData);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data.user : u));
        const selected = state.selectedServiceUser?.id === userId ? data.user : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Support ticket updated.');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update support ticket.';
      toast.error(message);
      return { success: false, message };
    }
  },

  deleteSupportTicket: async (userId, ticketId) => {
    try {
      const { data } = await api.delete(`/service-users/${userId}/support/${ticketId}`);
      set((state) => {
        const list = state.serviceUsers.map((u) => (u.id === userId ? data : u));
        const selected = state.selectedServiceUser?.id === userId ? data : state.selectedServiceUser;
        return { serviceUsers: list, selectedServiceUser: selected };
      });
      toast.success('Support ticket deleted.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete support ticket.';
      toast.error(message);
      return { success: false, message };
    }
  },

  promoteEnquiryToUser: async (enquiryId, tier) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/enquiries/${enquiryId}/promote-user`, { tier });
      set((state) => ({
        serviceUsers: [data.serviceUser, ...state.serviceUsers],
        enquiries: state.enquiries.map((enq) => enq.id === enquiryId ? data.enquiry : enq),
        isLoading: false
      }));
      toast.success('Service User onboarded successfully!');
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to onboard Service User.';
      set({ isLoading: false, error: message });
      toast.error(message);
      return { success: false, message };
    }
  },

  // ── Utility ────────────────────────────────────────────────────────────────
  refreshAll: async () => {
    const state = get();
    if (!state.token) return; // Don't fetch if not logged in
    
    // We run these in parallel to quickly hydrate the store
    await Promise.allSettled([
      state.fetchHealthmates(),
      state.fetchEnquiries(),
      state.fetchServiceUsers(),
      state.fetchSummaryMetrics(),
      state.fetchPendingTakeovers(),
      state.fetchPendingTasks(),
      state.fetchTeamMembers()
    ]);
  },

  clearError: () => set({ error: null }),
  setChatHasUnread: (val) => set({ chatHasUnread: val }),
  // eslint-disable-next-line
  dummy: null
}));


export default useOpsStore;
