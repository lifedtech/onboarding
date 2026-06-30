import { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import CategorySelector from '../pipeline/CategorySelector';

export default function PromotePartnerModal({ isOpen, onClose, enquiryId, enquiryName }) {
  const promoteEnquiry = useOpsStore((s) => s.promoteEnquiry);

  const [category, setCategory] = useState('Wellness');
  const [type, setType] = useState('PRACTITIONER'); // 'PRACTITIONER', 'CENTRE', or 'ORGANIZER'
  const [promoting, setPromoting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.trim()) {
      toast.error('Partner category is required.');
      return;
    }

    setPromoting(true);
    const toastId = toast.loading('Promoting enquiry to pipeline...');
    const result = await promoteEnquiry(enquiryId, category.trim(), type);
    toast.dismiss(toastId);
    setPromoting(false);

    if (result && result.success) {
      toast.success('Successfully promoted to partner pipeline!');
      onClose();
    } else {
      toast.error(result.message || 'Failed to promote enquiry.');
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
        aria-label="Promote Enquiry to Partner"
      >
        <div
          className="relative w-full max-w-md bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/40 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                <ArrowRight className="w-4.5 h-4.5 text-brand-teal" />
              </div>
              <div>
                <h2 className="text-text-main font-extrabold text-lg tracking-wide">
                  Promote Partner
                </h2>
                <p className="text-text-muted text-xs font-semibold mt-0.5">
                  Promoting <span className="text-brand-teal font-bold">{enquiryName}</span> to pipeline
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Partner Category*
              </label>
              <CategorySelector
                value={category}
                onChange={setCategory}
                disabled={promoting}
              />
            </div>

            {/* Partner Type Toggle Buttons */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Partner Type*
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setType('PRACTITIONER')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    type === 'PRACTITIONER'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Practitioner
                </button>
                <button
                  type="button"
                  onClick={() => setType('CENTRE')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    type === 'CENTRE'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Centre
                </button>
                <button
                  type="button"
                  onClick={() => setType('ORGANIZER')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    type === 'ORGANIZER'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Organizer
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-border-leaf/40">
              <button
                type="submit"
                disabled={promoting}
                className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/40 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10 cursor-pointer"
              >
                {promoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  'Promote to Pre-qualify'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-slate-50 text-text-main border border-border-leaf font-bold rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer"
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
