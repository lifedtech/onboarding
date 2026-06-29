import { useState } from 'react';
import { X, Loader2, UserPlus, Calendar, PhoneCall } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';

export default function AddEnquiryModal({ isOpen, onClose, defaultType }) {
  const createEnquiry = useOpsStore((s) => s.createEnquiry);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [platformFound, setPlatformFound] = useState('');
  const [programPossibility, setProgramPossibility] = useState('');
  const [format, setFormat] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [capacity, setCapacity] = useState('');
  const [clientType, setClientType] = useState(defaultType || 'HEALTH_PARTNER'); // 'HEALTH_PARTNER' or 'SERVICE_USER'
  const [contacted, setContacted] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [callbackLater, setCallbackLater] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [qScores, setQScores] = useState({});

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
      city: city.trim() || null,
      state: state.trim() || null,
      country: country.trim() || null,
      subcategory: subcategory.trim() || null,
      platformFound: platformFound.trim() || null,
      programPossibility: programPossibility.trim() || null,
      format: format.trim() || null,
      priceRange: priceRange.trim() || null,
      capacity: capacity.trim() || null,
      clientType,
      contacted,
      remarks: remarks.trim() || null,
      callbackLater: clientType === 'HEALTH_PARTNER' ? callbackLater : false,
      reminderDate: (clientType === 'HEALTH_PARTNER' && callbackLater && reminderDate)
        ? new Date(reminderDate).toISOString()
        : null,
      ...qScores
    };

    const result = await createEnquiry(payload);
    setSaving(false);

    if (result && result.success) {
      toast.success('New enquiry recorded successfully!');
      // Reset form
      setName('');
      setContact('');
      setCity('');
      setState('');
      setCountry('');
      setSubcategory('');
      setPlatformFound('');
      setProgramPossibility('');
      setFormat('');
      setPriceRange('');
      setCapacity('');
      setClientType(defaultType || 'HEALTH_PARTNER');
      setContacted(false);
      setRemarks('');
      setCallbackLater(false);
      setReminderDate('');
      setQScores({});
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
          className="relative w-full max-w-2xl bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
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

            {/* Location */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                />
              </div>
            </div>

            {/* Client Type Toggle Button */}
            {!defaultType && (
              <div>
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Client Type*
                </label>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-border-leaf/60">
                  <button
                    type="button"
                    onClick={() => setClientType('SERVICE_USER')}
                    className={`flex-1 text-sm font-extrabold py-2.5 rounded-xl transition-all ${
                      clientType === 'SERVICE_USER'
                        ? 'bg-brand-teal text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Service User
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType('HEALTH_PARTNER')}
                    className={`flex-1 text-sm font-extrabold py-2.5 rounded-xl transition-all ${
                      clientType === 'HEALTH_PARTNER'
                        ? 'bg-brand-teal text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Health Partner
                  </button>
                </div>
              </div>
            )}

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
              <div className="space-y-5">


                {/* Qualification Table */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-border-leaf/35 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-text-main text-xs font-extrabold uppercase">Qualification Score</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Score 1-5. Ideal: 35+ / 50.</p>
                    </div>
                    <div className="bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-brand-teal uppercase tracking-wider">Total:</span>
                      <span className="text-sm font-black text-brand-teal">
                        {Object.values(qScores).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto border border-border-leaf/40 rounded-xl">
                    <table className="w-full text-left border-collapse table-fixed bg-white">
                      <tbody className="divide-y divide-border-leaf/35 text-[10px] text-text-main font-bold">
                        {[
                          { key: 'scoreRelevance', label: 'Program relevance', desc: 'Does it fit wellness, functional movement, or recovery?' },
                          { key: 'scoreSafety', label: 'Safety', desc: 'Is it non-clinical, non-invasive, and suitable for general users?' },
                          { key: 'scoreExperience', label: 'Experience quality', desc: 'Does the program feel meaningful, structured, and memorable?' },
                          { key: 'scoreCredibility', label: 'Facilitator credibility', desc: 'Do they have training, experience, reviews, or visible work?' },
                          { key: 'scoreLocation', label: 'Location quality', desc: 'Is the venue safe, accessible, calm, and suitable?' },
                          { key: 'scoreVisual', label: 'Visual appeal', desc: 'Can it be marketed well through photos and videos?' },
                          { key: 'scoreBooking', label: 'Booking readiness', desc: 'Can they give date, duration, price, inclusions, capacity?' },
                          { key: 'scoreUniqueness', label: 'Uniqueness', desc: 'Does it add something different to Lifed?' },
                          { key: 'scoreCorporate', label: 'Corporate potential', desc: 'Can this be adapted for employee wellbeing?' },
                          { key: 'scoreRepeatability', label: 'Repeatability', desc: 'Can this program run monthly or quarterly?' },
                        ].map((item) => (
                          <tr key={item.key} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 w-[70%]">
                              <div className="text-[11px]">{item.label}</div>
                              <div className="text-[9px] text-text-muted font-semibold truncate" title={item.desc}>{item.desc}</div>
                            </td>
                            <td className="py-2 px-3 w-[30%]">
                              <input
                                type="number"
                                min="0"
                                max="5"
                                value={qScores[item.key] || ''}
                                onChange={(e) => {
                                  const val = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                                  setQScores(prev => ({ ...prev, [item.key]: val }));
                                }}
                                className="w-full text-center bg-white border border-border-leaf/80 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

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
