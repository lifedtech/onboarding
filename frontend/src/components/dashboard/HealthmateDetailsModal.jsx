import React from 'react';
import { X, Calendar, MapPin, PhoneCall, User, ShieldCheck, Clock, Activity } from 'lucide-react';

export default function HealthmateDetailsModal({ isOpen, onClose, healthmate }) {
  if (!isOpen || !healthmate) return null;

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

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'LIVE': return 'text-brand-green bg-brand-green/10 border-brand-green/20';
      case 'REVIEW': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'REGISTER': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PREPARE': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-leaf/30 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
              <User className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main tracking-tight">{healthmate.name}</h2>
              <p className="text-xs font-bold text-text-muted mt-0.5 capitalize flex items-center gap-1.5">
                {healthmate.type ? healthmate.type.toLowerCase().replace('_', ' ') : 'Healthmate'}
                {healthmate.category && ` • ${healthmate.category}`}
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* Status Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl flex flex-col border ${getPhaseColor(healthmate.phase)}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1">
                Current Phase
              </span>
              <span className="text-sm font-black uppercase tracking-wider">
                {healthmate.phase ? healthmate.phase.replace('_', ' ') : 'UNKNOWN'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl flex flex-col border ${
              healthmate.registrationStatus === 'VERIFIED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1">
                {healthmate.registrationStatus === 'VERIFIED' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                Registration Status
              </span>
              <span className="text-sm font-black uppercase tracking-wider">
                {healthmate.registrationStatus || 'PENDING'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <PhoneCall className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Contact Details</span>
              </div>
              {healthmate.contactName && (
                <p className="text-sm font-bold text-text-main mb-1">
                  Contact: <span className="font-extrabold">{healthmate.contactName}</span>
                </p>
              )}
              {healthmate.contactPhone ? (
                <p className="text-sm font-bold text-text-muted break-all">{healthmate.contactPhone}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No phone provided</p>
              )}
              
              {healthmate.contactEmail && (
                <p className="text-sm font-bold text-text-muted break-all mt-1">{healthmate.contactEmail}</p>
              )}

              {healthmate.alternatePhone && (
                <p className="text-sm font-bold text-text-muted break-all mt-1">{healthmate.alternatePhone} (Alt)</p>
              )}
            </div>

            {/* Location */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Location</span>
              </div>
              <p className="text-sm font-bold text-text-main mt-0.5">
                {[healthmate.city, healthmate.state, healthmate.country].filter(Boolean).join(', ') || <span className="text-slate-400 italic">Location not provided</span>}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3">
                 <Activity className="w-4 h-4 text-slate-400" />
                 <span className="text-xs font-extrabold text-slate-500 uppercase">Days in Phase:</span>
                 <span className="text-xs font-black text-text-main">{healthmate.daysInPhase || 0} days</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
