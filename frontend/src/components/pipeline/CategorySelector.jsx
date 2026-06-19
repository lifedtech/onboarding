import { useState, useEffect } from 'react';

export default function CategorySelector({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = ['Wellness', 'Functional Movement', 'Recovery'];
  
  // Parse the current string value into selected array and custom text
  const currentSelections = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const selectedPredefined = currentSelections.filter(s => options.includes(s));
  const selectedCustom = currentSelections.filter(s => !options.includes(s));
  
  const hasOther = selectedCustom.length > 0;
  const currentCustomText = selectedCustom.length > 0 ? selectedCustom[0] : '';
  
  const [customText, setCustomText] = useState(currentCustomText);

  // Sync customText if value changes externally
  useEffect(() => {
    setCustomText(currentCustomText);
  }, [currentCustomText]);
  
  const handleToggle = (option) => {
    let newSelections;
    if (currentSelections.includes(option)) {
      newSelections = currentSelections.filter(s => s !== option);
    } else {
      newSelections = [...currentSelections, option];
    }
    onChange(newSelections.join(', '));
  };
  
  const handleToggleOther = () => {
    if (hasOther) {
      // Unchecking other: remove custom text
      const newSelections = currentSelections.filter(s => options.includes(s));
      onChange(newSelections.join(', '));
      setCustomText('');
    } else {
      // Checking other: temporarily add empty string or check state
      const newSelections = [...selectedPredefined];
      if (customText.trim()) {
        newSelections.push(customText.trim());
      } else {
        newSelections.push('Other'); // fallback placeholder
      }
      onChange(newSelections.join(', '));
    }
  };
  
  const handleCustomTextChange = (text) => {
    setCustomText(text);
    const newSelections = [...selectedPredefined];
    if (text.trim()) {
      newSelections.push(text.trim());
    }
    onChange(newSelections.join(', '));
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-border-leaf/80 text-text-main rounded-xl px-4 py-2.5 text-sm font-bold text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all disabled:opacity-50"
      >
        <span className="truncate">
          {currentSelections.length > 0 
            ? currentSelections.join(', ')
            : 'Select Categories...'}
        </span>
        <span className="text-text-muted/60 text-[10px]">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-20 bg-white border border-border-leaf rounded-2xl shadow-xl p-3 space-y-2">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-text-main select-none">
                <input
                  type="checkbox"
                  checked={selectedPredefined.includes(option)}
                  onChange={() => handleToggle(option)}
                  disabled={disabled}
                  className="rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
                />
                {option}
              </label>
            ))}
            
            <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-text-main select-none">
              <input
                type="checkbox"
                checked={hasOther || currentSelections.includes('Other')}
                onChange={handleToggleOther}
                disabled={disabled}
                className="rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
              />
              Other (Custom)
            </label>

            {(hasOther || currentSelections.includes('Other')) && (
              <div className="px-2 pt-1 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Enter custom category..."
                  value={customText === 'Other' ? '' : customText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  disabled={disabled}
                  className="w-full bg-slate-50 border border-border-leaf/60 text-text-main placeholder-text-muted/40 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
