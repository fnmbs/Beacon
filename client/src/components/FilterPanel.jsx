import { useState, useEffect, useRef } from "react";
import useFacultyStore from "../store/useFacultyStore";
import useDepartmentStore from "../store/useDepartmentStore";

export default function FilterPanel({ onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [hoveredFaculty, setHoveredFaculty] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 44 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const { faculties, fetchFaculties } = useFacultyStore();
  const { departments, fetchDepartmentsByFaculty, clearDepartments } = useDepartmentStore();

  useEffect(() => { fetchFaculties(); }, []);
  useEffect(() => { if (hoveredFaculty) fetchDepartmentsByFaculty(hoveredFaculty.id); }, [hoveredFaculty]);

  const handleOpen = () => { if (!open) { const rect = buttonRef.current.getBoundingClientRect(); setPos({ x: rect.right - 460, y: rect.bottom + 8 }); } setOpen((o) => !o); };

  const handleMouseDown = (e) => { e.preventDefault(); dragging.current = true; setIsDragging(true); offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }; window.addEventListener("mousemove", handleMouseMove); window.addEventListener("mouseup", handleMouseUp); };
  const handleMouseMove = (e) => { if (!dragging.current) return; setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }); };
  const handleMouseUp = () => { dragging.current = false; setIsDragging(false); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };

  const handleFacultyClick = (faculty) => { setSelectedFaculty(faculty); setSelectedDepartment(null); };
  const handleDepartmentClick = (dept) => setSelectedDepartment(dept);
  const handleApply = () => { onApply({ faculty: selectedFaculty, department: selectedDepartment }); setOpen(false); };
  const handleClear = () => { setSelectedFaculty(null); setSelectedDepartment(null); clearDepartments(); onClear(); setOpen(false); };

  const hasSelection = selectedFaculty || selectedDepartment;

  return (
    <div>
      <button ref={buttonRef} onClick={handleOpen} className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
        style={{ background: hasSelection ? "#111" : "#f5f5f5", color: hasSelection ? "#fff" : "#888", border: "1px solid #e5e5e5", cursor: "pointer" }}>
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1 3h12M3 7h8M5 11h4" /></svg>
        {hasSelection && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div ref={panelRef} className="fixed z-50 rounded-lg shadow-md"
            style={{ background: "#fff", border: "1px solid #e5e5e5", width: "460px", left: pos.x, top: pos.y, userSelect: "none", cursor: isDragging ? "grabbing" : "default" }}>
            <div onMouseDown={handleMouseDown} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #e5e5e5", cursor: isDragging ? "grabbing" : "grab" }}>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5" style={{ color: "#bbb" }}>
                  <circle cx="2" cy="2" r="1" /><circle cx="8" cy="2" r="1" /><circle cx="2" cy="5" r="1" /><circle cx="8" cy="5" r="1" /><circle cx="2" cy="8" r="1" /><circle cx="8" cy="8" r="1" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>Search filters</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3"><path d="M1 1l10 10M11 1L1 11" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-2" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <div style={{ borderRight: "1px solid #e5e5e5" }}>
                <div className="px-4 py-2.5" style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #e5e5e5" }}>Faculty</div>
                <div className="py-1 h-72 overflow-y-auto">
                  {faculties.map((f) => (
                    <button key={f.id} onClick={() => handleFacultyClick(f)} onMouseEnter={() => setHoveredFaculty(f)}
                      className="w-full text-left px-4 py-2"
                      style={{ fontSize: 13, color: selectedFaculty?.id === f.id ? "#111" : "#888", background: selectedFaculty?.id === f.id ? "#f5f5f5" : "transparent", fontWeight: selectedFaculty?.id === f.id ? 500 : 400, border: "none", cursor: "pointer" }}>{f.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="px-4 py-2.5" style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #e5e5e5" }}>Department</div>
                <div className="py-1 h-72 overflow-y-auto">
                  {!hoveredFaculty && <div style={{ padding: "8px 12px", fontSize: 12, color: "#bbb" }}>Hover a faculty</div>}
                  {hoveredFaculty && departments.length === 0 && <div style={{ padding: "8px 12px", fontSize: 12, color: "#bbb" }}>No departments</div>}
                  {departments.map((d) => (
                    <button key={d.id} onClick={() => { handleFacultyClick(hoveredFaculty); handleDepartmentClick(d); }}
                      className="w-full text-left px-4 py-2"
                      style={{ fontSize: 13, color: selectedDepartment?.id === d.id ? "#111" : "#888", background: selectedDepartment?.id === d.id ? "#f5f5f5" : "transparent", fontWeight: selectedDepartment?.id === d.id ? 500 : 400, border: "none", cursor: "pointer" }}>{d.name}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={handleClear} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
              <button onClick={handleApply} disabled={!hasSelection} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: "none", background: "#111", color: "#fff", cursor: "pointer", opacity: hasSelection ? 1 : 0.3 }}>Apply</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}