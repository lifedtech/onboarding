import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  disabled = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch(''); // Reset search when opening
        }}
        className={`${className} flex items-center justify-between focus:outline-none`}
      >
        <span className="truncate min-w-0 pr-2">{displayLabel}</span>
        <ChevronDown className="w-4 h-4 text-text-muted/60 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-border-leaf rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {options.length > 10 && (
            <div className="p-2 border-b border-border-leaf/40 bg-slate-50/50 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-border-leaf/60 text-text-main placeholder-text-muted/40 rounded-lg pl-8 pr-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto overscroll-contain py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${
                    value === option.value ? 'text-brand-teal bg-brand-teal/5' : 'text-text-main'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs font-semibold text-text-muted">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
