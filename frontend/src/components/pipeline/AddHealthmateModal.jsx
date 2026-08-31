import React, { useState } from 'react';
import { 
  X, Loader2, Sparkles, MapPin, Globe, Plane, Lock, ArrowRight, Plus, Trash2, User
} from 'lucide-react';
import useOpsStore from '../../store/useOpsStore';
import toast from 'react-hot-toast';
import CategorySelector from './CategorySelector';
import LocationSelector from '../LocationSelector';

const COUNTRY_DIAL_CODES = [
  { code: '+91', label: '🇮🇳 +91 India', country: 'India' },
  { code: '+1',  label: '🇺🇸 +1 USA / Canada', country: 'USA' },
  { code: '+44', label: '🇬🇧 +44 UK', country: 'UK' },
  { code: '+61', label: '🇦🇺 +61 Australia', country: 'Australia' },
  { code: '+971', label: '🇦🇪 +971 UAE', country: 'UAE' },
  { code: '+65', label: '🇸🇬 +65 Singapore', country: 'Singapore' },
  { code: '+49', label: '🇩🇪 +49 Germany', country: 'Germany' },
  { code: '+33', label: '🇫🇷 +33 France', country: 'France' },
  { code: '+62', label: '🇮🇩 +62 Indonesia', country: 'Indonesia' },
  { code: '+66', label: '🇹🇭 +66 Thailand', country: 'Thailand' },
  { code: '+81', label: '🇯🇵 +81 Japan', country: 'Japan' },
  { code: '+27', label: '🇿🇦 +27 South Africa', country: 'South Africa' },
  { code: '+34', label: '🇪🇸 +34 Spain', country: 'Spain' },
  { code: '+39', label: '🇮🇹 +39 Italy', country: 'Italy' },
  { code: '+41', label: '🇨🇭 +41 Switzerland', country: 'Switzerland' },
  { code: '+55', label: '🇧🇷 +55 Brazil', country: 'Brazil' },
  { code: '+52', label: '🇲🇽 +52 Mexico', country: 'Mexico' },
  { code: '+64', label: '🇳🇿 +64 New Zealand', country: 'New Zealand' },
];

