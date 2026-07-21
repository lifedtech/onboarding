import React, { useState, useEffect, useRef } from 'react';
import {   X, Pin, Trash2, Palette, GripHorizontal, Plus, CheckSquare as CheckSquareIcon   } from 'lucide-react';
import useNotesStore from '../../store/useNotesStore';

const COLORS = [
  { id: 'default', bg: 'bg-white', border: 'border-slate-200' },
  { id: 'red', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'green', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' },
];

export default function KeepNotes() {
  const { isNotesOpen, setNotesOpen, notes, addNote, updateNote, deleteNote, togglePin, changeColor, toggleListItem } = useNotesStore();
  
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const panelRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState('text');
  const [newNoteItems, setNewNoteItems] = useState([{ id: Date.now().toString(), text: '', checked: false }]);
  const [isAdding, setIsAdding] = useState(false);

  const addNewItemField = () => setNewNoteItems(prev => [...prev, { id: Date.now().toString(), text: '', checked: false }]);
  const updateNewItemText = (id, text) => setNewNoteItems(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  const removeNewItemField = (id) => setNewNoteItems(prev => prev.filter(i => i.id !== id));
  const toggleNewItemCheck = (id) => setNewNoteItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      let newX = e.clientX - offset.current.x;
      let newY = e.clientY - offset.current.y;
      
      const panelWidth = panelRef.current ? panelRef.current.offsetWidth : 400;
      const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 600;
      
      // Clamp within screen boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - panelWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - panelHeight));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleAddNote = () => {
    const validItems = newNoteItems.filter(i => i.text.trim());
    if (!newNoteTitle.trim() && newNoteType === 'text' && !newNoteContent.trim()) {
      setIsAdding(false);
      return;
    }
    if (newNoteType === 'list' && !newNoteTitle.trim() && validItems.length === 0) {
      setIsAdding(false);
      return;
    }

    addNote({
      title: newNoteTitle,
      type: newNoteType,
      content: newNoteType === 'text' ? newNoteContent : '',
      items: newNoteType === 'list' ? validItems : [],
      color: 'default',
      isPinned: false
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteItems([{ id: Date.now().toString(), text: '', checked: false }]);
    setNewNoteType('text');
    setIsAdding(false);
  };

  if (!isNotesOpen) return null;

  const pinnedNotes = notes.filter(n => n.isPinned);
  const otherNotes = notes.filter(n => !n.isPinned);

  return (
    <div 
      ref={panelRef}
      className="fixed z-[100] bg-slate-50 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: '400px',
        height: '600px',
        resize: 'both',
        minWidth: '300px',
        minHeight: '400px',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-3 bg-white border-b cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <GripHorizontal className="w-4 h-4 text-slate-400" />
          My Notes
          <button 
            onClick={() => { setIsAdding(true); setNewNoteType('list'); }} 
            className="ml-1 p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-brand-teal transition-colors"
            title="Add Checklist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setNotesOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50" onMouseDown={(e) => e.stopPropagation()}>
        
        {/* Add Note Area */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden transition-all">
          {isAdding ? (
            <div className="p-3">
              <input
                type="text"
                placeholder="Title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full font-bold text-sm outline-none mb-2 text-slate-800 placeholder-slate-400 bg-transparent"
                autoFocus
              />
              
              {newNoteType === 'text' ? (
                <textarea
                  placeholder="Take a note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full text-sm outline-none resize-none min-h-[80px] text-slate-700 placeholder-slate-500 bg-transparent"
                />
              ) : (
                <div className="mb-2 space-y-1.5">
                  {newNoteItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                       <input type="checkbox" checked={item.checked} onChange={() => toggleNewItemCheck(item.id)} className="w-3.5 h-3.5 rounded text-brand-teal focus:ring-brand-teal" />
                       <input 
                         type="text" 
                         value={item.text} 
                         onChange={(e) => updateNewItemText(item.id, e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewItemField(); } }}
                         className="flex-1 text-sm outline-none bg-transparent"
                         placeholder="List item"
                         autoFocus={idx === newNoteItems.length - 1}
                       />
                       <button onClick={() => removeNewItemField(item.id)} className="text-slate-300 hover:text-slate-500"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-400 mt-2 pl-0.5">
                     <Plus className="w-3.5 h-3.5" />
                     <input type="text" placeholder="List item" onFocus={addNewItemField} className="text-sm outline-none bg-transparent flex-1" />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={handleAddNote}
                  className="text-xs font-bold text-brand-teal hover:bg-brand-teal/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-sm font-medium text-slate-500 flex items-center justify-between bg-white">
              <div className="cursor-text flex-1" onClick={() => { setIsAdding(true); setNewNoteType('text'); }}>
                Take a note...
              </div>
              <button 
                onClick={() => { setIsAdding(true); setNewNoteType('list'); }}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                title="New list"
              >
                <CheckSquareIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Note Grid */}
        <div className="flex flex-col gap-6">
          {pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Pinned</h3>
              <div className="columns-1 sm:columns-2 gap-3 space-y-3">
                {pinnedNotes.map(note => <NoteCard key={note.id} note={note} togglePin={togglePin} deleteNote={deleteNote} changeColor={changeColor} toggleListItem={toggleListItem} />)}
              </div>
            </div>
          )}
          
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Others</h3>}
              <div className="columns-1 sm:columns-2 gap-3 space-y-3">
                {otherNotes.map(note => <NoteCard key={note.id} note={note} togglePin={togglePin} deleteNote={deleteNote} changeColor={changeColor} toggleListItem={toggleListItem} />)}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function NoteCard({ note, togglePin, deleteNote, changeColor, toggleListItem }) {
  const colorObj = COLORS.find(c => c.id === note.color) || COLORS[0];
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div className={`relative group p-3 rounded-xl border shadow-sm break-inside-avoid ${colorObj.bg} ${colorObj.border} transition-colors`}>
      <button 
        onClick={() => togglePin(note.id)}
        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-opacity ${note.isPinned ? 'opacity-100 text-brand-teal' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}
      >
        <Pin className="w-3.5 h-3.5" />
      </button>

      {note.title && <h4 className="font-bold text-sm mb-1.5 text-slate-800 pr-6 break-words">{note.title}</h4>}
      
      {(!note.type || note.type === 'text') ? (
        <p className="text-xs text-slate-700 whitespace-pre-wrap break-words">{note.content}</p>
      ) : (
        <div className="space-y-1.5 mt-1">
          {note.items?.map(item => (
            <div key={item.id} className="flex items-start gap-2">
              <input 
                type="checkbox" 
                checked={item.checked} 
                onChange={() => toggleListItem(note.id, item.id)}
                className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
              />
              <span className={`text-xs ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hover Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between mt-3">
        <div className="relative">
          <button 
            onClick={() => setShowPalette(!showPalette)}
            className="p-1 rounded hover:bg-white/60 text-slate-500"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          
          {showPalette && (
            <div className="absolute top-full left-0 mt-1 p-1.5 bg-white rounded-lg shadow-xl flex gap-1 z-10">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { changeColor(note.id, c.id); setShowPalette(false); }}
                  className={`w-4 h-4 rounded-full border shadow-sm ${c.bg} ${c.border} hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => deleteNote(note.id)}
          className="p-1 rounded hover:bg-white/60 text-slate-500 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
