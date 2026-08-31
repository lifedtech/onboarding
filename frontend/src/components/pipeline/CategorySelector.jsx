import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react';

const DEFAULT_OPTIONS = [
  'Ayurveda',
  'Functional Movement',
  'Meditation',
  'Mental Wellness',
  'Nutrition',
  'Recovery',
  'Wellness',
  'Yoga',
];

export default function CategorySelector({ value, onChange, disabled, placeholder = 'Select Expertise Categories...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Parse current selections from comma-separated string or array
  const currentSelections = Array.isArray(value)
    ? value
    : value
    ? value.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const selectedPredefined = currentSelections.filter((s) => DEFAULT_OPTIONS.includes(s));
  const selectedCustom = currentSelections.filter((s) => !DEFAULT_OPTIONS.includes(s) && s !== 'Other');

  const hasOther = selectedCustom.length > 0;
  const currentCustomText = selectedCustom.length > 0 ? selectedCustom[0] : '';
  const [customText, setCustomText] = useState(currentCustomText);

  useEffect(() => {
    setCustomText(currentCustomText);
  }, [currentCustomText]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (option) => {
    let newSelections;
    if (currentSelections.includes(option)) {
      newSelections = currentSelections.filter((s) => s !== option);
    } else {
      newSelections = [...currentSelections, option];
    }
    emitChange(newSelections);
  };

  const handleRemoveChip = (e, option) => {
    e.stopPropagation();
    const newSelections = currentSelections.filter((s) => s !== option);
    emitChange(newSelections);
  };

  const handleToggleOther = () => {
    if (hasOther) {
      const newSelections = currentSelections.filter((s) => DEFAULT_OPTIONS.includes(s));
      emitChange(newSelections);
      setCustomText('');
    } else {
      const newSelections = [...selectedPredefined];
      if (customText.trim()) {
        newSelections.push(customText.trim());
      } else {
        newSelections.push('Other');
      }
      emitChange(newSelections);
    }
  };

  const handleCustomTextChange = (text) => {
    setCustomText(text);
    const newSelections = [...selectedPredefined];
    if (text.trim()) {
      newSelections.push(text.trim());
    }
    emitChange(newSelections);
  };

  const emitChange = (selections) => {
    if (Array.isArray(value)) {
      onChange(selections);
    } else {
      onChange(selections.join(', '));
    }
  };

  const filteredOptions = DEFAULT_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] bg-slate-50/70 hover:bg-slate-50 border border-border-leaf/80 rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2 cursor-pointer transition-all ${
          isOpen ? 'ring-1 ring-brand-teal border-brand-teal bg-white shadow-xs' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {currentSelections.length > 0 ? (
            currentSelections.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200/80 font-bold px-2.5 py-1 rounded-lg text-xs tracking-tight shadow-2xs"
              >
                <span>{cat}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(e, cat)}
                    className="hover:bg-teal-200/60 text-teal-700 hover:text-teal-900 rounded-md p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-semibold text-sm px-1">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400 pl-1">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-teal' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-border-leaf rounded-2xl shadow-xl shadow-slate-900/10 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar if multiple options */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.map((option) => {
              const isSelected = currentSelections.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => handleToggle(option)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors select-none ${
                    isSelected
                      ? 'bg-teal-50/80 text-teal-900 border border-teal-100 font-extrabold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand-teal text-white shadow-2xs'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              );
            })}

            {/* Custom / Other Category */}
            <div
              onClick={handleToggleOther}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors select-none ${
                hasOther || currentSelections.includes('Other')
                  ? 'bg-teal-50/80 text-teal-900 border border-teal-100 font-extrabold'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    hasOther || currentSelections.includes('Other')
                      ? 'bg-brand-teal text-white shadow-2xs'
                      : 'border border-slate-300 bg-white'
                  }`}
                >
                  {(hasOther || currentSelections.includes('Other')) && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
                <span>Other (Custom)</span>
              </div>
            </div>

            {(hasOther || currentSelections.includes('Other')) && (
              <div className="p-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={customText === 'Other' ? '' : customText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  disabled={disabled}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-slate-50 border border-border-leaf/80 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
