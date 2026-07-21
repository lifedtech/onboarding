import React, { useState, useEffect, useMemo } from 'react';
import {   Book, Save, Calendar as CalendarIcon, ChevronLeft, ChevronRight, PenTool, CalendarDays, Trash2   } from 'lucide-react';
import toast from 'react-hot-toast';
import useOpsStore from '../../store/useOpsStore';

export default function Diary() {
  const user = useOpsStore((s) => s.user);
  const userId = user?.id || 'guest';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Archive Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [archiveMonth, setArchiveMonth] = useState(new Date());
  
  // Modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date to YYYY-MM-DD for local storage key
  const getStorageKey = (date) => {
    return `diary_${userId}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Check if selected date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if a date is in the future
  const isFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };

  useEffect(() => {
    // Load note for the selected date
    const key = getStorageKey(selectedDate);
    const savedNote = localStorage.getItem(key);
    setNoteContent(savedNote || '');
  }, [selectedDate, userId]);

  const handleSave = () => {
    setIsSaving(true);
    const key = getStorageKey(selectedDate);
    localStorage.setItem(key, noteContent);
    
    // Simulate slight delay for saving animation
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Diary entry saved successfully!');
    }, 400);
  };

  const handleDelete = () => {
    if (!noteContent) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const key = getStorageKey(selectedDate);
    localStorage.removeItem(key);
    setNoteContent('');
    setShowDeleteConfirm(false);
    toast.success('Diary entry deleted.');
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // --- Calendar Logic ---

  const changeArchiveMonth = (months) => {
    const newDate = new Date(archiveMonth);
    newDate.setMonth(archiveMonth.getMonth() + months);
    setArchiveMonth(newDate);
  };

  const calendarDays = useMemo(() => {
    const year = archiveMonth.getFullYear();
    const month = archiveMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    
    // Padding for previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(year, month - 1, dayNum);
      const key = getStorageKey(date);
      const hasNote = !!localStorage.getItem(key);
      days.push({
        date,
        dayNum,
        isPadding: true,
        hasNote,
        isToday: isToday(date),
        isFuture: isFuture(date),
        isSelected: date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear()
      });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const key = getStorageKey(date);
      const hasNote = !!localStorage.getItem(key);
      days.push({
        date,
        dayNum: i,
        isPadding: false,
        hasNote,
        isToday: isToday(date),
        isFuture: isFuture(date),
        isSelected: date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear()
      });
    }

    // Padding for next month
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextMonthDay);
      const key = getStorageKey(date);
      const hasNote = !!localStorage.getItem(key);
      days.push({
        date,
        dayNum: nextMonthDay,
        isPadding: true,
        hasNote,
        isToday: isToday(date),
        isFuture: isFuture(date),
        isSelected: date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear()
      });
      nextMonthDay++;
    }

    return days;
  }, [archiveMonth, userId, showCalendar, selectedDate]);

  const handleDayClick = (dayObj) => {
    if (dayObj) {
      setSelectedDate(dayObj.date);
      setShowCalendar(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 h-full flex flex-col bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-200 transition-colors overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Book className="w-8 h-8 text-brand-teal" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-cyan-500">
                Ops Journey
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Your personal space to jot down daily reflections and tasks.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowCalendar(!showCalendar);
                if (!showCalendar) setArchiveMonth(new Date(selectedDate));
              }}
              className="flex items-center justify-center gap-2 bg-white dark:bg-[#131c2f] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:text-brand-teal px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
            >
              <CalendarDays className="w-5 h-5" />
              {showCalendar ? 'Editor' : 'Archive'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || showCalendar}
              className={`flex items-center justify-center gap-2 bg-brand-teal text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 
                ${showCalendar ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-brand-teal-hover shadow-brand-teal/20'}
                ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSaving ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>

        {showCalendar ? (
          /* Archive Calendar View */
          <div className="flex-1 bg-white dark:bg-[#131c2f] rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 overflow-y-auto flex flex-col p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200 items-center justify-start">
            <div className="w-full max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {archiveMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeArchiveMonth(-1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-teal"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setArchiveMonth(new Date())}
                    className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-teal"
                  >
                    Current Month
                  </button>
                  <button
                    onClick={() => changeArchiveMonth(1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-teal"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Seamless Grid Calendar */}
              <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm flex flex-col bg-slate-200 dark:bg-white/10">
                {/* Header Row */}
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center font-extrabold text-slate-400 text-xs uppercase tracking-widest">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-px">
                  {calendarDays.map((dayObj, index) => {
                    return (
                      <button
                        key={index}
                        disabled={dayObj.isFuture}
                        onClick={() => handleDayClick(dayObj)}
                        className={`
                          relative flex flex-col items-start justify-start p-2 sm:p-3 transition-colors min-h-[90px] sm:min-h-[110px] w-full
                          ${dayObj.isPadding 
                            ? 'bg-slate-50 dark:bg-[#0f172a]' 
                            : 'bg-white dark:bg-[#131c2f]'
                          }
                          ${dayObj.isFuture 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                          }
                        `}
                      >
                        <span className={`
                          text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full
                          ${(dayObj.isSelected || dayObj.isToday) ? 'bg-brand-teal text-white' : ''}
                          ${(!dayObj.isSelected && !dayObj.isToday) ? (dayObj.isPadding ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200') : ''}
                        `}>
                          {dayObj.dayNum}
                        </span>
                        
                        {/* Note indicator */}
                        {dayObj.hasNote && (
                          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(0,174,157,0.8)]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Editor View */
          <>
            {/* Date Navigator */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-[#131c2f] p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 animate-in fade-in duration-200">
              <button
                onClick={() => setSelectedDate(new Date())}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isToday(selectedDate)
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Today
              </button>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-teal dark:hover:text-brand-teal"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3 min-w-[220px] justify-center">
                  <CalendarIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-base sm:text-lg font-bold whitespace-nowrap">
                    {formatDateLabel(selectedDate)}
                  </span>
                </div>

                <button
                  onClick={() => changeDate(1)}
                  disabled={isToday(selectedDate)}
                  className={`p-2 rounded-lg transition-colors 
                    ${isToday(selectedDate) 
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50' 
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-brand-teal dark:hover:text-brand-teal'
                    }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Delete Button */}
              <div className="w-[84px] flex justify-end">
                <button
                  onClick={handleDelete}
                  disabled={!noteContent}
                  className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    !noteContent 
                      ? 'opacity-0 pointer-events-none'
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                  }`}
                  title="Clear note for this day"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white dark:bg-[#131c2f] rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group transition-colors focus-within:border-brand-teal/50 focus-within:ring-4 focus-within:ring-brand-teal/10 min-h-[300px] animate-in fade-in duration-200">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-opacity group-focus-within:opacity-10">
                <PenTool className="w-64 h-64 text-brand-teal" />
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="What's on your mind today? Write down your challenges, achievements, or anything important..."
                className="flex-1 w-full p-6 sm:p-10 bg-transparent resize-none outline-none text-base sm:text-lg leading-relaxed placeholder-slate-400 dark:placeholder-slate-600 custom-scrollbar z-10"
                style={{
                  lineHeight: '1.8',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131c2f] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Note?</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this diary entry? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm shadow-red-600/20 transition-all active:scale-95"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
