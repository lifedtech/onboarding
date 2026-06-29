import { X, Calendar, MapPin, PhoneCall, FileText, User } from 'lucide-react';

export default function EnquiryDetailsModal({ isOpen, onClose, enquiry }) {
  if (!isOpen || !enquiry) return null;

  const formatIST = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-leaf/30 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
              <User className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main tracking-tight">{enquiry.name}</h2>
              <p className="text-xs font-bold text-text-muted mt-0.5 capitalize flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${enquiry.contacted ? 'bg-brand-green' : 'bg-amber-400'}`}></span>
                {enquiry.clientType.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl flex items-center justify-between border ${
            enquiry.contacted 
              ? 'bg-brand-green/10 border-brand-green/20' 
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <span className={`text-xs font-black uppercase tracking-wider ${
              enquiry.contacted ? 'text-brand-green' : 'text-amber-600'
            }`}>
              {enquiry.contacted ? 'Contacted & Addressed' : 'Pending Contact'}
            </span>
            <span className={`text-[10px] font-bold ${
              enquiry.contacted ? 'text-brand-green/70' : 'text-amber-600/70'
            }`}>
              {formatIST(enquiry.createdAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <PhoneCall className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Contact Details</span>
              </div>
              <p className="text-sm font-bold text-text-main break-all">{enquiry.contact}</p>
            </div>

            {/* Location */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Location</span>
              </div>
              <p className="text-sm font-bold text-text-main">
                {enquiry.city || enquiry.state 
                  ? [enquiry.city, enquiry.state].filter(Boolean).join(', ') 
                  : <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-brand-teal" />
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Remarks / Notes</span>
            </div>
            {enquiry.remarks ? (
              <p className="text-sm font-bold text-text-main leading-relaxed whitespace-pre-wrap">{enquiry.remarks}</p>
            ) : (
              <p className="text-sm font-semibold text-slate-400 italic">No remarks recorded.</p>
            )}
          </div>

          {/* Reminder */}
          {enquiry.callbackLater && (
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-extrabold uppercase text-violet-400 tracking-wider">Follow-up Scheduled</span>
              </div>
              <p className="text-sm font-black text-violet-700">
                {enquiry.reminderDate ? formatIST(enquiry.reminderDate) : 'Date not set'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-text-main text-xs font-extrabold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
