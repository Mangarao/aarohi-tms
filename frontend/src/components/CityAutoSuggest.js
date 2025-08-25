import React, { useState } from 'react';

export default function CityAutoSuggest({ state, value, onChange, cities, required }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(e);
    if (state && cities && cities.length > 0) {
      setSuggestions(
        cities.filter(city => city.toLowerCase().includes(input.toLowerCase()))
      );
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange({ target: { name: 'city', value: city } });
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        name="city"
        value={value}
        onChange={handleInputChange}
        autoComplete="off"
        required={required}
        className="form-control"
        placeholder={state ? 'Enter city' : 'Select state first'}
        disabled={!state}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="city-suggestions" style={{
          position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #ccc', width: '100%'
        }}>
          {suggestions.map(city => (
            <div
              key={city}
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => handleSuggestionClick(city)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
