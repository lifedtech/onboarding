import { useState } from 'react';
import { X, Loader2, UserPlus, Calendar, PhoneCall } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function AddEnquiryModal({ isOpen, onClose }) {
  const createEnquiry = useOpsStore((s) => s.createEnquiry);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [clientType, setClientType] = useState('HEALTH_PARTNER'); // 'HEALTH_PARTNER' or 'SERVICE_USER'
  const [contacted, setContacted] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [callbackLater, setCallbackLater] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (!contact.trim()) {
      toast.error('Contact email or phone is required.');
      return;
    }
    if (clientType === 'HEALTH_PARTNER' && callbackLater && !reminderDate) {
      toast.error('Please specify a reminder date for callback.');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      clientType,
      contacted,
      remarks: remarks.trim() || null,
      callbackLater: clientType === 'HEALTH_PARTNER' ? callbackLater : false,
      reminderDate: (clientType === 'HEALTH_PARTNER' && callbackLater && reminderDate)
        ? new Date(reminderDate).toISOString()
        : null,
    };

    const result = await createEnquiry(payload);
    setSaving(false);

    if (result && result.success) {
      toast.success('New enquiry recorded successfully!');
      // Reset form
      setName('');
      setContact('');
      setClientType('HEALTH_PARTNER');
      setContacted(false);
      setRemarks('');
      setCallbackLater(false);
      setReminderDate('');
      onClose();
    } else {
      toast.error(result.message || 'Failed to record enquiry.');
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
        aria-label="Add New Enquiry"
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
                Add Enquiry
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Name */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Full Name*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Parker"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                required
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Contact Details*
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. liam@example.com or +61412345678"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                required
              />
            </div>

            {/* Client Type Toggle Button */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Client Type*
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setClientType('SERVICE_USER');
                    setCallbackLater(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    clientType === 'SERVICE_USER'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Service User
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('HEALTH_PARTNER')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    clientType === 'HEALTH_PARTNER'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Health Partner
                </button>
              </div>
            </div>

            {/* Contacted Checkbox */}
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="contacted"
                checked={contacted}
                onChange={(e) => setContacted(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal transition-colors"
              />
              <label htmlFor="contacted" className="text-sm font-bold text-text-main cursor-pointer select-none">
                Already Contacted
              </label>
            </div>

            {/* Remarks Section */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Remarks / Contact Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Details of enquiry or contact logs..."
                rows={3}
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all resize-none"
              />
            </div>

            {/* Call back & Reminder Section (Conditional on clientType === HEALTH_PARTNER) */}
            {clientType === 'HEALTH_PARTNER' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="callbackLater"
                    checked={callbackLater}
                    onChange={(e) => setCallbackLater(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal transition-colors"
                  />
                  <label
                    htmlFor="callbackLater"
                    className="text-xs font-extrabold text-text-main flex items-center gap-1.5 cursor-pointer select-none uppercase tracking-wide"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-brand-teal" />
                    Asks for callback later
                  </label>
                </div>

                {callbackLater && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
                      Schedule Callback Reminder
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="datetime-local"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full bg-white border border-border-leaf/80 text-text-main rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                        required={callbackLater}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-border-leaf/40">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/40 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Enquiry'
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
