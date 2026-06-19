import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import CategorySelector from './CategorySelector';

export default function AddHealthmateModal({ isOpen, onClose }) {
  const addHealthmate = useOpsStore((s) => s.addHealthmate);

  const [name, setName] = useState('');
  const [type, setType] = useState('PRACTITIONER');
  const [category, setCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Partner Name is required.');
      return;
    }
    if (!category.trim()) {
      toast.error('Category is required (e.g. Yoga, Physiotherapy).');
      return;
    }

    setSaving(true);
    const result = await addHealthmate({
      name: name.trim(),
      type,
      category: category.trim(),
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
    });
    setSaving(false);

    if (result && result.success) {
      toast.success('New partner added successfully!');
      // Reset form
      setName('');
      setType('PRACTITIONER');
      setCategory('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      onClose();
    } else {
      toast.error(result.message || 'Failed to add partner.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#2C3E50]/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Add New Healthmate Partner"
      >
        <div
          className="relative w-full max-w-md bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/40 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                <UserPlus className="w-4.5 h-4.5 text-brand-teal" />
              </div>
              <h2 className="text-text-main font-extrabold text-lg tracking-wide">
                Add Partner
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors"
              aria-label="Close add modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Company / Partner Name*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Partner Type*
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
              >
                <option value="PRACTITIONER">Practitioner</option>
                <option value="CENTRE">Centre</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Category*
              </label>
              <CategorySelector
                value={category}
                onChange={setCategory}
                disabled={saving}
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Contact Person Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +61412345678"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-border-leaf/40">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/40 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Partner'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-slate-50 text-text-main border border-border-leaf font-bold rounded-xl px-4 py-2.5 text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
