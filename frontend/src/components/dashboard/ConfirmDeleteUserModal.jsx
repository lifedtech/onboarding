import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function ConfirmDeleteUserModal({ isOpen, onClose, userId, userName, onSuccess }) {
  const deleteServiceUser = useOpsStore((s) => s.deleteServiceUser);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading('Deleting service user profile...');
    const result = await deleteServiceUser(userId);
    toast.dismiss(toastId);
    setDeleting(false);

    if (result && result.success) {
      toast.success(`Service user profile for ${userName} deleted successfully.`);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message || 'Failed to delete service user profile.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-[#2C3E50]/65 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm Delete Service User Profile"
      >
        <div
          className="relative w-full max-w-sm bg-white border border-rose-100 rounded-3xl shadow-2xl shadow-[#2C3E50]/15 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
              </div>
              <h2 className="text-text-main font-extrabold text-md tracking-wide">
                Remove User Profile
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-1.5 transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-3">
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              Are you sure you want to permanently delete the profile for{' '}
              <span className="text-text-main font-extrabold">{userName}</span>?
            </p>
            <p className="text-rose-500 text-[11px] font-bold bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50 leading-relaxed">
              This action will remove all historical bookings, billing statements, and support logs. This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-500/10 cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Yes, Remove'
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white hover:bg-slate-100 text-text-main border border-slate-200 font-bold rounded-xl py-2.5 text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
