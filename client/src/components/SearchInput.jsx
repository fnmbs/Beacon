import { useState, useRef, useEffect } from "react";
import { searchLecturers } from "../api/axios";

export default function SearchInput({ value, onChange, placeholder, onSelect }) {
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    onChange(e);
    const val = e.target.value;
    clearTimeout(debounceRef.current);

    if (val.trim()) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await searchLecturers(val);
          setResults(res.data.data ?? []);
          setShowDropdown(true);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (lecturer) => {
    setShowDropdown(false);
    setResults([]);
    onChange({ target: { value: "" } });
    onSelect?.(lecturer);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="6" cy="6" r="4.5" />
        <path d="M13 13l-2.5-2.5" />
      </svg>

      {/* Input Field */}
      <input
        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-300 bg-white text-gray-900 placeholder-gray-400 "
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        autoFocus
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => {
            onChange({ target: { value: "" } });
            setShowDropdown(false);
            setResults([]);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-3 h-3"
          >
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      )}

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((lecturer) => (
            <button
              key={lecturer.id}
              onClick={() => handleSelect(lecturer)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 text-sm"
            >
              {lecturer.name} - {lecturer.department_name ?? "No department"}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
          Loading...
        </div>
      )}
    </div>
  );
}