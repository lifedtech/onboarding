import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Square,
  Filter,
  Plus,
  User,
  ExternalLink,
  BookOpen,
  Briefcase,
  AlertCircle,
  X,
  PlusCircle,
  Layers,
  CalendarDays,
  FileText
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

const PHASE_LABELS = {
  PRE_QUALIFY: 'Pre-Qualify',
  PREPARE:     'Prepare',
  REGISTER:    'Register',
  REVIEW:      'Review',
  LIVE:        'Live',
};

const PHASE_COLORS = {
  PRE_QUALIFY: 'text-slate-600 bg-slate-100 border-slate-200/50',
  PREPARE:     'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  REGISTER:    'text-amber-700 bg-amber-50 border-amber-200/50',
  REVIEW:      'text-purple-700 bg-purple-50 border-purple-200/50',
  LIVE:        'text-brand-green bg-brand-green/10 border-brand-green/20',
};

const PHASE_DOTS = {
  PRE_QUALIFY: 'bg-slate-400',
  PREPARE:     'bg-brand-teal',
  REGISTER:    'bg-amber-500',
  REVIEW:      'bg-purple-500',
  LIVE:        'bg-brand-green',
};

export default function CalendarView() {
  const user = useOpsStore((s) => s.user);
  const healthmates = useOpsStore((s) => s.healthmates);
  const fetchHealthmates = useOpsStore((s) => s.fetchHealthmates);
  const setSelectedHealthmate = useOpsStore((s) => s.setSelectedHealthmate);
  const updateTaskDetails = useOpsStore((s) => s.updateTaskDetails);
  const updateHealthmate = useOpsStore((s) => s.updateHealthmate);
  const createTask = useOpsStore((s) => s.createTask);

  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'tasks' | 'recalls'
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // 'all' | 'my'
  const [phaseFilter, setPhaseFilter] = useState('all'); // 'all' | phase keys

  // Selected details drawer states
  const [selectedDay, setSelectedDay] = useState(null); // Date object
  const [editingEvent, setEditingEvent] = useState(null); // event object
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  // Add new task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPartnerId, setNewTaskPartnerId] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState('PRE_QUALIFY');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Editing form states
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);
  const [editPhase, setEditPhase] = useState('PRE_QUALIFY');
  const [savingEvent, setSavingEvent] = useState(false);

  // Load healthmates on mount
  useEffect(() => {
    fetchHealthmates();
  }, [fetchHealthmates]);

  const isUserAdmin = user?.role?.toUpperCase() === 'ADMIN';

  // Navigation helpers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compile all events from partners in memory
  const getEvents = () => {
    const list = [];

    healthmates.forEach((hm) => {
      // Check assignment filter
      const isMyPartner = hm.opsUserId === user?.id;
      if (assigneeFilter === 'my' && !isMyPartner) return;

      // Add Tasks
      if (hm.tasks) {
        hm.tasks.forEach((t) => {
          if (t.dueDate) {
            // Apply phase filter
            if (phaseFilter !== 'all' && t.phase !== phaseFilter) return;
            // Apply type filter
            if (typeFilter !== 'all' && typeFilter !== 'tasks') return;

            list.push({
              type: 'TASK',
              id: t.id,
              title: t.title,
              completed: t.completed,
              dueDate: new Date(t.dueDate),
              phase: t.phase,
              healthmate: hm,
            });
          }
        });
      }

      // Add Recall Reminders
      if (hm.recallReminder) {
        // Apply phase filter
        if (phaseFilter !== 'all' && hm.phase !== phaseFilter) return;
        // Apply type filter
        if (typeFilter !== 'all' && typeFilter !== 'recalls') return;

        list.push({
          type: 'RECALL',
          id: hm.id, // ID of healthmate is the event identifier
          title: `Recall: ${hm.name}`,
          dueDate: new Date(hm.recallReminder), // Treat recall reminder as event date
          healthmate: hm,
        });
      }

      // Add Approved Programs for Live Healthmates
      if (hm.phase === 'LIVE' && hm.programStatus === 'APPROVED' && hm.programTitle && hm.programStartDate) {
        const start = new Date(hm.programStartDate);
        const end = hm.programEndDate ? new Date(hm.programEndDate) : start;

        // Loop from start to end date (inclusive) and add an event for each day
        let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const targetEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        while (current <= targetEnd) {
          // Apply phase filter (Live is the phase for these healthmates)
          if (phaseFilter !== 'all' && hm.phase !== phaseFilter) break;
          // Apply type filter
          if (typeFilter !== 'all' && typeFilter !== 'programs') break;

          list.push({
            type: 'PROGRAM',
            id: `${hm.id}-program-${current.toDateString()}`,
            title: `Program: ${hm.programTitle}`,
            dueDate: new Date(current),
            healthmate: hm,
          });

          // Advance by 1 day
          current.setDate(current.getDate() + 1);
        }
      }
    });

    return list.sort((a, b) => a.dueDate - b.dueDate);
  };

  const allEvents = getEvents();

  // Date generators
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = [];
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const nextMonthDays = [];
    const totalCells = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Adjust to Sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const getEventsForDate = (date) => {
    const dStr = date.toDateString();
    return allEvents.filter((ev) => ev.dueDate.toDateString() === dStr);
  };

  // Actions
  const handleToggleTask = async (event, currentCompleted) => {
    const toastId = toast.loading('Updating task status...');
    const result = await updateTaskDetails(event.healthmate.id, event.id, {
      completed: !currentCompleted,
    });
    toast.dismiss(toastId);

    if (result && result.success) {
      toast.success('Task status updated!');
      // Sync side drawer states if selected
      if (editingEvent && editingEvent.id === event.id) {
        setEditingEvent({ ...editingEvent, completed: !currentCompleted });
      }
    } else {
      toast.error(result.message || 'Failed to update task.');
    }
  };

  const handleSelectDay = (date) => {
    setSelectedDay(date);
    setEditingEvent(null);
    setShowAddTaskForm(false);
    // Pre-populate add task form date
    const localDateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    setNewTaskDueDate(localDateStr);
    
    // Default select first partner if available
    const myPartners = healthmates.filter(h => isUserAdmin || h.opsUserId === user?.id);
    if (myPartners.length > 0) {
      setNewTaskPartnerId(myPartners[0].id);
      setNewTaskPhase(myPartners[0].phase);
    } else if (healthmates.length > 0) {
      setNewTaskPartnerId(healthmates[0].id);
      setNewTaskPhase(healthmates[0].phase);
    }
  };

  const handleSelectEvent = (event) => {
    setEditingEvent(event);
    setSelectedDay(event.dueDate);
    setShowAddTaskForm(false);

    // Populate edit form states
    setEditTitle(event.title);
    setEditCompleted(event.completed ?? false);
    setEditPhase(event.phase ?? 'PRE_QUALIFY');

    // Handle input datetime-local format
    const tzOffset = event.dueDate.getTimezoneOffset() * 60000;
    const localISO = new Date(event.dueDate.getTime() - tzOffset).toISOString();
    setEditDueDate(localISO.slice(0, 16));
  };

  const handleSaveEventChanges = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSavingEvent(true);
    const toastId = toast.loading('Saving event details...');

    if (editingEvent.type === 'TASK') {
      const result = await updateTaskDetails(editingEvent.healthmate.id, editingEvent.id, {
        title: editTitle,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        completed: editCompleted,
        phase: editPhase,
      });
      setSavingEvent(false);
      toast.dismiss(toastId);
      if (result && result.success) {
        toast.success('Task details updated!');
        setEditingEvent(null);
        fetchHealthmates(); // Full refresh
      } else {
        toast.error(result.message || 'Failed to update task.');
      }
    } else if (editingEvent.type === 'RECALL') {
      const result = await updateHealthmate(editingEvent.healthmate.id, {
        recallReminder: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      setSavingEvent(false);
      toast.dismiss(toastId);
      if (result && result.success) {
        toast.success('Recall reminder updated!');
        setEditingEvent(null);
        fetchHealthmates(); // Full refresh
      } else {
        toast.error(result.message || 'Failed to update recall reminder.');
      }
    }
  };

  const handleClearRecall = async () => {
    if (!editingEvent || editingEvent.type !== 'RECALL') return;
    if (!window.confirm('Are you sure you want to clear this recall reminder?')) return;

    setSavingEvent(true);
    const toastId = toast.loading('Clearing recall reminder...');
    const result = await updateHealthmate(editingEvent.healthmate.id, {
      recallReminder: null,
    });
    setSavingEvent(true);
    toast.dismiss(toastId);
    if (result && result.success) {
      toast.success('Recall reminder cleared!');
      setEditingEvent(null);
      fetchHealthmates();
    } else {
      toast.error(result.message || 'Failed to clear recall reminder.');
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskPartnerId) {
      toast.error('Please enter a task title and select a partner.');
      return;
    }

    const toastId = toast.loading('Creating task...');
    const partner = healthmates.find(h => h.id === newTaskPartnerId);
    
    // We will call useOpsStore createTask, then call updateTaskDetails to set the due date!
    // Since createTask doesn't accept dueDate in store (it only creates in DB, wait, actually let's check
    // if we can just update the created task with the selected date using updateTaskDetails).
    const createResult = await createTask(newTaskPartnerId, newTaskTitle, newTaskPhase);
    
    if (createResult && createResult.success && createResult.data) {
      const createdTask = createResult.data;
      
      // Update due date
      if (newTaskDueDate) {
        const updateResult = await updateTaskDetails(newTaskPartnerId, createdTask.id, {
          dueDate: new Date(newTaskDueDate).toISOString(),
        });
        if (!updateResult.success) {
          toast.warning('Task created but failed to set due date.');
        }
      }
      
      toast.dismiss(toastId);
      toast.success('Task created successfully!');
      setNewTaskTitle('');
      setShowAddTaskForm(false);
      fetchHealthmates();
    } else {
      toast.dismiss(toastId);
      toast.error(createResult.message || 'Failed to create task.');
    }
  };

  const monthName = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  // Filter partners selection for custom task addition
  const activePartnersForSelect = healthmates.filter(
    (h) => isUserAdmin || h.opsUserId === user?.id
  );

  return (
    <div className="p-6 md:p-8 space-y-6 bg-bg-base max-w-7xl mx-auto h-full flex flex-col min-h-0">
      
      {/* Calendar Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-text-main font-extrabold text-2xl tracking-tight">Ops Calendar</h1>
          <p className="text-text-muted/80 text-sm font-semibold mt-0.5">
            Track, schedule, and complete partner onboarding deliverables and follow-up reminders.
          </p>
        </div>

        {/* View Mode controls */}
        <div className="bg-white border border-border-leaf/60 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'text-text-muted hover:text-text-main hover:bg-slate-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'text-text-muted hover:text-text-main hover:bg-slate-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'agenda'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'text-text-muted hover:text-text-main hover:bg-slate-50'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {/* Glassmorphic Filters & Controls Panel */}
      <div className="bg-white border border-border-leaf/40 rounded-3xl p-5 shadow-sm space-y-4 shrink-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Month / Week Switcher Header */}
          <div className="flex items-center gap-3">
            <h2 className="text-text-main font-extrabold text-lg min-w-[160px]">{monthName}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 border border-border-leaf/75 rounded-xl hover:bg-slate-50 text-text-muted hover:text-text-main transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-2 border border-border-leaf/75 rounded-xl hover:bg-slate-50 text-text-muted hover:text-text-main text-xs font-bold transition-all"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-border-leaf/75 rounded-xl hover:bg-slate-50 text-text-muted hover:text-text-main transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Assignee (Ops vs Admin) */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setAssigneeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  assigneeFilter === 'all'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                All Partners
              </button>
              <button
                onClick={() => setAssigneeFilter('my')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  assigneeFilter === 'my'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                My Partners
              </button>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setTypeFilter('tasks')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  typeFilter === 'tasks'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Tasks Only
              </button>
              <button
                onClick={() => setTypeFilter('recalls')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  typeFilter === 'recalls'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Recalls Only
              </button>
              <button
                onClick={() => setTypeFilter('programs')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                  typeFilter === 'programs'
                    ? 'bg-[#112421] text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Programs Only
              </button>
            </div>

            {/* Filter by Onboarding Phase */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200/50 text-text-main text-[10px] font-extrabold uppercase tracking-wider rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="all">All Phases</option>
              {Object.entries(PHASE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 bg-white border border-slate-300 rounded-3xl overflow-hidden flex flex-col min-h-0 shadow-xs relative">
        
        {/* Month View */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100/60 text-center text-[10px] font-extrabold uppercase tracking-wider text-text-muted py-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 divide-x divide-y divide-slate-300">
              {getMonthDays().map(({ date, isCurrentMonth }, idx) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString();

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDay(date)}
                    className={`p-2 flex flex-col min-h-0 group cursor-pointer transition-colors hover:bg-slate-50/50 relative ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-100/70 text-slate-400/80'
                    } ${isSelected ? 'bg-brand-teal/5' : ''}`}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-brand-teal text-white shadow-sm'
                            : isCurrentMonth
                            ? 'text-text-main'
                            : 'text-slate-400'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-extrabold text-text-muted bg-slate-100 px-1.5 py-0.25 rounded-md lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Events list in the box */}
                    <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 -mr-1">
                      {dayEvents.slice(0, 3).map((ev) => {
                        return (
                          <div
                            key={ev.id + ev.type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEvent(ev);
                            }}
                            className={`p-1 text-[9px] rounded-lg border font-bold flex items-center justify-between gap-1 transition-all hover:scale-102 ${
                              ev.type === 'TASK'
                                ? ev.completed
                                  ? 'bg-slate-50 text-slate-400 border-slate-200/50 line-through'
                                  : `${PHASE_COLORS[ev.phase]} border-current/20`
                                : ev.type === 'RECALL'
                                ? 'bg-red-50 text-red-700 border-red-200/60'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            }`}
                          >
                            <span className="truncate flex-1">
                              {ev.title}
                            </span>
                            {ev.type === 'RECALL' && (
                              <Clock className="w-2.5 h-2.5 shrink-0 text-red-500" />
                            )}
                            {ev.type === 'PROGRAM' && (
                              <Layers className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                            )}
                            {ev.type === 'TASK' && (
                              <span className={`w-1 h-1 rounded-full shrink-0 ${PHASE_DOTS[ev.phase]}`} />
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-text-muted font-bold pl-1.5 py-0.5">
                          + {dayEvents.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100/60 text-center text-[10px] font-extrabold uppercase tracking-wider text-text-muted py-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Columns */}
            <div className="flex-1 grid grid-cols-7 min-h-0 divide-x divide-slate-300 bg-white">
              {getWeekDays().map((date, idx) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString();

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDay(date)}
                    className={`p-3 flex flex-col min-h-0 group cursor-pointer transition-colors hover:bg-slate-50/50 relative ${
                      isSelected ? 'bg-brand-teal/5' : ''
                    }`}
                  >
                    {/* Header: Day number + weekday */}
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-1.5 shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-text-muted">
                        {date.toLocaleDateString(undefined, { day: 'numeric' })}
                      </span>
                      {isToday && (
                        <span className="text-[8px] bg-brand-teal text-white font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Events body */}
                    <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 -mr-1">
                      {dayEvents.map((ev) => {
                        return (
                          <div
                            key={ev.id + ev.type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEvent(ev);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all hover:border-brand-teal/30 hover:shadow-xs hover:bg-white/80 ${
                              ev.type === 'TASK'
                                ? ev.completed
                                  ? 'bg-slate-50/60 text-slate-400 border-slate-200/50 line-through'
                                  : `${PHASE_COLORS[ev.phase]} border-current/25`
                                : ev.type === 'RECALL'
                                ? 'bg-red-50 text-red-700 border-red-200/60'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[10px] font-extrabold leading-snug line-clamp-2">
                                {ev.title}
                              </span>
                              {ev.type === 'RECALL' && (
                                <Clock className="w-3 h-3 shrink-0 text-red-500 mt-0.5" />
                              )}
                              {ev.type === 'PROGRAM' && (
                                <Layers className="w-3 h-3 shrink-0 text-emerald-600 mt-0.5" />
                              )}
                            </div>
                            <span className="text-[8px] font-bold text-text-muted/70 truncate flex items-center gap-1">
                              <User className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                              {ev.healthmate.name}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length === 0 && (
                        <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/10 min-h-[120px]">
                          <span className="text-[9px] font-bold text-slate-400 italic">No events scheduled</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agenda View */}
        {viewMode === 'agenda' && (
          <div className="flex-1 overflow-auto p-6 bg-white space-y-4">
            {allEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-400">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-text-main font-extrabold text-sm">No Events Scheduled</h4>
                  <p className="text-text-muted text-xs font-semibold mt-1">
                    No onboarding tasks or recall reminders found matching the current filters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-w-4xl mx-auto border border-border-leaf/40 rounded-3xl overflow-hidden bg-[#fafdfb]">
                {allEvents.map((ev, idx) => {
                  const isTask = ev.type === 'TASK';
                  const isOverdue = new Date(ev.dueDate) < new Date() && !ev.completed;
                  const dateStr = ev.dueDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={ev.id + ev.type + idx}
                      onClick={() => handleSelectEvent(ev)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Event type indicator */}
                        <div className="mt-0.5">
                          {ev.type === 'TASK' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTask(ev, ev.completed);
                              }}
                              className="text-text-muted hover:text-brand-teal transition-colors"
                              aria-label="Toggle task completed"
                            >
                              {ev.completed ? (
                                <CheckSquare className="w-4 h-4 text-brand-teal" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 hover:border-brand-teal" />
                              )}
                            </button>
                          ) : ev.type === 'RECALL' ? (
                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 border border-red-200">
                              <Clock className="w-2.5 h-2.5" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                              <Layers className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="space-y-0.5 min-w-0">
                          <p className={`text-xs font-bold leading-snug truncate max-w-[280px] sm:max-w-[400px] ${
                            isTask && ev.completed ? 'line-through text-slate-400' : 'text-text-main group-hover:text-brand-teal transition-colors'
                          }`}>
                            {ev.title}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-[9px] font-semibold text-text-muted">
                            <span className="flex items-center gap-0.5 text-text-main">
                              <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              {ev.healthmate.name}
                            </span>
                            <span>·</span>
                            <span>{ev.healthmate.category}</span>
                            {ev.type === 'TASK' && (
                              <>
                                <span>·</span>
                                <span className={`px-1.5 py-0.25 rounded-md border text-[8px] font-extrabold uppercase ${PHASE_COLORS[ev.phase]}`}>
                                  {PHASE_LABELS[ev.phase]}
                                </span>
                              </>
                            )}
                            {ev.type === 'PROGRAM' && (
                              <>
                                <span>·</span>
                                <span className="px-1.5 py-0.25 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-[8px] font-extrabold uppercase">
                                  Approved Program
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date & Overdue badge */}
                      <div className="flex items-center gap-2 sm:self-center self-start pl-7 sm:pl-0 shrink-0">
                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-red-500 font-extrabold' : 'text-text-muted/80'}`}>
                          {dateStr}
                        </span>
                        {isOverdue && (
                          <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-black animate-pulse">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Slid-over drawer for selected day and event details */}
      {selectedDay && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            onClick={() => setSelectedDay(null)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col border-l border-border-leaf/60 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-text-main font-extrabold text-sm tracking-wide">
                  Schedule Details
                </h3>
                <p className="text-text-muted text-[11px] font-bold mt-0.5">
                  {selectedDay.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-text-muted hover:text-text-main hover:bg-slate-50 p-1.5 rounded-xl transition-all"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 -mr-2">
              
              {/* Event Editor Form (if an event is selected for edit) */}
              {editingEvent ? (
                <div className="bg-[#fafdfb] border border-border-leaf/40 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider flex items-center gap-1">
                      {editingEvent.type === 'TASK' ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" /> Edit Task Details
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Edit Recall Details
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => setEditingEvent(null)}
                      className="text-xs text-text-muted hover:text-text-main font-bold hover:underline"
                    >
                      Back to list
                    </button>
                  </div>

                  <form onSubmit={handleSaveEventChanges} className="space-y-4">
                    {editingEvent.type === 'TASK' && (
                      <>
                        <div>
                          <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                            Task Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                            Onboarding Phase
                          </label>
                          <select
                            value={editPhase}
                            onChange={(e) => setEditPhase(e.target.value)}
                            className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          >
                            {Object.entries(PHASE_LABELS).map(([k, l]) => (
                              <option key={k} value={k}>{l}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="edit-completed"
                            checked={editCompleted}
                            onChange={(e) => setEditCompleted(e.target.checked)}
                            className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-slate-300"
                          />
                          <label htmlFor="edit-completed" className="text-xs font-bold text-text-main cursor-pointer select-none">
                            Mark as Completed
                          </label>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                        Due Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={savingEvent}
                        className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        {savingEvent ? 'Saving...' : 'Save Changes'}
                      </button>
                      
                      {editingEvent.type === 'RECALL' && (
                        <button
                          type="button"
                          onClick={handleClearRecall}
                          disabled={savingEvent}
                          className="bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-xs"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : showAddTaskForm ? (
                /* Add Task Form */
                <div className="bg-[#fafdfb] border border-border-leaf/40 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" /> Add Custom Task
                    </span>
                    <button
                      onClick={() => setShowAddTaskForm(false)}
                      className="text-xs text-text-muted hover:text-text-main font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {activePartnersForSelect.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        No active onboarding partners found to assign tasks to.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                      <div>
                        <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                          Partner / Client
                        </label>
                        <select
                          required
                          value={newTaskPartnerId}
                          onChange={(e) => {
                            setNewTaskPartnerId(e.target.value);
                            // Pre-fill corresponding partner phase
                            const partner = healthmates.find(h => h.id === e.target.value);
                            if (partner) setNewTaskPhase(partner.phase);
                          }}
                          className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        >
                          {activePartnersForSelect.map((hm) => (
                            <option key={hm.id} value={hm.id}>{hm.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                          Task Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Call partner to confirm banking details"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                          Phase Section
                        </label>
                        <select
                          required
                          value={newTaskPhase}
                          onChange={(e) => setNewTaskPhase(e.target.value)}
                          className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        >
                          {Object.entries(PHASE_LABELS).map(([k, l]) => (
                            <option key={k} value={k}>{l}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-text-muted text-[9px] font-extrabold uppercase mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          required
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        Add Task
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Main Action Options: list events or offer to create */
                <div className="space-y-4">
                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddTaskForm(true)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-text-main border border-border-leaf/80 text-xs font-extrabold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-teal" />
                      Add Task
                    </button>
                  </div>

                  {/* Day Events Header */}
                  <h4 className="text-text-muted text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    Scheduled Items ({getEventsForDate(selectedDay).length})
                  </h4>

                  {/* Events list for selectedDay */}
                  <div className="space-y-3">
                    {getEventsForDate(selectedDay).map((ev) => {
                      const isTask = ev.type === 'TASK';
                      
                      return (
                        <div
                          key={ev.id + ev.type}
                          className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all relative group bg-white shadow-xs hover:border-slate-300 ${
                            isTask
                              ? ev.completed
                                ? 'bg-slate-50/50 border-slate-200/50 text-slate-400 line-through'
                                : 'border-border-leaf/40'
                              : 'bg-red-50/30 border-red-200/50 text-red-700'
                          }`}
                        >
                          {/* Title block */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              {ev.type === 'TASK' ? (
                                <button
                                  onClick={() => handleToggleTask(ev, ev.completed)}
                                  className="text-text-muted hover:text-brand-teal mt-0.5 shrink-0"
                                >
                                  {ev.completed ? (
                                    <CheckSquare className="w-4 h-4 text-brand-teal" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300" />
                                  )}
                                </button>
                              ) : ev.type === 'RECALL' ? (
                                <Clock className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              ) : (
                                <Layers className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              )}
                              <span className="text-xs font-bold leading-normal">
                                {ev.title}
                              </span>
                            </div>
                            
                            {/* Action toggle menu */}
                            {ev.type !== 'PROGRAM' && (
                              <button
                                onClick={() => handleSelectEvent(ev)}
                                className="text-text-muted hover:text-brand-teal text-[10px] font-extrabold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity self-start shrink-0"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {/* Footer details */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] font-semibold text-text-muted">
                            {/* Partner Info and Link */}
                            <div
                              onClick={() => {
                                setSelectedDay(null);
                                setSelectedHealthmate(ev.healthmate);
                              }}
                              className="flex items-center gap-1 text-brand-teal hover:underline cursor-pointer font-extrabold truncate"
                              title="Click to view partner dashboard"
                            >
                              <User className="w-3 h-3 text-slate-400" />
                              {ev.healthmate.name}
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </div>

                            {/* Phase or Recall tag */}
                            {ev.type === 'TASK' ? (
                              <span className={`px-1.5 py-0.25 rounded-md border text-[8px] font-extrabold uppercase ${PHASE_COLORS[ev.phase]}`}>
                                {PHASE_LABELS[ev.phase]}
                              </span>
                            ) : ev.type === 'RECALL' ? (
                              <span className="px-1.5 py-0.25 rounded-md bg-red-100 border border-red-200 text-red-600 text-[8px] font-black uppercase">
                                Recall Alert
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.25 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8px] font-black uppercase">
                                Program
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {getEventsForDate(selectedDay).length === 0 && (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <CalendarDays className="w-6 h-6 text-slate-300 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 italic">
                          No events scheduled for this day.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

    </div>
  );
}
