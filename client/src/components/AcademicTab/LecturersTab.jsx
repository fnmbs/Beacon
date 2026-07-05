import { useState, useRef, useEffect } from "react";
import SearchInput from "../SearchInput";
import LecturerCard from "../LecturerCard";
import Loader from "../Loader";
import FilterPanel from "../FilterPanel";
import LecturerPanel from "../LecturerPanel";
import useLecturerStore from "../../store/useLecturerStore";

export default function LecturersTab() {
  const [filterKey, setFilterKey] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const debounceRef = useRef(null);
  const limit = 10;

  const { lecturers, fetchLecturers, fetchLecturersByDepartment, fetchLecturersByFaculty, fetchSearchLecturers, loading, totalLecturers, updateLecturer, deleteLecturer } = useLecturerStore();
  const totalPages = totalLecturers > 0 ? Math.ceil(totalLecturers / limit) : 1;

  useEffect(() => {
    if (selectedDepartment) { fetchLecturersByDepartment(selectedDepartment.id, page, limit); }
    else if (selectedFaculty) { fetchLecturersByFaculty(selectedFaculty.id, page, limit); }
    else { fetchLecturers(page, limit); }
  }, [page, selectedDepartment, selectedFaculty]);

  const handleSearch = (e) => {
    const val = e.target.value; setSearch(val); clearTimeout(debounceRef.current);
    if (val.trim()) { debounceRef.current = setTimeout(() => { fetchSearchLecturers(val); }, 300); }
    else { fetchLecturers(1, limit); setPage(1); }
  };

  const handleApply = ({ faculty, department }) => { setSelectedFaculty(faculty); setSelectedDepartment(department); setPage(1); };
  const handleClear = () => { setSelectedFaculty(null); setSelectedDepartment(null); setPage(1); setFilterKey((k) => k + 1); };
  const onUpdate = async (id, form) => { await updateLecturer(id, form); await fetchLecturers(page, limit); };
  const onDelete = async (id) => { await deleteLecturer(id); setSelected(null); await fetchLecturers(page, limit); };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md"><SearchInput value={search} onChange={handleSearch} placeholder="Search lecturers by name…" onSelect={(lec) => setSelected(lec)} /></div>
        <FilterPanel key={filterKey} onApply={handleApply} onClear={handleClear} />
      </div>

      {(selectedFaculty || selectedDepartment) && (
        <div className="flex items-center gap-2 mb-4">
          {selectedFaculty && <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, background: "#f5f5f5", border: "1px solid #e5e5e5", color: "#555" }}>{selectedFaculty.name}</span>}
          {selectedDepartment && <><span style={{ color: "#bbb" }}>→</span><span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, background: "#f5f5f5", border: "1px solid #e5e5e5", color: "#555" }}>{selectedDepartment.name}</span></>}
          <button onClick={handleClear} style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer" }}>clear</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {loading && <div className="col-span-2 flex justify-center py-16"><Loader /></div>}
        {!loading && lecturers.length === 0 && <div className="col-span-2 py-16 text-center" style={{ color: "#999", fontSize: 13 }}>No lecturers found</div>}
        {!loading && lecturers.map((lec) => <LecturerCard key={lec.id} lecturer={lec} onClick={() => setSelected(lec)} />)}
      </div>

      {!loading && totalLecturers > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 mt-4" style={{ border: "1px solid #e5e5e5", borderRadius: 6, background: "#fafafa" }}>
          <span style={{ fontSize: 12, color: "#888" }}>{(page - 1) * limit + 1}–{Math.min(page * limit, totalLecturers)} of {totalLecturers}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e5e5e5", borderRadius: 4, color: "#555", background: "#fff", cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>←</button>
            <span style={{ fontSize: 12, color: "#888", padding: "0 6px" }}>{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
              style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e5e5e5", borderRadius: 4, color: "#555", background: "#fff", cursor: "pointer", opacity: page >= totalPages ? 0.3 : 1 }}>→</button>
          </div>
        </div>
      )}

      {selected && <LecturerPanel lecturer={selected} onClose={() => setSelected(null)} onDelete={onDelete} onUpdate={onUpdate} />}
    </div>
  );
}