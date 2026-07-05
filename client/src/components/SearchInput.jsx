import { useState, useRef, useEffect } from "react";
import { searchLecturers } from "../api/axios";

export default function SearchInput({ value, onChange, placeholder, onSelect }) {
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) { setShowDropdown(false); } };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    onChange(e);
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(async () => { setLoading(true); try { const res = await searchLecturers(val); setResults(res.data.data ?? []); setShowDropdown(true); } catch { setResults([]); } finally { setLoading(false); } }, 300);
    } else { setResults([]); setShowDropdown(false); }
  };

  const handleSelect = (lecturer) => { setShowDropdown(false); setResults([]); onChange({ target: { value: "" } }); onSelect?.(lecturer); };

  return (
    <div ref={containerRef} className="relative w-full">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#111", opacity: 0.25 }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="4.5" /><path d="M13 13l-2.5-2.5" />
      </svg>
      <input className="w-full outline-none" style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
        placeholder={placeholder} value={value} onChange={handleChange} autoFocus />
      {value && <button onClick={() => { onChange({ target: { value: "" } }); setShowDropdown(false); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#bbb", background: "none", border: "none", cursor: "pointer" }}>
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3"><path d="M1 1l10 10M11 1L1 11" /></svg>
      </button>}
      {showDropdown && results.length > 0 && <div className="absolute z-50 mt-1 w-full" style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", maxHeight: 240, overflowY: "auto" }}>
        {results.map((lecturer) => (
          <button key={lecturer.id} onClick={() => handleSelect(lecturer)} className="w-full text-left px-3 py-2" style={{ fontSize: 13, color: "#111", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => e.target.style.background = "#f5f5f5"} onMouseLeave={(e) => e.target.style.background = "transparent"}>
            {lecturer.name} - {lecturer.department_name ?? "No department"}
          </button>
        ))}
      </div>}
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ fontSize: 11, color: "#bbb" }}>Loading...</div>}
    </div>
  );
}