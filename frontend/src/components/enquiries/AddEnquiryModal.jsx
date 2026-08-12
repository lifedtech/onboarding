import { useState } from 'react';
import {   X, Loader2, UserPlus, Calendar, PhoneCall, Plus, AtSign   } from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import LocationSelector from '../LocationSelector';

const QUALIFICATION_CRITERIA = [
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
];

export default function AddEnquiryModal({ isOpen, onClose, defaultType, initialData }) {
  const createEnquiry = useOpsStore((s) => s.createEnquiry);

  // Diary "Add to Enquiry" tags map onto the fields that exist here; location has no
  // dedicated free-text field so it's dropped into remarks as a reference note.
  const prefillRemarks = initialData?.location ? `Location: ${initialData.location}` : '';
  // Diary sends social as one comma-joined string — split back into individual rows.
  const initialSocials = (initialData?.social || '').split(',').map((s) => s.trim()).filter(Boolean);

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [contactCode, setContactCode] = useState('+91');
  const [contactPhone, setContactPhone] = useState((initialData?.contact || '').replace(/\D/g, '').slice(-10));
  const [altContactCode, setAltContactCode] = useState('+91');
  const [altContactPhone, setAltContactPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState(initialSocials.length ? initialSocials : ['']);
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
  const [remarks, setRemarks] = useState(prefillRemarks);
  const [callbackLater, setCallbackLater] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [qScores, setQScores] = useState({});

  if (!isOpen) return null;

  const totalScore = Object.values(qScores).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const handleSocialChange = (index, value) => {
    setSocialLinks((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const addSocialField = () => setSocialLinks((prev) => [...prev, '']);

  const removeSocialField = (index) => {
    setSocialLinks((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      toast.error('A valid 10-digit primary phone number is required.');
      return;
    }
    if (clientType === 'HEALTH_PARTNER' && callbackLater && !reminderDate) {
      toast.error('Please specify a reminder date for callback.');
      return;
    }

    setSaving(true);
    // No dedicated "social" column on Enquiry — fold cleaned handles into remarks, same as location.
    const cleanSocials = socialLinks.map((s) => s.trim()).filter(Boolean);
    const fullRemarks = [remarks.trim(), cleanSocials.length ? `Social: ${cleanSocials.join(', ')}` : '']
      .filter(Boolean)
      .join('\n');

    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      contact: `${contactCode} ${contactPhone.trim()}`,
      alternateContact: altContactPhone.trim() ? `${altContactCode} ${altContactPhone.trim()}` : null,
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
      remarks: fullRemarks || null,
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
      setEmail('');
      setContactCode('+91');
      setContactPhone('');
      setAltContactCode('+91');
      setAltContactPhone('');
      setSocialLinks(['']);
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
          className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-border-leaf rounded-3xl shadow-2xl shadow-[#2C3E50]/10 flex flex-col overflow-hidden"
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

            {/* Email */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. liam@example.com"
                className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
              />
            </div>

            {/* Phone Numbers */}
            <div className="flex gap-4">
              {/* Primary Phone */}
              <div className="flex-1">
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Phone Number*
                </label>
                <div className="flex gap-2">
                  <select
                    value={contactCode}
                    onChange={(e) => setContactCode(e.target.value)}
                    className="w-[90px] bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="text"
                    maxLength={10}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9967328040"
                    className="flex-1 bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                    required
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="flex-1">
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Alternate Phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={altContactCode}
                    onChange={(e) => setAltContactCode(e.target.value)}
                    className="w-[90px] bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="text"
                    maxLength={10}
                    value={altContactPhone}
                    onChange={(e) => setAltContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="flex-1 bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Social — repeatable, one handle per row */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-text-main text-xs font-extrabold uppercase">
                  Social
                </label>
                <button
                  type="button"
                  onClick={addSocialField}
                  className="flex items-center gap-1 text-brand-teal hover:text-brand-teal-hover text-xs font-extrabold px-1.5 py-0.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {socialLinks.map((val, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleSocialChange(index, e.target.value)}
                        placeholder="e.g. instagram.com/liam.parker"
                        className="w-full bg-slate-50 border border-border-leaf/80 text-text-main placeholder-text-muted/40 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      />
                    </div>
                    {socialLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialField(index)}
                        className="shrink-0 text-text-muted hover:text-red-500 p-2 rounded-lg transition-colors"
                        aria-label="Remove social"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <LocationSelector
              city={city}
              setCity={setCity}
              state={state}
              setState={setState}
              country={country}
              setCountry={setCountry}
            />

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


                {/* Qualification Score */}
                <div className="p-4 sm:p-5 bg-slate-50/50 rounded-2xl border border-border-leaf/35 overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-text-main text-xs font-extrabold uppercase tracking-wide">Qualification Score</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Tap a score per criterion. Ideal: 35+ / 50.</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-2xl font-black leading-none ${totalScore >= 35 ? 'text-brand-green' : 'text-brand-teal'}`}>
                        {totalScore}
                      </span>
                      <span className="text-xs font-bold text-text-muted">/50</span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-3 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${totalScore >= 35 ? 'bg-brand-green' : 'bg-brand-teal'}`}
                      style={{ width: `${Math.min(100, (totalScore / 50) * 100)}%` }}
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto -mr-1 pr-1 custom-scrollbar">
                    <div className="bg-white border border-border-leaf/40 rounded-xl divide-y divide-border-leaf/35">
                      {QUALIFICATION_CRITERIA.map((item) => {
                        const value = qScores[item.key] || 0;
                        return (
                          <div key={item.key} className="flex items-center justify-between gap-3 py-2.5 px-3.5 hover:bg-slate-50 transition-colors">
                            <div className="min-w-0">
                              <div className="text-[11px] font-extrabold text-text-main">{item.label}</div>
                              <div className="text-[9px] text-text-muted font-semibold truncate" title={item.desc}>{item.desc}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {[0, 1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setQScores((prev) => ({ ...prev, [item.key]: n }))}
                                  aria-pressed={value === n}
                                  className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition-all ${
                                    value === n
                                      ? 'bg-brand-teal text-white shadow-sm shadow-brand-teal/30'
                                      : 'bg-slate-50 border border-border-leaf/60 text-text-muted hover:border-brand-teal/50 hover:text-brand-teal'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
