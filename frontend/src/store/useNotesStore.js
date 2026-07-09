import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotesStore = create(
  persist(
    (set) => ({
      notes: [],
      isNotesOpen: false,

      toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),
      setNotesOpen: (isOpen) => set({ isNotesOpen: isOpen }),

      addNote: (note) => set((state) => ({
        notes: [{ ...note, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...state.notes]
      })),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),

      togglePin: (id) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
      })),
      
      changeColor: (id, color) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, color } : n)
      })),

      toggleListItem: (noteId, itemId) => set((state) => ({
        notes: state.notes.map(n => {
          if (n.id !== noteId || n.type !== 'list') return n;
          return {
            ...n,
            items: n.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
          };
        })
      })),
    }),
    {
      name: 'lifed-notes-storage',
    }
  )
);

export default useNotesStore;
