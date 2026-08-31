import { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  UserPlus, 
  Edit3, 
  Calendar, 
  PhoneCall, 
  Plus, 
  AtSign, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
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

const parsePhone = (rawPhone) => {
  if (!rawPhone) return { code: '+91', number: '' };
  const trimmed = String(rawPhone).trim();
  const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return { code: match[1], number: match[2].replace(/\D/g, '') };
  }
  return { code: '+91', number: trimmed.replace(/\D/g, '') };
};

const formatToLocalISO = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

export default function AddEnquiryModal({ isOpen, onClose, defaultType, initialData, enquiry }) {
  const createEnquiry = useOpsStore((s) => s.createEnquiry);
  const updateEnquiry = useOpsStore((s) => s.updateEnquiry);

  const activeEnquiry = enquiry || (initialData?.id ? initialData : null);
  const isEditMode = Boolean(activeEnquiry);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactCode, setContactCode] = useState('+91');
  const [contactPhone, setContactPhone] = useState('');
  const [altContactCode, setAltContactCode] = useState('+91');
  const [altContactPhone, setAltContactPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState(['']);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [platformFound, setPlatformFound] = useState('');
  const [programPossibility, setProgramPossibility] = useState('');
  const [format, setFormat] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [capacity, setCapacity] = useState('');
  const [clientType, setClientType] = useState('HEALTH_PARTNER');
  const [contacted, setContacted] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [callbackLater, setCallbackLater] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [qScores, setQScores] = useState({});
  const [showProgramDetails, setShowProgramDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (activeEnquiry) {
      // Editing existing enquiry
      setName(activeEnquiry.name || '');
      setEmail(activeEnquiry.email || '');

      const parsedPrimary = parsePhone(activeEnquiry.contact);
      setContactCode(parsedPrimary.code || '+91');
      setContactPhone(parsedPrimary.number || '');

      const parsedAlt = parsePhone(activeEnquiry.alternateContact);
      setAltContactCode(parsedAlt.code || '+91');
      setAltContactPhone(parsedAlt.number || '');

      // Parse social links if present in remarks or dedicated
      let cleanedRemarks = activeEnquiry.remarks || '';
      let extractedSocials = [];

      const lines = cleanedRemarks.split('\n');
      const filteredLines = [];
      for (const line of lines) {
        if (line.trim().toLowerCase().startsWith('social:')) {
          const raw = line.replace(/^social:\s*/i, '');
          const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
          extractedSocials.push(...parts);
        } else {
          filteredLines.push(line);
        }
      }

      setSocialLinks(extractedSocials.length ? extractedSocials : ['']);
      setRemarks(filteredLines.join('\n').trim());

      setCity(activeEnquiry.city || '');
      setState(activeEnquiry.state || '');
      setCountry(activeEnquiry.country || '');
      setSubcategory(activeEnquiry.subcategory || '');
      setPlatformFound(activeEnquiry.platformFound || '');
      setProgramPossibility(activeEnquiry.programPossibility || '');
      setFormat(activeEnquiry.format || '');
      setPriceRange(activeEnquiry.priceRange || '');
      setCapacity(activeEnquiry.capacity || '');
      setClientType(activeEnquiry.clientType || defaultType || 'HEALTH_PARTNER');
      setContacted(Boolean(activeEnquiry.contacted));
      setCallbackLater(Boolean(activeEnquiry.callbackLater));
      setReminderDate(formatToLocalISO(activeEnquiry.reminderDate));

      const scores = {};
      QUALIFICATION_CRITERIA.forEach((crit) => {
        scores[crit.key] = activeEnquiry[crit.key] ?? 0;
      });
      setQScores(scores);

      if (activeEnquiry.subcategory || activeEnquiry.platformFound || activeEnquiry.programPossibility || activeEnquiry.format || activeEnquiry.priceRange || activeEnquiry.capacity) {
        setShowProgramDetails(true);
      }
    } else {
      // Adding new enquiry
      const prefillRemarks = initialData?.location ? `Location: ${initialData.location}` : '';
      const initialSocials = (initialData?.social || '').split(',').map((s) => s.trim()).filter(Boolean);
      const parsedPrimary = parsePhone(initialData?.contact);

      setName(initialData?.name || '');
      setEmail(initialData?.email || '');
      setContactCode(parsedPrimary.code || '+91');
      setContactPhone(parsedPrimary.number ? parsedPrimary.number.slice(-10) : '');
      setAltContactCode('+91');
      setAltContactPhone('');
      setSocialLinks(initialSocials.length ? initialSocials : ['']);
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
      setRemarks(prefillRemarks);
      setCallbackLater(false);
      setReminderDate('');
      setQScores({});
      setShowProgramDetails(false);
    }
  }, [isOpen, activeEnquiry, initialData, defaultType]);

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
    if (!contactPhone.trim() || contactPhone.trim().length < 7) {
      toast.error('A valid primary phone number is required.');
      return;
    }
    if (clientType === 'HEALTH_PARTNER' && callbackLater && !reminderDate) {
      toast.error('Please specify a reminder date for callback.');
      return;
    }

    setSaving(true);

    const cleanSocials = socialLinks.map((s) => s.trim()).filter(Boolean);
    const fullRemarks = [
      remarks.trim(),
      cleanSocials.length ? `Social: ${cleanSocials.join(', ')}` : ''
    ].filter(Boolean).join('\n');

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

    let result;
    if (isEditMode) {
      result = await updateEnquiry(activeEnquiry.id, payload);
    } else {
      result = await createEnquiry(payload);
    }

    setSaving(false);

    if (result && result.success) {
      toast.success(isEditMode ? 'Enquiry updated successfully!' : 'New enquiry recorded successfully!');
      onClose();
    } else {
      toast.error(result?.message || `Failed to ${isEditMode ? 'update' : 'record'} enquiry.`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? 'Edit Enquiry Details' : 'Add New Enquiry'}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-leaf/40 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                {isEditMode ? (
                  <Edit3 className="w-5 h-5 text-brand-teal" />
                ) : (
                  <UserPlus className="w-5 h-5 text-brand-teal" />
                )}
              </div>
              <div>
                <h2 className="text-text-main font-black text-lg tracking-tight">
                  {isEditMode ? 'Edit Enquiry Details' : 'Add New Enquiry'}
                </h2>
                <p className="text-text-muted text-xs font-semibold mt-0.5">
                  {isEditMode
                    ? `Update information and qualification metrics for ${activeEnquiry?.name || 'enquiry'}`
                    : 'Fill in details to register a new intake enquiry'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-2 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
            {/* Full Name */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Full Name*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Parker / The Brew School"
                className="w-full bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
              />
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Phone */}
              <div>
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Phone Number*
                </label>
                <div className="flex gap-2">
                  <select
                    value={contactCode}
                    onChange={(e) => setContactCode(e.target.value)}
                    className="w-[90px] bg-slate-50 border border-slate-200 text-text-main rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+49">+49 (DE)</option>
                  </select>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9967328040"
                    className="flex-1 bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
                    required
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                  Alternate Phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={altContactCode}
                    onChange={(e) => setAltContactCode(e.target.value)}
                    className="w-[90px] bg-slate-50 border border-slate-200 text-text-main rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+49">+49 (DE)</option>
                  </select>
                  <input
                    type="text"
                    value={altContactPhone}
                    onChange={(e) => setAltContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="flex-1 bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-text-main text-xs font-extrabold uppercase">
                  Social Links / Handles
                </label>
                <button
                  type="button"
                  onClick={addSocialField}
                  className="flex items-center gap-1 text-brand-teal hover:text-brand-teal-hover text-xs font-extrabold px-2 py-1 bg-brand-teal/10 hover:bg-brand-teal/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Link
                </button>
              </div>
              <div className="space-y-2">
                {socialLinks.map((val, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleSocialChange(index, e.target.value)}
                        placeholder="e.g. instagram.com/liam.parker or @handle"
                        className="w-full bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
                      />
                    </div>
                    {socialLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialField(index)}
                        className="shrink-0 text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

            {/* Client Type Toggle */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Client Type*
              </label>
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setClientType('HEALTH_PARTNER')}
                  className={`flex-1 text-xs sm:text-sm font-extrabold py-2 rounded-xl transition-all cursor-pointer ${
                    clientType === 'HEALTH_PARTNER'
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'text-slate-500 hover:text-text-main'
                  }`}
                >
                  Health Partner
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('SERVICE_USER')}
                  className={`flex-1 text-xs sm:text-sm font-extrabold py-2 rounded-xl transition-all cursor-pointer ${
                    clientType === 'SERVICE_USER'
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'text-slate-500 hover:text-text-main'
                  }`}
                >
                  Service User
                </button>
              </div>
            </div>

            {/* Contacted Checkbox */}
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="contactedModal"
                checked={contacted}
                onChange={(e) => setContacted(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal transition-colors cursor-pointer"
              />
              <label htmlFor="contactedModal" className="text-sm font-bold text-text-main cursor-pointer select-none">
                Already Contacted & Addressed
              </label>
            </div>

            {/* Additional Program / Service Details (Collapsible) */}
            <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/40">
              <button
                type="button"
                onClick={() => setShowProgramDetails((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-slate-700 uppercase tracking-wider hover:bg-slate-100/60 transition-colors"
              >
                <span>Program & Service Details (Optional)</span>
                {showProgramDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showProgramDetails && (
                <div className="p-4 pt-1 space-y-3 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="e.g. Yoga, Physiotherapy"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Platform Found</label>
                      <input
                        type="text"
                        value={platformFound}
                        onChange={(e) => setPlatformFound(e.target.value)}
                        placeholder="e.g. Instagram, Referral, Website"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Format</label>
                      <input
                        type="text"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        placeholder="e.g. In-Person / Online"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Price Range</label>
                      <input
                        type="text"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        placeholder="e.g. ₹1500 - ₹3000"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Capacity</label>
                      <input
                        type="text"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="e.g. 10 - 20 pax"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Program Possibility</label>
                    <input
                      type="text"
                      value={programPossibility}
                      onChange={(e) => setProgramPossibility(e.target.value)}
                      placeholder="e.g. Weekend Retreat, Corporate Workshop"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remarks Section */}
            <div>
              <label className="block text-text-main text-xs font-extrabold uppercase mb-1.5">
                Remarks / Contact Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Details of enquiry, conversation notes, or follow-up context..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-text-main placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all resize-none"
              />
            </div>

            {/* Health Partner Specifics (Qualification + Reminder) */}
            {clientType === 'HEALTH_PARTNER' && (
              <div className="space-y-4">
                {/* Qualification Score Section */}
                <div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-text-main text-xs font-extrabold uppercase tracking-wide">
                        Qualification Score
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5 font-semibold">
                        Select a score per criterion. Target: 35+ / 50.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-2xl font-black leading-none ${totalScore >= 35 ? 'text-brand-green' : 'text-brand-teal'}`}>
                        {totalScore}
                      </span>
                      <span className="text-xs font-bold text-text-muted">/50</span>
                    </div>
                  </div>

                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-3 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${totalScore >= 35 ? 'bg-brand-green' : 'bg-brand-teal'}`}
                      style={{ width: `${Math.min(100, (totalScore / 50) * 100)}%` }}
                    />
                  </div>

                  <div className="max-h-[260px] overflow-y-auto -mr-1 pr-1 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
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
                                  className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                    value === n
                                      ? 'bg-brand-teal text-white shadow-sm shadow-brand-teal/30 scale-105'
                                      : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-brand-teal hover:text-brand-teal'
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

                {/* Callback & Reminder */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="callbackLaterModal"
                      checked={callbackLater}
                      onChange={(e) => setCallbackLater(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal transition-colors cursor-pointer"
                    />
                    <label
                      htmlFor="callbackLaterModal"
                      className="text-xs font-extrabold text-text-main flex items-center gap-1.5 cursor-pointer select-none uppercase tracking-wide"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-brand-teal" />
                      Asks for callback later
                    </label>
                  </div>

                  {callbackLater && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
                        Schedule Callback Reminder Date & Time
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="datetime-local"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-text-main rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
                          required={callbackLater}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/40 text-white font-extrabold rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-teal/10 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditMode ? 'Saving Changes...' : 'Recording Enquiry...'}
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Enquiry'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-slate-50 text-text-main border border-slate-200 font-bold rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer"
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
