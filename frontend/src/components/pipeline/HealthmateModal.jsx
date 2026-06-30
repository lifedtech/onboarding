import { useEffect, useRef, useState } from 'react';
import {
  X, Mail, Phone, Tag, GitBranch, CheckSquare, Square,
  Save, MessageCircle, Send, ChevronRight, Loader2, Clock, Edit3, Trash2, User,
  Calendar, Layers, BookOpen, CheckCircle2, FileText, AlertTriangle
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import CategorySelector from './CategorySelector';
import LocationSelector from '../LocationSelector';

// ─── Phase config ─────────────────────────────────────────────────────────────

const PHASES = ['PRE_QUALIFY', 'REGISTER', 'PREPARE', 'REVIEW', 'LIVE'];

const PHASE_LABELS = {
  PRE_QUALIFY: 'Pre-Qualify',
  PREPARE:     'Prepare',
  REGISTER:    'Register',
  REVIEW:      'Review',
  LIVE:        'Live',
};

const PHASE_COLORS = {
  PRE_QUALIFY: 'text-slate-600 bg-slate-100 border-slate-200',
  PREPARE:     'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  REGISTER:    'text-amber-700 bg-amber-50 border-amber-200',
  REVIEW:      'text-purple-700 bg-purple-50 border-purple-200',
  LIVE:        'text-brand-green bg-brand-green/10 border-brand-green/20',
};

const TYPE_LABELS = {
  PRACTITIONER: 'Practitioner',
  CENTRE:       'Centre',
  ORGANIZER:    'Organizer',
};

const DEFAULT_TASKS = {
  PRE_QUALIFY: [
    "Schedule a call to explain Lifed",
    "Score the healthmate",
    "Schedule the follow ups",
    "Identify the program that Lifed can co-create"
  ],
  REGISTER: [
    "Do a call on the registration process",
    "Validate the credentials",
    "Validate bank account",
    "Approve the healthmate account",
    "Send a video explaining the program builder and the program management dashboard"
  ],
  PREPARE: [
    "Schedule a call to explain the Healthmate dashboard and program builder",
    "Collect the details about the program",
    "Categorize them into a) ready to be live, b) have to co - create and curate",
    "If ready to be live, have a follow-up and make them submit the program",
    "If co-create, then R/D curate and take suggestions from healthmate, then submit for review"
  ],
  REVIEW: [
    "Review the program with complete validation",
    "If rectification needed, schedule a call and sit with them and complete the process",
    "If program is ready to be Live, Send a SOP for program conduction."
  ],
  LIVE: [
    "Once the program is live, schedule follow up to make them share in their accounts",
    "Send a welcome kit (digital, first 100 send a physical one)",
    "Review the program in 10 days",
    "If no booking in 10 days, trigger the sales and marketing team."
  ]
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthmateModal({ viewOnlyHealthmate = null, onCloseViewOnly = null }) {
  const selectedHealthmate    = useOpsStore((s) => s.selectedHealthmate);
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);
  const updateNotes           = useOpsStore((s) => s.updateNotes);
  const updateHealthmate      = useOpsStore((s) => s.updateHealthmate);
  const toggleTask            = useOpsStore((s) => s.toggleTask);
  const updateHealthmatePhase = useOpsStore((s) => s.updateHealthmatePhase);
  const triggerMessage        = useOpsStore((s) => s.triggerMessage);
  const editHealthmateDetails = useOpsStore((s) => s.editHealthmateDetails);
  const updateHealthmateQualification = useOpsStore((s) => s.updateHealthmateQualification);
  const createTask            = useOpsStore((s) => s.createTask);
  const uploadRegistrationDocument = useOpsStore((s) => s.uploadRegistrationDocument);
  const deleteRegistrationDocument = useOpsStore((s) => s.deleteRegistrationDocument);
  const deleteHealthmate      = useOpsStore((s) => s.deleteHealthmate);
  const user                  = useOpsStore((s) => s.user);
  const pendingOutboundTakeovers = useOpsStore((s) => s.pendingOutboundTakeovers);
  const requestTakeover       = useOpsStore((s) => s.requestTakeover);
  const fetchPendingTakeovers = useOpsStore((s) => s.fetchPendingTakeovers);
  const verifyCredentials     = useOpsStore((s) => s.verifyCredentials);

  const [activeTab, setActiveTab]     = useState('details'); // 'details' | 'screening'
  const [notes, setNotes]             = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved]   = useState(false);

  const [screeningRemarks, setScreeningRemarks] = useState('');
  const [screeningRemarksSaving, setScreeningRemarksSaving] = useState(false);
  const [screeningRemarksSaved, setScreeningRemarksSaved] = useState(false);

  const [screeningQueries, setScreeningQueries] = useState('');
  const [screeningQueriesSaving, setScreeningQueriesSaving] = useState(false);
  const [screeningQueriesSaved, setScreeningQueriesSaved] = useState(false);

  const [recallReminder, setRecallReminder] = useState('');
  const [reminderSaving, setReminderSaving] = useState(false);

  const [programTitle, setProgramTitle] = useState('');
  const [programStartDate, setProgramStartDate] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');
  const [savingProgram, setSavingProgram] = useState(false);

  const [regStatus, setRegStatus] = useState('PENDING');
  const [regRemark, setRegRemark] = useState('');
  const [progStatus, setProgStatus] = useState('PENDING');
  const [progMsg, setProgMsg] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  // Per-button sending state to prevent double-clicks
  const [sending, setSending] = useState({ EMAIL: false, WHATSAPP: false });

  // Inline edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('PRACTITIONER');
  const [editCategory, setEditCategory] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editAlternatePhone, setEditAlternatePhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editPlatformFound, setEditPlatformFound] = useState('');
  const [editProgramPossibility, setEditProgramPossibility] = useState('');
  const [editFormat, setEditFormat] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

  // Qualification states
  const [qScores, setQScores] = useState({
    scoreRelevance: 0,
    scoreSafety: 0,
    scoreExperience: 0,
    scoreCredibility: 0,
    scoreLocation: 0,
    scoreVisual: 0,
    scoreBooking: 0,
    scoreUniqueness: 0,
    scoreCorporate: 0,
    scoreRepeatability: 0
  });
  const [qSaving, setQSaving] = useState(false);
  const [qSaved, setQSaved] = useState(false);

  // Add-task form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskAdding, setTaskAdding] = useState(false);

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(false);

  // Delete confirm modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState(false);

  // Revert confirm modal states
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertingPhase, setRevertingPhase] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync notes and edit states when modal opens or healthmate changes
  useEffect(() => {
    if (selectedHealthmate) {
      setNotes(selectedHealthmate.notes ?? '');
      setNotesSaved(false);
      setSending({ EMAIL: false, WHATSAPP: false });
      setIsEditing(false);
      setNewTaskTitle('');
      setShowDeleteConfirm(false);
      setDeletingPartner(false);
      setShowRevertConfirm(false);
      setRevertingPhase(false);

      setEditName(selectedHealthmate.name);
      setEditType(selectedHealthmate.type);
      setEditCategory(selectedHealthmate.category);
      setEditContactName(selectedHealthmate.contactName ?? '');
      setEditContactEmail(selectedHealthmate.contactEmail ?? '');
      setEditContactPhone(selectedHealthmate.contactPhone || '');
      setEditAlternatePhone(selectedHealthmate.alternatePhone || '');
      setEditCity(selectedHealthmate.city || '');
      setEditState(selectedHealthmate.state || '');
      setEditCountry(selectedHealthmate.country || '');
      setEditSubcategory(selectedHealthmate.subcategory || '');
      setEditPlatformFound(selectedHealthmate.platformFound || '');
      setEditProgramPossibility(selectedHealthmate.programPossibility || '');
      setEditFormat(selectedHealthmate.format || '');
      setEditPriceRange(selectedHealthmate.priceRange || '');
      setEditCapacity(selectedHealthmate.capacity || '');

      if (selectedHealthmate.qualification) {
        setQScores(selectedHealthmate.qualification);
      } else {
        setQScores({
          scoreRelevance: 0, scoreSafety: 0, scoreExperience: 0, scoreCredibility: 0,
          scoreLocation: 0, scoreVisual: 0, scoreBooking: 0, scoreUniqueness: 0,
          scoreCorporate: 0, scoreRepeatability: 0
        });
      }
      setQSaved(false);

      setScreeningRemarks(selectedHealthmate.screeningRemarks ?? '');
      setScreeningRemarksSaved(false);
      setScreeningQueries(selectedHealthmate.screeningQueries ?? '');
      setScreeningQueriesSaved(false);

      if (selectedHealthmate.recallReminder) {
        const d = new Date(selectedHealthmate.recallReminder);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
        setRecallReminder(localISOTime);
      } else {
        setRecallReminder('');
      }

      setProgramTitle(selectedHealthmate.programTitle ?? '');
      setProgramStartDate(selectedHealthmate.programStartDate ? new Date(selectedHealthmate.programStartDate).toISOString().split('T')[0] : '');
      setProgramEndDate(selectedHealthmate.programEndDate ? new Date(selectedHealthmate.programEndDate).toISOString().split('T')[0] : '');

      setRegStatus(selectedHealthmate.registrationStatus ?? 'PENDING');
      setRegRemark(selectedHealthmate.registrationRemark ?? '');
      setProgStatus(selectedHealthmate.programStatus ?? 'PENDING');
      setProgMsg(selectedHealthmate.programApprovedMsg ?? '');

      setActiveTab(selectedHealthmate.phase === 'PRE_QUALIFY' ? 'screening' : 'details');
    }
  }, [selectedHealthmate?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelectedHealthmate(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSelectedHealthmate]);



  const hm = viewOnlyHealthmate || selectedHealthmate;
  const isViewOnly = !!viewOnlyHealthmate;

  useEffect(() => {
    if (hm) {
      fetchPendingTakeovers();
    }
  }, [hm?.id, fetchPendingTakeovers]);

  if (!hm) return null;

  const isAdmin      = user?.role?.toUpperCase() === 'ADMIN';
  const canModify    = !isViewOnly && (isAdmin || (hm.opsUserId === user?.id));
  const scopes       = user?.accessScopes || [];
  const hasFullAccess = isAdmin || scopes.includes('FULL_ACCESS');
  const isMarketingOnly = !hasFullAccess && !scopes.includes('HEALTHMATES') && scopes.includes('SALES_MARKETING');
  const isPending    = pendingOutboundTakeovers.some((req) => req.healthmateId === hm.id && req.status === 'PENDING');
  const currentIndex = PHASES.indexOf(hm.phase);
  const nextPhase    = PHASES[currentIndex + 1] ?? null;
  const prevPhase    = PHASES[currentIndex - 1] ?? null;
  const tasks        = hm.tasks ?? [];
  const doneTasks    = tasks.filter((t) => t.completed).length;

  // Group tasks by phase
  const groupedTasks = PHASES.reduce((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.phase === phase);
    return acc;
  }, {});

  const currentPhaseTasks = DEFAULT_TASKS[hm.phase] || [];
  const missingPredefined = currentPhaseTasks.filter(
    (title) => !tasks.some((t) => t.title.toLowerCase() === title.toLowerCase())
  );

  const currentPhaseTasksItems = groupedTasks[hm.phase] || [];
  const allCurrentTasksCompleted = currentPhaseTasksItems.every((t) => t.completed);
  const canAdvancePhase = canModify && missingPredefined.length === 0 && allCurrentTasksCompleted;

  const getPhaseHeaderClass = (phase, isCurrent, isPast) => {
    if (isCurrent) return 'bg-brand-teal text-white border-brand-teal shadow-sm ring-1 ring-brand-teal/50';
    if (isPast) return 'bg-slate-100 border-slate-200 text-slate-500 opacity-80';
    return 'bg-slate-50 border-slate-200 text-slate-500 opacity-60';
  };

  const handleSaveProgramDetails = async () => {
    setSavingProgram(true);
    const result = await updateHealthmate(hm.id, {
      programTitle,
      programStartDate: programStartDate ? new Date(programStartDate).toISOString() : null,
      programEndDate: programEndDate ? new Date(programEndDate).toISOString() : null,
    });
    setSavingProgram(false);
    if (result && result.success) {
      toast.success('Program details saved!');
    } else {
      toast.error('Failed to save program details.');
    }
  };

  const handleSimulateRDApproval = async () => {
    if (!programTitle) {
      toast.error('Please enter a Program Title first.');
      return;
    }
    setSavingProgram(true);
    const start = programStartDate || new Date().toISOString().split('T')[0];
    const end = programEndDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setProgramStartDate(start);
    setProgramEndDate(end);

    const result = await updateHealthmate(hm.id, {
      programStatus: 'APPROVED',
      programApprovedMsg: `R&D Team: The proposed health program "${programTitle}" has been reviewed and meets all standard clinical & operational protocols. Approved for public listings.`,
      programTitle,
      programStartDate: new Date(start).toISOString(),
      programEndDate: new Date(end).toISOString(),
    });
    setSavingProgram(false);
    if (result && result.success) {
      toast.success('R&D approval simulated successfully!');
    } else {
      toast.error('Failed to approve program.');
    }
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    await updateNotes(hm.id, notes);
    setNotesSaving(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleSimulateRDVerification = async () => {
    const result = await verifyCredentials(hm.id, 'Credentials verified successfully via simulated R&D API request.');
    if (result && result.success) {
      toast.success('R&D Credentials verified successfully!');
    }
  };

  const handleSaveManualVerification = async () => {
    setSavingManual(true);
    let result;
    if (regStatus === 'VERIFIED' && hm.registrationStatus !== 'VERIFIED') {
      result = await verifyCredentials(hm.id, regRemark || 'Verified manually');
      if (result && result.success) {
        result = await updateHealthmate(hm.id, {
          programStatus: progStatus,
          programApprovedMsg: progMsg || null,
        });
      }
    } else {
      result = await updateHealthmate(hm.id, {
        registrationStatus: regStatus,
        registrationRemark: regRemark || null,
        programStatus: progStatus,
        programApprovedMsg: progMsg || null,
      });
    }
    setSavingManual(false);
    if (result && result.success) {
      toast.success('Status overrides saved!');
    }
  };

  const handleSaveScreeningRemarks = async () => {
    setScreeningRemarksSaving(true);
    const result = await updateHealthmate(hm.id, { screeningRemarks: screeningRemarks.trim() || null });
    setScreeningRemarksSaving(false);
    if (result && result.success) {
      setScreeningRemarksSaved(true);
      setTimeout(() => setScreeningRemarksSaved(false), 2000);
    }
  };

  const handleSaveScreeningQueries = async () => {
    setScreeningQueriesSaving(true);
    const result = await updateHealthmate(hm.id, { screeningQueries: screeningQueries.trim() || null });
    setScreeningQueriesSaving(false);
    if (result && result.success) {
      setScreeningQueriesSaved(true);
      setTimeout(() => setScreeningQueriesSaved(false), 2000);
    }
  };

  const handleSaveReminder = async () => {
    if (!recallReminder) {
      toast.error('Please select a date and time.');
      return;
    }
    setReminderSaving(true);
    const result = await updateHealthmate(hm.id, { recallReminder: new Date(recallReminder).toISOString() });
    setReminderSaving(false);
    if (result && result.success) {
      toast.success('Recall reminder set successfully.');
    }
  };

  const handleClearReminder = async () => {
    setReminderSaving(true);
    const result = await updateHealthmate(hm.id, { recallReminder: null });
    setReminderSaving(false);
    if (result && result.success) {
      setRecallReminder('');
      toast.success('Recall reminder cleared.');
    }
  };

  const handleToggleTask = (taskId, current) => {
    toggleTask(hm.id, taskId, !current);
  };

  const handleAdvancePhase = async () => {
    if (!nextPhase) return;
    const success = await updateHealthmatePhase(hm.id, nextPhase);
    if (success) {
      setSelectedHealthmate(null);
    }
  };

  const handleRevertPhase = () => {
    if (!prevPhase) return;
    setShowRevertConfirm(true);
  };

  const handleConfirmRevert = async () => {
    if (!prevPhase) return;
    setRevertingPhase(true);
    const success = await updateHealthmatePhase(hm.id, prevPhase);
    setRevertingPhase(false);
    if (success) {
      setSelectedHealthmate(null);
      setShowRevertConfirm(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editName.trim() || !editCategory.trim()) {
      return;
    }
    const result = await editHealthmateDetails(hm.id, {
      name: editName.trim(),
      type: editType,
      category: editCategory.trim(),
      contactName: editContactName.trim() || null,
      contactEmail: editContactEmail.trim() || null,
      contactPhone: editContactPhone.trim() || null,
      alternatePhone: editAlternatePhone.trim() || null,
      city: editCity.trim() || null,
      state: editState.trim() || null,
      country: editCountry.trim() || null,
      subcategory: editSubcategory.trim() || null,
      platformFound: editPlatformFound.trim() || null,
      programPossibility: editProgramPossibility.trim() || null,
      format: editFormat.trim() || null,
      priceRange: editPriceRange.trim() || null,
      capacity: editCapacity.trim() || null,
      notes: notes.trim() || null,
    });
    if (result && result.success) {
      toast.success('Partner details updated successfully.');
      setIsEditing(false);
    } else {
      toast.error(result.message || 'Failed to update partner details.');
    }
  };

  const handleSaveQualification = async () => {
    setQSaving(true);
    const result = await updateHealthmateQualification(hm.id, qScores);
    setQSaving(false);
    if (result && result.success) {
      setQSaved(true);
      setTimeout(() => setQSaved(false), 2000);
      toast.success('Qualification scores updated!');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setTaskAdding(true);
    const result = await createTask(hm.id, newTaskTitle.trim(), hm.phase);
    setTaskAdding(false);

    if (result && result.success) {
      setNewTaskTitle('');
      toast.success('Task added successfully.');
    } else {
      toast.error(result.message || 'Failed to add task.');
    }
  };

  const handleAddPredefinedTask = async (title) => {
    await createTask(hm.id, title, hm.phase);
    toast.success(`Task "${title}" added.`);
  };

  const handleLoadAllPredefined = async () => {
    toast.loading('Adding predefined tasks...', { id: 'predefined-toast' });
    for (const title of missingPredefined) {
      await createTask(hm.id, title, hm.phase);
    }
    toast.success('All predefined tasks added.', { id: 'predefined-toast' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setUploadingDoc(true);
    toast.loading('Uploading document...', { id: 'upload-toast' });
    const result = await uploadRegistrationDocument(hm.id, file);
    setUploadingDoc(false);

    if (result && result.success) {
      toast.success('Document uploaded and task verified!', { id: 'upload-toast' });
    } else {
      toast.error(result.message || 'Failed to upload document.', { id: 'upload-toast' });
    }
  };

  const handleDeleteDoc = async () => {
    if (!window.confirm('Are you sure you want to delete this document? This will remove the file permanently.')) return;

    setDeletingDoc(true);
    toast.loading('Deleting document...', { id: 'delete-toast' });
    const result = await deleteRegistrationDocument(hm.id);
    setDeletingDoc(false);

    if (result && result.success) {
      toast.success('Document deleted successfully.', { id: 'delete-toast' });
    } else {
      toast.error(result.message || 'Failed to delete document.', { id: 'delete-toast' });
    }
  };

  /**
   * Handles both WhatsApp and Email sends.
   */
  const handleSendMessage = async (type) => {
    if (sending[type]) return;                          // guard double-click
    setSending((prev) => ({ ...prev, [type]: true }));
    try {
      await triggerMessage(hm.id, type);
    } finally {
      // Always re-enable — toast already shows success/error
      setSending((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDeleteHealthmate = async () => {
    setDeletingPartner(true);
    const toastId = toast.loading('Deleting partner profile...');
    const result = await deleteHealthmate(hm.id);
    toast.dismiss(toastId);
    setDeletingPartner(false);
    if (result && result.success) {
      setSelectedHealthmate(null);
      setShowDeleteConfirm(false);
    } else {
      toast.error('Failed to delete partner profile.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#2C3E50]/60 backdrop-blur-md"
        onClick={() => setSelectedHealthmate(null)}
      />

      {/* Modal panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={`${hm.name} details`}
      >
        <div
          className="relative w-full max-w-7xl max-h-[90vh] bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* R&D Credential Status Bar */}
          <div 
            className={`w-full h-2 shrink-0 ${
              hm.registrationStatus === 'VERIFIED'
                ? 'bg-brand-green'
                : hm.registrationStatus === 'ESCALATED'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-slate-300'
            }`} 
            title={`R&D Credentials: ${hm.registrationStatus || 'PENDING'}`} 
          />
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-leaf/40 shrink-0 bg-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h2 className="text-text-main font-extrabold text-lg leading-tight truncate">
                  {hm.name}
                </h2>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${PHASE_COLORS[hm.phase]}`}>
                  {PHASE_LABELS[hm.phase]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-muted/80 text-xs font-semibold">
                <span>{TYPE_LABELS[hm.type] ?? hm.type}</span>
                <span>·</span>
                <span>{hm.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
                  {hm.daysInPhase}d in phase
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {canModify && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl p-1.5 transition-colors"
                  title="Delete Partner"
                  aria-label="Delete Partner"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => isViewOnly ? onCloseViewOnly?.() : setSelectedHealthmate(null)}
                className="shrink-0 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white divide-y md:divide-y-0 md:divide-x divide-border-leaf/40">

            {/* Left: Contact Info + Notes */}
            <div className="flex-1 md:w-1/2 p-6 space-y-5 overflow-y-auto min-h-0">
                {/* Status Banners for View Only */}
                {isViewOnly && (
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className={`p-4 rounded-2xl flex flex-col border ${PHASE_COLORS[hm.phase]}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1">
                        Current Phase
                      </span>
                      <span className="text-sm font-black uppercase tracking-wider">
                        {PHASE_LABELS[hm.phase]}
                      </span>
                    </div>

                    <div className={`p-4 rounded-2xl flex flex-col border ${
                      hm.registrationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1">
                        {hm.registrationStatus === 'VERIFIED' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        Registration Status
                      </span>
                      <span className="text-sm font-black uppercase tracking-wider">
                        {hm.registrationStatus || 'PENDING'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Take Over Lock notice */}
                {!canModify && !isViewOnly && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 flex flex-col gap-2 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <h4 className="text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                        Access Locked
                      </h4>
                    </div>
                    <p className="text-amber-900/80 text-xs font-semibold leading-relaxed">
                      Only the assigned coordinator (<span className="font-extrabold text-amber-800">{hm.opsUser?.name || 'Unassigned'}</span>) or an Administrator can modify this partner.
                    </p>
                    <div className="mt-1">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-extrabold bg-amber-100/50 px-3 py-1.5 rounded-xl border border-amber-200/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                          Take over request pending approval...
                        </div>
                      ) : (
                        <button
                          onClick={() => requestTakeover(hm.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                          Take Over
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs Header */}
                <div className="flex border-b border-border-leaf/35 mb-4 gap-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === 'details'
                        ? 'border-brand-teal text-brand-teal'
                        : 'border-transparent text-text-muted/60 hover:text-text-main'
                    }`}
                  >
                    Details & Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('screening')}
                    className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'screening'
                        ? 'border-brand-teal text-brand-teal'
                        : 'border-transparent text-text-muted/60 hover:text-text-main'
                    }`}
                  >
                    Screening & Recall
                    {hm.recallReminder && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${new Date(hm.recallReminder) < new Date() ? 'bg-red-500 animate-pulse' : 'bg-brand-teal'}`} />
                    )}
                  </button>
                  {(hm.phase === 'PREPARE' || hm.phase === 'REVIEW' || hm.phase === 'LIVE') && (
                    <button
                      onClick={() => setActiveTab('rdReview')}
                      className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'rdReview'
                          ? 'border-brand-teal text-brand-teal'
                          : 'border-transparent text-text-muted/60 hover:text-text-main'
                      }`}
                    >
                      R&D Review
                    </button>
                  )}
                  {(hm.phase === 'PRE_QUALIFY' || hm.phase === 'REGISTER') && (
                    <button
                      onClick={() => setActiveTab('qualification')}
                      className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === 'qualification'
                          ? 'border-brand-teal text-brand-teal'
                          : 'border-transparent text-text-muted/60 hover:text-text-main'
                      }`}
                    >
                      Qualification
                    </button>
                  )}
                </div>

                {activeTab === 'details' && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider">
                          Contact Info
                        </h3>
                        {!isEditing && canModify && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-brand-teal hover:text-brand-teal-hover text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit Details
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-border-leaf/45">
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Company / Partner Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Partner Type</label>
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            >
                              <option value="PRACTITIONER">Practitioner</option>
                              <option value="CENTRE">Centre</option>
                              <option value="ORGANIZER">Organizer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Contact Person Name</label>
                            <input
                              type="text"
                              value={editContactName}
                              onChange={(e) => setEditContactName(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Contact Email</label>
                            <input
                              type="email"
                              value={isMarketingOnly ? '***@***.***' : editContactEmail}
                              onChange={(e) => setEditContactEmail(e.target.value)}
                              disabled={isMarketingOnly}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Contact Phone</label>
                            <input
                              type="tel"
                              value={isMarketingOnly ? '+** **** ****' : editContactPhone}
                              onChange={(e) => setEditContactPhone(e.target.value)}
                              disabled={isMarketingOnly}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Alternate Phone</label>
                            <input
                              type="tel"
                              value={isMarketingOnly ? '+** **** ****' : editAlternatePhone}
                              onChange={(e) => setEditAlternatePhone(e.target.value)}
                              disabled={isMarketingOnly}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                              placeholder="e.g. +91 9876543210"
                            />
                          </div>
                          <LocationSelector
                            city={editCity}
                            setCity={setEditCity}
                            state={editState}
                            setState={setEditState}
                            country={editCountry}
                            setCountry={setEditCountry}
                            layout="fragment"
                          />
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Subcategory</label>
                            <input
                              type="text"
                              value={editSubcategory}
                              onChange={(e) => setEditSubcategory(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Platform Found</label>
                            <input
                              type="text"
                              value={editPlatformFound}
                              onChange={(e) => setEditPlatformFound(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Program Possibility</label>
                            <input
                              type="text"
                              value={editProgramPossibility}
                              onChange={(e) => setEditProgramPossibility(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Format</label>
                            <input
                              type="text"
                              value={editFormat}
                              onChange={(e) => setEditFormat(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Price Range</label>
                            <input
                              type="text"
                              value={editPriceRange}
                              onChange={(e) => setEditPriceRange(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Capacity</label>
                            <input
                              type="text"
                              value={editCapacity}
                              onChange={(e) => setEditCapacity(e.target.value)}
                              className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                            />
                          </div>
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Category</label>
                            <CategorySelector
                              value={editCategory}
                              onChange={setEditCategory}
                              disabled={false}
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={handleSaveChanges}
                              className="bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="bg-white hover:bg-slate-50 text-text-main border border-border-leaf text-xs font-bold px-3 py-2 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {hm.contactName && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Name" value={hm.contactName} />
                          )}
                          {hm.contactEmail && (
                            <InfoRow
                              icon={<Mail className="w-4 h-4 text-brand-teal" />}
                              label="Email"
                              value={isMarketingOnly ? '***@***.***' : hm.contactEmail}
                            />
                          )}
                          {hm.contactPhone && (
                            <InfoRow
                              icon={<Phone className="w-4 h-4 text-brand-teal" />}
                              label="Phone"
                              value={isMarketingOnly ? '+** **** ****' : hm.contactPhone}
                            />
                          )}
                          {hm.alternatePhone && (
                            <InfoRow
                              icon={<Phone className="w-4 h-4 text-brand-teal" />}
                              label="Alternate Phone"
                              value={isMarketingOnly ? '+** **** ****' : hm.alternatePhone}
                            />
                          )}
                          {hm.subcategory && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Subcategory" value={hm.subcategory} />
                          )}
                          {hm.platformFound && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Platform Found" value={hm.platformFound} />
                          )}
                          {hm.programPossibility && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Program Possibility" value={hm.programPossibility} />
                          )}
                          {hm.format && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Format" value={hm.format} />
                          )}
                          {hm.priceRange && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Price Range" value={hm.priceRange} />
                          )}
                          {hm.capacity && (
                            <InfoRow icon={<Tag className="w-4 h-4 text-brand-teal" />} label="Capacity" value={hm.capacity} />
                          )}
                          {(hm.city || hm.state || hm.country) && (
                            <InfoRow 
                              icon={<GitBranch className="w-4 h-4 text-brand-teal" />} 
                              label="Location" 
                              value={[hm.city, hm.state, hm.country].filter(Boolean).join(', ')} 
                            />
                          )}
                          <InfoRow icon={<GitBranch className="w-4 h-4 text-brand-teal" />} label="Category" value={hm.category} />
                          <InfoRow
                            icon={<User className="w-4 h-4 text-brand-teal" />}
                            label="Assignee"
                            value={
                              <span className="flex items-center gap-1.5 font-extrabold text-text-main">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hm.opsUser?.isOnline ? 'bg-brand-green' : 'bg-red-400'}`} />
                                {hm.opsUser?.name || 'Unassigned'}
                              </span>
                            }
                          />
                          <InfoRow
                            icon={<CheckCircle2 className="w-4 h-4 text-brand-teal" />}
                            label="R&D Status"
                            value={
                              <span className={`inline-flex items-center gap-1 font-extrabold ${
                                hm.registrationStatus === 'VERIFIED'
                                  ? 'text-brand-green'
                                  : hm.registrationStatus === 'ESCALATED'
                                    ? 'text-red-500 animate-pulse'
                                    : 'text-text-muted/60'
                              }`}>
                                {hm.registrationStatus || 'PENDING'}
                              </span>
                            }
                          />
                          {hm.registrationRemark && (
                            <InfoRow
                              icon={<FileText className="w-4 h-4 text-brand-teal" />}
                              label="R&D Remarks"
                              value={<span className="italic font-bold text-text-main">"{hm.registrationRemark}"</span>}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider mb-3">
                        Internal Notes
                      </h3>
                      <textarea
                        ref={textareaRef}
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
                        placeholder={canModify ? "Add internal notes about this partner…" : "Only the assignee can edit notes…"}
                        disabled={!canModify}
                        rows={5}
                        className="w-full bg-slate-50 border border-border-leaf/70 text-text-main placeholder-text-muted/40
                                   rounded-2xl px-4 py-3 text-sm font-medium resize-none
                                   focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                                   transition-all duration-200"
                      />
                      {canModify && (
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-bold transition-all ${notesSaved ? 'text-brand-green' : 'text-transparent'}`}>
                            ✓ Saved
                          </span>
                          <button
                            onClick={handleSaveNotes}
                            disabled={notesSaving}
                            className="flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50
                                       text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
                          >
                            {notesSaving
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Save className="w-3.5 h-3.5" />
                            }
                            {notesSaving ? 'Saving…' : 'Save Notes'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'screening' && (
                  <div className="space-y-6">
                    {/* Screening Call Remarks */}
                    <div>
                      <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider mb-2">
                        Screening Call Remarks
                      </h3>
                      <p className="text-[10px] text-text-muted/80 font-semibold mb-2">
                        Remarks and notes recorded during the initial screening call.
                      </p>
                      <textarea
                        value={screeningRemarks}
                        onChange={(e) => { setScreeningRemarks(e.target.value); setScreeningRemarksSaved(false); }}
                        placeholder={canModify ? "Add screening call remarks..." : "Only the assignee can edit remarks..."}
                        disabled={!canModify}
                        rows={4}
                        className="w-full bg-slate-50 border border-border-leaf/70 text-text-main placeholder-text-muted/40
                                   rounded-2xl px-4 py-3 text-sm font-medium resize-none
                                   focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                                   transition-all duration-200"
                      />
                      {canModify && (
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-bold transition-all ${screeningRemarksSaved ? 'text-brand-green' : 'text-transparent'}`}>
                            ✓ Saved
                          </span>
                          <button
                            onClick={handleSaveScreeningRemarks}
                            disabled={screeningRemarksSaving}
                            className="flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50
                                       text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
                          >
                            {screeningRemarksSaving
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Save className="w-3.5 h-3.5" />
                            }
                            {screeningRemarksSaving ? 'Saving…' : 'Save Remarks'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Recall Reminder */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-border-leaf/35 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-teal" />
                        <h3 className="text-text-main font-extrabold text-xs uppercase tracking-wider">
                          Recall Reminder
                        </h3>
                      </div>
                      <p className="text-[10px] text-text-muted/80 font-semibold">
                        Set a date and time to be reminded to recall or follow up with this partner.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="datetime-local"
                          value={recallReminder}
                          onChange={(e) => setRecallReminder(e.target.value)}
                          disabled={!canModify || reminderSaving}
                          className="flex-1 bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveReminder}
                            disabled={!canModify || reminderSaving}
                            className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            {reminderSaving ? 'Saving...' : 'Set Reminder'}
                          </button>
                          {hm.recallReminder && (
                            <button
                              onClick={handleClearReminder}
                              disabled={!canModify || reminderSaving}
                              className="bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {hm.recallReminder && (
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-brand-teal bg-brand-teal/5 p-2 rounded-lg border border-brand-teal/10">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Active Recall Date: {new Date(hm.recallReminder).toLocaleString()}</span>
                          {new Date(hm.recallReminder) < new Date() && (
                            <span className="ml-auto text-red-500 font-black animate-pulse">OVERDUE</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Queries & Remarks Pad */}
                    <div>
                      <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider mb-2">
                        Remarks Pad (Queries & Notes)
                      </h3>
                      <p className="text-[10px] text-text-muted/80 font-semibold mb-2">
                        Note down any additional queries or details to be added.
                      </p>
                      <textarea
                        value={screeningQueries}
                        onChange={(e) => { setScreeningQueries(e.target.value); setScreeningQueriesSaved(false); }}
                        placeholder={canModify ? "Write additional queries or notes here..." : "Only the assignee can edit queries..."}
                        disabled={!canModify}
                        rows={4}
                        className="w-full bg-slate-50 border border-border-leaf/70 text-text-main placeholder-text-muted/40
                                   rounded-2xl px-4 py-3 text-sm font-medium resize-none
                                   focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                                   transition-all duration-200"
                      />
                      {canModify && (
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-bold transition-all ${screeningQueriesSaved ? 'text-brand-green' : 'text-transparent'}`}>
                            ✓ Saved
                          </span>
                          <button
                            onClick={handleSaveScreeningQueries}
                            disabled={screeningQueriesSaving}
                            className="flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50
                                       text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
                          >
                            {screeningQueriesSaving
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Save className="w-3.5 h-3.5" />
                            }
                            {screeningQueriesSaving ? 'Saving…' : 'Save Queries'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'rdReview' && (
                  <div className="space-y-5">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-border-leaf/35 space-y-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-teal" />
                        <h3 className="text-text-main font-extrabold text-xs uppercase tracking-wider">
                          Program Listing Details
                        </h3>
                      </div>
                      <p className="text-[10px] text-text-muted/80 font-semibold">
                        Enter the program details submitted by the partner for R&D review.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">Program Title</label>
                          <input
                            type="text"
                            placeholder="e.g. 12-Week Mindfulness & Yoga course"
                            value={programTitle}
                            onChange={(e) => setProgramTitle(e.target.value)}
                            disabled={!canModify}
                            className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          />
                        </div>
                        


                        {canModify && (
                          <button
                            type="button"
                            onClick={handleSaveProgramDetails}
                            disabled={savingProgram}
                            className="bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            {savingProgram ? 'Saving...' : 'Save Program Details'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-border-leaf/35 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border-leaf/25 pb-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                        <h3 className="text-text-main font-extrabold text-xs uppercase tracking-wider">
                          Manual Onboarding & Compliance Controls
                        </h3>
                      </div>
                      <p className="text-[10px] text-text-muted/80 font-semibold">
                        Conduct R&D reviews manually. Directly verify registration credentials and approve/reject program listings below.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Credentials Verification */}
                        <div className="space-y-3 p-3 bg-white rounded-xl border border-slate-100/80">
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">
                              Credentials Verification
                            </label>
                            <select
                              value={regStatus}
                              onChange={(e) => setRegStatus(e.target.value)}
                              disabled={!canModify}
                              className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                            >
                              <option value="PENDING">Pending Verification</option>
                              <option value="VERIFIED">Verified (Sends Credentials)</option>
                              <option value="ESCALATED">Escalated (SLA Breach)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">
                              Verification Remark
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Verified certificates manually"
                              value={regRemark}
                              onChange={(e) => setRegRemark(e.target.value)}
                              disabled={!canModify}
                              className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal placeholder-text-muted/40"
                            />
                          </div>
                        </div>

                        {/* Program Approval */}
                        <div className="space-y-3 p-3 bg-white rounded-xl border border-slate-100/80">
                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">
                              Program Listing Status
                            </label>
                            <select
                              value={progStatus}
                              onChange={(e) => setProgStatus(e.target.value)}
                              disabled={!canModify}
                              className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                            >
                              <option value="PENDING">Pending Review</option>
                              <option value="APPROVED">Approved</option>
                              <option value="CORRECTION_REQUIRED">Correction Required</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-text-muted text-[10px] font-extrabold uppercase mb-1">
                              Program Review Message
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Approved for public listings"
                              value={progMsg}
                              onChange={(e) => setProgMsg(e.target.value)}
                              disabled={!canModify}
                              className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal placeholder-text-muted/40"
                            />
                          </div>
                        </div>
                      </div>

                      {canModify && (
                        <button
                          type="button"
                          onClick={handleSaveManualVerification}
                          disabled={savingManual}
                          className="w-full bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {savingManual ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving Status Overrides...
                            </>
                          ) : (
                            'Save Status Overrides'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'qualification' && (
                  <div className="space-y-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider">
                          Healthmate Qualification
                        </h3>
                        <p className="text-[10px] text-text-muted/80 font-semibold mt-1">
                          Score every potential Healthmate (1-5). Ideal first Healthmates: 35+ out of 50.
                        </p>
                      </div>
                      <div className="bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider">Total Score:</span>
                        <span className="text-sm font-black text-brand-teal">
                          {Object.values(qScores).reduce((sum, val) => sum + (Number(val) || 0), 0)} / 50
                        </span>
                      </div>
                    </div>

                    {(hm.phase === 'PREPARE' || hm.phase === 'REVIEW' || hm.phase === 'LIVE') ? (
                      <div className="bg-slate-50/50 rounded-2xl border border-border-leaf/35 p-8 flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                          <span className="text-2xl font-black text-brand-teal">
                            {Object.values(qScores).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                          </span>
                        </div>
                        <div className="text-center">
                          <h4 className="text-text-main font-extrabold text-sm">Qualification Score</h4>
                          <p className="text-text-muted text-xs font-semibold mt-1">
                            This partner scored {Object.values(qScores).reduce((sum, val) => sum + (Number(val) || 0), 0)} out of 50 during Pre-Qualify.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-50/50 rounded-2xl border border-border-leaf/35 overflow-hidden">
                          <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                              <tr className="bg-slate-100/70 border-b border-border-leaf/35 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                                <th className="py-2.5 px-4 w-[25%]">Criteria</th>
                                <th className="py-2.5 px-4 w-[55%]">What to Check</th>
                                <th className="py-2.5 px-4 w-[20%] text-center">Score (1-5)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-leaf/35 text-[11px] text-text-main font-bold">
                              {[
                                { key: 'scoreRelevance', label: 'Program relevance', desc: 'Does it fit wellness, functional movement, or recovery?' },
                                { key: 'scoreSafety', label: 'Safety', desc: 'Is it non-clinical, non-invasive, and suitable for general users?' },
                                { key: 'scoreExperience', label: 'Experience quality', desc: 'Does the program feel meaningful, structured, and memorable?' },
                                { key: 'scoreCredibility', label: 'Facilitator credibility', desc: 'Do they have training, experience, reviews, or visible work?' },
                                { key: 'scoreLocation', label: 'Location quality', desc: 'Is the venue safe, accessible, calm, and suitable?' },
                                { key: 'scoreVisual', label: 'Visual appeal', desc: 'Can it be marketed well through photos and videos?' },
                                { key: 'scoreBooking', label: 'Booking readiness', desc: 'Can they give date, duration, price, inclusions, capacity?' },
                                { key: 'scoreUniqueness', label: 'Uniqueness', desc: 'Does it add something different to Lifed?' },
                                { key: 'scoreCorporate', label: 'Corporate potential', desc: 'Can this be adapted for employee wellbeing?' },
                                { key: 'scoreRepeatability', label: 'Repeatability', desc: 'Can this program run monthly or quarterly?' },
                              ].map((item) => (
                                <tr key={item.key} className="hover:bg-white transition-colors">
                                  <td className="py-2.5 px-4 truncate">{item.label}</td>
                                  <td className="py-2.5 px-4 text-text-muted/80 font-medium truncate" title={item.desc}>{item.desc}</td>
                                  <td className="py-2 px-4">
                                    <input
                                      type="number"
                                      min="0"
                                      max="5"
                                      disabled={!canModify}
                                      value={qScores[item.key] || ''}
                                      onChange={(e) => {
                                        const val = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                                        setQScores(prev => ({ ...prev, [item.key]: val }));
                                        setQSaved(false);
                                      }}
                                      className="w-full text-center bg-white border border-border-leaf/80 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {canModify && (
                          <div className="flex items-center justify-between pt-2">
                            <span className={`text-xs font-bold transition-all ${qSaved ? 'text-brand-green' : 'text-transparent'}`}>
                              ✓ Saved
                            </span>
                            <button
                              onClick={handleSaveQualification}
                              disabled={qSaving}
                              className="flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              {qSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              {qSaving ? 'Saving…' : 'Save Scores'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
            </div>

            {/* Right: Task Checklist */}
            <div className="flex-1 md:w-1/2 p-6 bg-slate-50/30 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-text-muted/60 text-xs font-extrabold uppercase tracking-wider">
                    Tasks
                  </h3>
                  {tasks.length > 0 && (
                    <span className="text-text-muted text-xs font-bold">{doneTasks}/{tasks.length} complete</span>
                  )}
                </div>

                {/* Inline custom task form */}
                {canModify && (
                  <form onSubmit={handleAddTask} className="flex gap-2 mb-4 shrink-0">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      disabled={taskAdding}
                      placeholder="Add custom operational task..."
                      className="flex-1 bg-white border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                    />
                    <button
                      type="submit"
                      disabled={taskAdding || !newTaskTitle.trim()}
                      className="bg-brand-teal hover:bg-brand-teal-hover disabled:bg-slate-100 disabled:text-text-muted/40 disabled:border-transparent text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all border border-transparent shadow-sm shrink-0"
                    >
                      Add
                    </button>
                  </form>
                )}

                <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-2 space-y-4">
                  {tasks.length === 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center h-28 border border-dashed border-border-leaf rounded-2xl bg-white/50">
                        <p className="text-text-muted/50 text-xs font-bold">No active tasks</p>
                      </div>

                      {canModify && missingPredefined.length > 0 && (
                        <div className="space-y-2 border border-brand-teal/20 bg-brand-teal/5 p-3 rounded-2xl">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider">
                              💡 Predefined {PHASE_LABELS[hm.phase]} Tasks
                            </span>
                            <button
                              onClick={handleLoadAllPredefined}
                              className="text-[9px] bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold px-2 py-0.5 rounded-md transition-all shadow-sm"
                            >
                              + Add All
                            </button>
                          </div>
                          <ul className="space-y-1.5">
                            {missingPredefined.map((title) => (
                              <li key={title}>
                                <button
                                  onClick={() => handleAddPredefinedTask(title)}
                                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-50 border border-border-leaf/30 text-left transition-all group shadow-sm hover:shadow"
                                >
                                  <span className="text-xs font-bold text-text-main truncate pr-2">{title}</span>
                                  <span className="text-brand-teal font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-brand-teal/10 group-hover:bg-brand-teal group-hover:text-white transition-colors shrink-0">+ Add</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Overall progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden border border-slate-200/50 shrink-0">
                        <div
                          className="h-full bg-brand-green rounded-full transition-all duration-500"
                          style={{ width: `${(doneTasks / tasks.length) * 100}%` }}
                        />
                      </div>

                      {/* Map through PHASES in sequential order to render task sections */}
                      {PHASES.map((phase, idx) => {
                        const phaseTasks = groupedTasks[phase] || [];
                        if (phaseTasks.length === 0) return null;

                        const isCurrent = phase === hm.phase;
                        const isPast    = idx < currentIndex;
                        const isUpcoming = !isCurrent && !isPast;

                        return (
                          <div
                            key={phase}
                            className={`space-y-1.5 border p-3 rounded-2xl transition-all duration-300 ${
                              isCurrent
                                ? 'border-brand-teal ring-4 ring-brand-teal/10 bg-white shadow-lg relative z-10 scale-[1.02]'
                                : isPast
                                ? 'border-slate-100 bg-slate-50/50 opacity-60'
                                : 'border-slate-100 bg-slate-50/30'
                            }`}
                          >
                            {/* Phase Section Header */}
                            <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-[10px] font-extrabold tracking-wide uppercase shrink-0 ${getPhaseHeaderClass(phase, isCurrent, isPast)}`}>
                              <span>{PHASE_LABELS[phase]} Tasks</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                isCurrent 
                                  ? 'bg-white/20 border-white/30 text-white' 
                                  : 'bg-white/80 border-current/25'
                              }`}>
                                {isCurrent ? 'Current Phase' : isPast ? 'Completed' : 'Upcoming'}
                              </span>
                            </div>

                            {/* Checklist list */}
                            <ul className="space-y-1.5">
                              {phaseTasks.map((task) => (
                                <li key={task.id} className="space-y-1">
                                  <button
                                    onClick={() => handleToggleTask(task.id, task.completed)}
                                    disabled={isUpcoming || !canModify}
                                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl border border-transparent transition-all text-left group
                                      ${isUpcoming || !canModify
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-white hover:shadow-sm hover:border-border-leaf/40'
                                      }`}
                                  >
                                    {task.completed
                                      ? <CheckSquare className="w-4.5 h-4.5 text-brand-teal shrink-0 mt-0.5" />
                                      : <Square className={`w-4.5 h-4.5 text-text-muted/40 shrink-0 mt-0.5 transition-colors ${!isUpcoming && 'group-hover:text-brand-teal/60'}`} />
                                    }
                                    <span className={`text-xs leading-snug font-bold transition-all ${
                                      task.completed ? 'line-through text-text-muted/50' : 'text-text-main'
                                    }`}>
                                      {task.title}
                                    </span>
                                  </button>

                                  {/* Document Upload / View for Register Phase Task */}
                                  {task.title.toLowerCase().includes("business registration registry copy") && (
                                    <div className="pl-7 pb-2 pt-0.5 flex flex-wrap items-center gap-2">
                                      {hm.regDocUrl ? (
                                        <>
                                          <a
                                            href={`http://localhost:3001${hm.regDocUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand-teal hover:text-brand-teal-hover bg-brand-teal/5 hover:bg-brand-teal/10 px-2.5 py-1.5 rounded-lg border border-brand-teal/20 transition-all"
                                          >
                                            View Document
                                          </a>
                                          {canModify && (
                                            <>
                                              <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingDoc || deletingDoc || isUpcoming}
                                                className="text-[10px] font-extrabold text-text-muted hover:text-text-main transition-colors px-2 py-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                Re-upload
                                              </button>
                                              <button
                                                onClick={handleDeleteDoc}
                                                disabled={uploadingDoc || deletingDoc || isUpcoming}
                                                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 transition-colors px-2 py-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                Delete
                                              </button>
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => fileInputRef.current?.click()}
                                          disabled={uploadingDoc || isUpcoming}
                                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-brand-teal hover:bg-brand-teal-hover px-2.5 py-1.5 rounded-lg transition-all shadow-sm shadow-brand-teal/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                          Upload Document
                                        </button>
                                      )}

                                      <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                      />

                                      {hm.regDocName && (
                                        <span className="text-[10px] font-bold text-text-muted/70 truncate max-w-[150px]">
                                          ({hm.regDocName})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      {/* Suggestions list at the bottom if some standard tasks are missing */}
                      {canModify && missingPredefined.length > 0 && (
                        <div className="space-y-2 border border-brand-teal/20 bg-brand-teal/5 p-3 rounded-2xl shrink-0 mt-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider">
                              💡 Predefined {PHASE_LABELS[hm.phase]} Tasks
                            </span>
                            <button
                              onClick={handleLoadAllPredefined}
                              className="text-[9px] bg-brand-teal hover:bg-brand-teal-hover text-white font-extrabold px-2 py-0.5 rounded-md transition-all shadow-sm"
                            >
                              + Add All
                            </button>
                          </div>
                          <ul className="space-y-1.5">
                            {missingPredefined.map((title) => (
                              <li key={title}>
                                <button
                                  onClick={() => handleAddPredefinedTask(title)}
                                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-50 border border-border-leaf/30 text-left transition-all group shadow-sm hover:shadow"
                                >
                                  <span className="text-xs font-bold text-text-main truncate pr-2">{title}</span>
                                  <span className="text-brand-teal font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-brand-teal/10 group-hover:bg-brand-teal group-hover:text-white transition-colors shrink-0">+ Add</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
          </div>

          {/* ── Footer: Actions ── */}
          {!isViewOnly && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-leaf/40 bg-slate-50 shrink-0 flex-wrap">

            {/* Communication buttons */}
            <div className="flex items-center gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={() => handleSendMessage('WHATSAPP')}
                disabled={sending.WHATSAPP || !canModify}
                className="flex items-center gap-2 bg-white hover:bg-brand-green/5 border border-border-leaf/80
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-text-main text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                title={!canModify ? 'Only the assignee can send messages' : hm.contactPhone ? `Send to ${hm.contactPhone}` : 'No phone number on file'}
              >
                {sending.WHATSAPP
                  ? <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
                  : <MessageCircle className="w-4 h-4 text-brand-green" />
                }
                {sending.WHATSAPP ? 'Queuing…' : 'WhatsApp'}
              </button>

              {/* Email */}
              <button
                onClick={() => handleSendMessage('EMAIL')}
                disabled={sending.EMAIL || !canModify}
                className="flex items-center gap-2 bg-white hover:bg-brand-teal/5 border border-border-leaf/80
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-text-main text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                title={!canModify ? 'Only the assignee can send messages' : hm.contactEmail ? `Send to ${hm.contactEmail}` : 'No email address on file'}
              >
                {sending.EMAIL
                  ? <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
                  : <Send className="w-4 h-4 text-brand-teal" />
                }
                {sending.EMAIL ? 'Queuing…' : 'Email'}
              </button>
            </div>

            {/* Advance & Revert phases */}
            <div className="flex items-center gap-3">
              {prevPhase && canModify && (
                <button
                  onClick={handleRevertPhase}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-text-muted hover:text-text-main text-sm font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  title={`Move back to ${PHASE_LABELS[prevPhase]}`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to {PHASE_LABELS[prevPhase]}
                </button>
              )}

              {nextPhase ? (
                <div className="relative group">
                  <button
                    onClick={handleAdvancePhase}
                    disabled={!canAdvancePhase}
                    className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-hover disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed
                               text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-brand-teal/10 hover:shadow-lg transition-all"
                  >
                    Advance to {PHASE_LABELS[nextPhase]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {!canAdvancePhase && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Complete all tasks to advance
                    </div>
                  )}
                </div>
              ) : canAdvancePhase ? (
                <span className="text-brand-green text-sm font-extrabold flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full shadow-sm">
                  ✓ Partner is Live
                </span>
              ) : (
                <div className="relative group">
                  <span className="text-slate-400 text-sm font-extrabold flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed">
                    Complete Live Tasks
                  </span>
                  <div className="absolute bottom-full mb-2 right-0 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Complete all tasks to go live
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Partner Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-50 bg-[#2C3E50]/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Modal box */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Delete Partner"
          >
            <div
              className="relative w-full max-w-sm bg-white border border-red-100 rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                  </div>
                  <h2 className="text-text-main font-extrabold text-md tracking-wide">
                    Delete Partner
                  </h2>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  Are you sure you want to permanently delete onboarding partner{' '}
                  <span className="text-text-main font-extrabold">"{hm.name}"</span>?
                </p>
                <p className="text-red-500 text-xs font-bold mt-2 bg-red-50/50 p-2 rounded-xl border border-red-100/50">
                  This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleDeleteHealthmate}
                  disabled={deletingPartner}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  {deletingPartner ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-text-main border border-slate-200 font-bold rounded-xl py-2.5 text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Revert Phase Modal */}
      {showRevertConfirm && prevPhase && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-50 bg-[#2C3E50]/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowRevertConfirm(false)}
          />

          {/* Modal box */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Revert Phase"
          >
            <div
              className="relative w-full max-w-sm bg-white border border-amber-100 rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                    <ChevronRight className="w-4.5 h-4.5 text-amber-600 rotate-180" />
                  </div>
                  <h2 className="text-text-main font-extrabold text-md tracking-wide">
                    Revert Phase
                  </h2>
                </div>
                <button
                  onClick={() => setShowRevertConfirm(false)}
                  className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  Are you sure you want to move <span className="text-text-main font-extrabold">"{hm.name}"</span> back to the <span className="text-brand-teal font-extrabold">{PHASE_LABELS[prevPhase]}</span> phase?
                </p>
                <p className="text-amber-700 text-xs font-bold mt-2 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                  Any tasks you have completed in the current phase will remain saved.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleConfirmRevert}
                  disabled={revertingPhase}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  {revertingPhase ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reverting...
                    </>
                  ) : (
                    'Yes, Revert'
                  )}
                </button>
                <button
                  onClick={() => setShowRevertConfirm(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-text-main border border-slate-200 font-bold rounded-xl py-2.5 text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── InfoRow helper ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, muted }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-text-muted/40 shrink-0">{icon}</span>
      <span className="text-text-muted/70 text-xs font-bold w-12 shrink-0">{label}</span>
      <span className={`text-sm font-extrabold truncate ${muted ? 'text-text-muted/40 italic' : 'text-text-main'}`}>
        {value}
      </span>
    </div>
  );
}