export default function AddHealthmateModal({ isOpen, onClose }) {
  const addHealthmate = useOpsStore((s) => s.addHealthmate);

  // Section 1: Basic Information
  const [type, setType] = useState('PRACTITIONER');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('+91');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [links, setLinks] = useState(['']);
  const [address, setAddress] = useState('');

  // Section 2: Expertise
  const [category, setCategory] = useState('Wellness');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [professionalBio, setProfessionalBio] = useState('');

  // Section 3: Location
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [nearestAirport, setNearestAirport] = useState('');

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleLinkChange = (index, value) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index) => {
    if (links.length === 1) {
      setLinks(['']);
      return;
    }
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      toast.error('Healthmate Type is required.');
      return;
    }

    if (!name.trim()) {
      toast.error('Entity / Partner Name is required.');
      return;
    }

    if (!category || !category.trim()) {
      toast.error('Please select at least one expertise category.');
      return;
    }

    if (professionalBio.trim() && professionalBio.trim().length < 50) {
      toast.error('Professional bio must be at least 50 characters long.');
      return;
    }

    const fullPhone = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : null;
    const fullWhatsapp = whatsappNumber.trim() ? `${whatsappCode} ${whatsappNumber.trim()}` : null;
    const formattedLinks = links.map((l) => l.trim()).filter(Boolean).join(', ');

    setSaving(true);
    const result = await addHealthmate({
      name: name.trim(),
      type,
      category: category.trim(),
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: fullPhone,
      alternatePhone: fullWhatsapp,
      website: formattedLinks || null,
      address: address.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      country: country.trim() || null,
      nearestAirport: nearestAirport.trim() || null,
      yearsOfExperience: yearsOfExperience.trim() || null,
      professionalBio: professionalBio.trim() || null,
    });
    setSaving(false);

    if (result && result.success) {
      toast.success('Partner added successfully!');
      // Reset form
      setName('');
      setType('PRACTITIONER');
      setCategory('Wellness');
      setContactName('');
      setContactEmail('');
      setPhoneNumber('');
      setWhatsappNumber('');
      setLinks(['']);
      setAddress('');
      setYearsOfExperience('');
      setProfessionalBio('');
      setCity('');
      setState('');
      setCountry('');
      setNearestAirport('');
      onClose();
    } else {
      toast.error(result.message || 'Failed to add partner.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#2C3E50]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Add Healthmate Partner"
      >
        <div
          className="relative w-full max-w-4xl max-h-[92vh] bg-slate-50/90 border border-border-leaf rounded-3xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-leaf/40 shrink-0 bg-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-brand-teal">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-text-main font-extrabold text-lg tracking-tight">
                  Add Partner
                </h2>
                <p className="text-text-muted text-xs font-semibold">
                  Register new wellbeing practitioner, centre or organizer
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl p-2 transition-colors cursor-pointer"
              aria-label="Close add modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)]">
            
            {/* ═════════════════════════════════════════════════════════════════
                SECTION 1: ABOUT YOU / Basic information
               ═════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-border-leaf/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 block mb-0.5">
                    About You
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                    Basic information
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tell us who will be hosting wellbeing experiences on LIFED.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Healthmate Type & Entity Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Healthmate Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    >
                      <option value="" disabled>Select Healthmate Type</option>
                      <option value="COMMUNITY_GROUP">Community Group</option>
                      <option value="PRACTITIONER">Practitioner</option>
                      <option value="PROGRAM_ORGANIZER">Program Organizer</option>
                      <option value="RETREAT_CENTRE">Retreat Centre</option>
                      <option value="WELLNESS_CENTRE">Wellness Centre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Entity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Organisation, centre or professional name"
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Contact Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Primary contact person"
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number & WhatsApp Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="w-32 bg-slate-50/70 border border-border-leaf/80 text-slate-800 rounded-xl px-2.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all shrink-0"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code + c.country} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone number"
                        className="flex-1 min-w-0 bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Select your country code and enter your mobile number.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCode}
                        onChange={(e) => setWhatsappCode(e.target.value)}
                        className="w-32 bg-slate-50/70 border border-border-leaf/80 text-slate-800 rounded-xl px-2.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all shrink-0"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code + c.country} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="WhatsApp number"
                        className="flex-1 min-w-0 bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Select the country code for your WhatsApp number.
                    </p>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 text-xs font-extrabold uppercase">
                      Links
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Link</span>
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Globe className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                          />
                        </div>
                        {links.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 cursor-pointer"
                            title="Remove link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete operating or correspondence address"
                    className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all resize-y"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 2: YOUR PRACTICE / Expertise
               ═════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-border-leaf/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 block mb-0.5">
                    Your Practice
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                    Expertise
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Help us understand the areas of wellbeing you work within.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Expertise Categories Multi-Select Dropdown */}
                <div>
                  <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                    Expertise Categories <span className="text-red-500">*</span>
                  </label>
                  <CategorySelector
                    value={category}
                    onChange={setCategory}
                    disabled={saving}
                    placeholder="Select Expertise Categories..."
                  />
                </div>

                {/* Years of Experience & Professional Bio */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-700 text-xs font-extrabold uppercase">
                        Professional Bio <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] font-bold ${professionalBio.length < 50 ? 'text-amber-600' : 'text-teal-700'}`}>
                        {professionalBio.length}/50 min chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={professionalBio}
                      onChange={(e) => setProfessionalBio(e.target.value)}
                      placeholder="Tell us about your background, approach, experience and the wellbeing work you do."
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all resize-y"
                      required
                    />
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Minimum 50 characters.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION 3: WHERE YOU OPERATE / Location
               ═════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-border-leaf/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 block mb-0.5">
                    Where You Operate
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                    Location
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    This helps LIFED understand where your programs may be hosted.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Country, State, City */}
                <LocationSelector
                  city={city}
                  setCity={setCity}
                  state={state}
                  setState={setState}
                  country={country}
                  setCountry={setCountry}
                />

                {/* Nearest Airport */}
                <div>
                  <label className="block text-slate-700 text-xs font-extrabold uppercase mb-1.5">
                    Nearest Airport <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Plane className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nearestAirport}
                      onChange={(e) => setNearestAirport(e.target.value)}
                      placeholder="Nearest major airport"
                      className="w-full bg-slate-50/70 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                BOTTOM ACTIONS & PRIVACY ASSURANCE
               ═════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-border-leaf/80 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-teal-700 shrink-0" />
                <span className="text-xs font-bold tracking-tight">
                  Your information is used only for Healthmate verification.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-5 py-2.5 text-xs sm:text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 sm:w-auto bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/50 text-white font-extrabold rounded-xl px-6 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-teal/20 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding to Pipeline...
                    </>
                  ) : (
                    <>
                      <span>Add to Pipeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
