import React, { useState, useEffect } from 'react';

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CityInput({ value, onChange, placeholder }: CityInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchCity = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&city=${query}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      
      // Şehir ve ülke bilgisi olan sonuçları filtrele
      const filteredData = data.filter((item: any) => {
        const address = item.address || {};
        return (address.city || address.town || address.state) && address.country;
      });

      setSuggestions(filteredData);
    } catch (error) {
      console.error('Şehir arama hatası:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    searchCity(newValue);
  };

  const formatCityCountry = (suggestion: any) => {
    const address = suggestion.address || {};
    const city = address.city || address.town || address.state || '';
    const country = address.country || '';
    return `${city}/${country}`;
  };

  const handleSuggestionClick = (suggestion: any) => {
    const cityName = formatCityCountry(suggestion);
    setInputValue(cityName);
    onChange(cityName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
        placeholder={placeholder}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {formatCityCountry(suggestion)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 