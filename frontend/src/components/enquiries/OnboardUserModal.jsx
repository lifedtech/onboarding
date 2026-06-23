import { useState } from 'react';
import { X, Loader2, HeartHandshake } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function OnboardUserModal({ isOpen, onClose, enquiryId, enquiryName }) {
  const promoteEnquiryToUser = useOpsStore((s) => s.promoteEnquiryToUser);
  const [tier, setTier] = useState('BASIC'); // 'BASIC', 'PREMIUM', or 'VIP'
  const [onboarding, setOnboarding] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setOnboarding(true);
    const toastId = toast.loading('Onboarding service user...');
    const result = await promoteEnquiryToUser(enquiryId, tier);
    toast.dismiss(toastId);
    setOnboarding(false);

    if (result && result.success) {
      toast.success(`Successfully onboarded ${enquiryName} as a Service User!`);
      onClose();
    } else {
      toast.error(result.message || 'Failed to onboard service user.');
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
        aria-label="Onboard Service User Enquiry"
      >
        <div
          className="relative w-full max-w-md bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/40 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <HeartHandshake className="w-4.5 h-4.5 text-brand-green" />
              </div>
              <div>
                <h2 className="text-text-main font-extrabold text-lg tracking-wide">
                  Onboard Service User
                </h2>
                <p className="text-text-muted text-xs font-semibold mt-0.5">
                  Confirming onboarding for <span className="text-brand-green font-bold">{enquiryName}</span>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              This will create a new profile in the Service Users database and migrate contact details from enquiries.
            </p>

            {/* Membership Tier Toggle Buttons */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-2 tracking-wider">
                Select Membership Tier*
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setTier('BASIC')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    tier === 'BASIC'
                      ? 'bg-brand-green text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Basic
                </button>
                <button
                  type="button"
                  onClick={() => setTier('PREMIUM')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    tier === 'PREMIUM'
                      ? 'bg-brand-green text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  Premium
                </button>
                <button
                  type="button"
                  onClick={() => setTier('VIP')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    tier === 'VIP'
                      ? 'bg-brand-green text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-white/40'
                  }`}
                >
                  VIP
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-border-leaf/40">
              <button
                type="submit"
                disabled={onboarding}
                className="flex-1 bg-brand-green hover:bg-brand-green-hover disabled:bg-brand-green/45 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-green/10 cursor-pointer"
              >
                {onboarding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Onboarding...
                  </>
                ) : (
                  'Onboard User'
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
