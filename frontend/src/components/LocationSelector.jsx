import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import CustomSelect from './CustomSelect';

export default function LocationSelector({ 
  city, setCity, 
  state, setState, 
  country, setCountry, 
  disabled,
  layout = "flex" // "flex" or "fragment"
}) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // When initial country is passed or changes from outside (e.g., editing existing data),
  // we try to map the name back to an ISO code.
  useEffect(() => {
    if (country && !selectedCountryCode && countries.length > 0) {
      const found = countries.find(c => c.name === country);
      if (found) {
        setSelectedCountryCode(found.isoCode);
      }
    } else if (!country && countries.length > 0 && !selectedCountryCode) {
      // Default to India if no country is set
      const india = countries.find(c => c.isoCode === 'IN');
      if (india) {
        setSelectedCountryCode(india.isoCode);
        setCountry(india.name);
      }
    }
  }, [country, countries, selectedCountryCode, setCountry]);

  useEffect(() => {
    if (selectedCountryCode) {
      const stateList = State.getStatesOfCountry(selectedCountryCode);
      setStates(stateList);
      
      // If state is already provided from outside, find its code
      if (state && !selectedStateCode && stateList.length > 0) {
        const foundState = stateList.find(s => s.name === state);
        if (foundState) {
          setSelectedStateCode(foundState.isoCode);
        }
      } else if (!state) {
        setSelectedStateCode('');
      }
    } else {
      setStates([]);
      setCities([]);
      setSelectedStateCode('');
    }
  }, [selectedCountryCode, state, selectedStateCode]);

  useEffect(() => {
    if (selectedCountryCode && selectedStateCode) {
      const cityList = City.getCitiesOfState(selectedCountryCode, selectedStateCode);
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [selectedCountryCode, selectedStateCode]);

  const handleCountryChange = (iso) => {
    setSelectedCountryCode(iso);
    const cObj = countries.find(c => c.isoCode === iso);
    setCountry(cObj ? cObj.name : '');
    
    // Reset state & city
    setSelectedStateCode('');
    setState('');
    setCity('');
  };

  const handleStateChange = (iso) => {
    setSelectedStateCode(iso);
    const sObj = states.find(s => s.isoCode === iso);
    setState(sObj ? sObj.name : '');
    
    // Reset city
    setCity('');
  };

  const labelClass = layout === "fragment" 
    ? "block text-text-muted text-[10px] font-extrabold uppercase mb-1"
    : "block text-text-main text-xs font-extrabold uppercase mb-1.5";
    
  const getSelectClass = (val) => {
    const base = layout === "fragment"
      ? "w-full bg-white border border-border-leaf/80 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
      : "w-full bg-slate-50 border border-border-leaf/80 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all disabled:opacity-50";
    
    return `${base} ${val ? 'text-text-main' : 'text-text-muted/40'}`;
  };

  const countryOptions = countries.map(c => ({ value: c.isoCode, label: c.name }));
  const stateOptions = states.map(s => ({ value: s.isoCode, label: s.name }));
  const cityOptions = cities.map(c => ({ value: c.name, label: c.name }));

  const renderFields = () => (
    <>
      <div className={layout === "fragment" ? "" : "flex-1 min-w-0"}>
        <label className={labelClass}>Country</label>
        <CustomSelect
          value={selectedCountryCode}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Select Country"
          disabled={disabled}
          className={getSelectClass(selectedCountryCode)}
        />
      </div>
      <div className={layout === "fragment" ? "" : "flex-1 min-w-0"}>
        <label className={labelClass}>State</label>
        <CustomSelect
          value={selectedStateCode}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder="Select State"
          disabled={!selectedCountryCode || disabled}
          className={getSelectClass(selectedStateCode)}
        />
      </div>
      <div className={layout === "fragment" ? "" : "flex-1 min-w-0"}>
        <label className={labelClass}>City</label>
        <CustomSelect
          value={city}
          onChange={(val) => setCity(val)}
          options={cityOptions}
          placeholder="Select City"
          disabled={!selectedStateCode || disabled}
          className={getSelectClass(city)}
        />
      </div>
    </>
  );

  if (layout === "fragment") {
    return <>{renderFields()}</>;
  }

  return <div className="flex gap-4 w-full">{renderFields()}</div>;
}
