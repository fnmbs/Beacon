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
  const { departments, fetchDepartmentsByFaculty, clearDepartments } =
    useDepartmentStore();

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (hoveredFaculty) fetchDepartmentsByFaculty(hoveredFaculty.id);
  }, [hoveredFaculty]);

  const handleOpen = () => {
    if (!open) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ x: rect.right - 480, y: rect.bottom + 8 });
    }
    setOpen((o) => !o);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleFacultyClick = (faculty) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (dept) => setSelectedDepartment(dept);

  const handleApply = () => {
    onApply({ faculty: selectedFaculty, department: selectedDepartment });
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    clearDepartments();
    onClear();
    setOpen(false);
  };

  const hasSelection = selectedFaculty || selectedDepartment;

  return (
    <div>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3.5 py-3 rounded-lg text-[13px] mono transition-all"
        style={{
          background: hasSelection ? "#1d4ed8" : "#111217",
          color: hasSelection ? "#fff" : "#9ca3af",
          border: `1px solid ${hasSelection ? "#1d4ed8" : "#1f2230"}`,
        }}
      >
        <svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-3.5 h-3.5"
        >
          <path d="M1 3h12M3 7h8M5 11h4" />
        </svg>
        {hasSelection && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            ref={panelRef}
            className="fixed z-50 rounded-xl shadow-2xl "
            style={{
              background: "#111217",
              border: "1px solid #1a1c23",
              width: "480px",
              left: pos.x,
              top: pos.y,
              userSelect: "none",
              cursor: isDragging ? "grabbing" : "default",
            }}
          >
            {/* Draggable header */}
            <div
              onMouseDown={handleMouseDown}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                borderBottom: "1px solid #1f2230",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 10 10"
                  fill="currentColor"
                  className="w-2.5 h-2.5"
                  style={{ color: "#4b5563" }}
                >
                  <circle cx="2" cy="2" r="1" />
                  <circle cx="8" cy="2" r="1" />
                  <circle cx="2" cy="5" r="1" />
                  <circle cx="8" cy="5" r="1" />
                  <circle cx="2" cy="8" r="1" />
                  <circle cx="8" cy="8" r="1" />
                </svg>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "#f3f4f6" }}
                >
                  Search filters
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ color: "#6b7280", cursor: "pointer" }}
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
            </div>

            {/* Columns */}
            <div
              className="grid grid-cols-2"
              style={{ borderBottom: "1px solid #1f2230" }}
            >
              {/* Faculty */}
              <div style={{ borderRight: "1px solid #1f2230" }}>
                <div
                  className="px-5 py-3 mono text-[10px] tracking-widest uppercase"
                  style={{
                    color: "#6b7280",
                    borderBottom: "1px solid #1f2230",
                  }}
                >
                  Faculty
                </div>
                <div className="py-2 h-80 overflow-y-auto filter-scroll">
                  {faculties.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFacultyClick(f)}
                      onMouseEnter={() => setHoveredFaculty(f)}
                      className="w-full text-left px-5 py-2.5 text-[13px] transition-colors"
                      style={{
                        color:
                          selectedFaculty?.id === f.id ? "#f3f4f6" : "#9ca3af",
                        background:
                          selectedFaculty?.id === f.id
                            ? "#1a1d23"
                            : "transparent",
                        fontWeight: selectedFaculty?.id === f.id ? 500 : 400,
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div>
                <div
                  className="px-5 py-3 mono text-[10px] tracking-widest uppercase"
                  style={{
                    color: "#6b7280",
                    borderBottom: "1px solid #1f2230",
                  }}
                >
                  Department
                </div>
                <div className="py-2 h-80 overflow-y-auto filter-scroll">
                  {!hoveredFaculty && (
                    <div
                      className="px-5 py-2.5 text-[12px]"
                      style={{ color: "#4b5563" }}
                    >
                      Hover a faculty
                    </div>
                  )}
                  {hoveredFaculty && departments.length === 0 && (
                    <div
                      className="px-5 py-2.5 text-[12px]"
                      style={{ color: "#4b5563" }}
                    >
                      No departments
                    </div>
                  )}
                  {departments.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        handleFacultyClick(hoveredFaculty);
                        handleDepartmentClick(d);
                      }}
                      className="w-full text-left px-5 py-2.5 text-[13px] transition-colors"
                      style={{
                        color:
                          selectedDepartment?.id === d.id
                            ? "#f3f4f6"
                            : "#9ca3af",
                        background:
                          selectedDepartment?.id === d.id
                            ? "#1a1d23"
                            : "transparent",
                        fontWeight: selectedDepartment?.id === d.id ? 500 : 400,
                      }}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3">
              <button
                onClick={handleClear}
                className="mono text-[12px] hover:opacity-60 transition-opacity"
                style={{ color: "#6b7280" }}
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                disabled={!hasSelection}
                className="px-4 py-2 rounded-lg text-[13px] font-medium disabled:opacity-30 transition-opacity"
                style={{ background: "#f3f4f6", color: "#111217" }}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
