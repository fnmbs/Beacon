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

  const {
    lecturers,
    fetchLecturers,
    fetchLecturersByDepartment,
    fetchLecturersByFaculty,
    fetchSearchLecturers,
    loading,
    totalLecturers,
    updateLecturer,
    deleteLecturer
  } = useLecturerStore();

  const totalPages = totalLecturers > 0 ? Math.ceil(totalLecturers / limit) : 1;

  useEffect(() => {
    if (selectedDepartment) {
      fetchLecturersByDepartment(selectedDepartment.id, page, limit);
    } else if (selectedFaculty) {
      fetchLecturersByFaculty(selectedFaculty.id, page, limit);
    } else {
      fetchLecturers(page, limit);
    }
  }, [page, selectedDepartment, selectedFaculty]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSearchLecturers(val);
      }, 300);
    } else {
      fetchLecturers(1, limit);
      setPage(1);
    }
  };

  const handleApply = ({ faculty, department }) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment(department);
    setPage(1);
  };

  const handleClear = () => {
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setPage(1);
    setFilterKey((k) => k + 1);
  };

  const onUpdate = async (id, form) => {
    await updateLecturer(id, form);
    await fetchLecturers(page, limit);
  };

  const onDelete = async (id) => {
    await deleteLecturer(id);
    setSelected(null);
    await fetchLecturers(page, limit);
  };

  return (
    <div className="p-8 mx-20 bg-white text-black min-h-screen">
      {/* Search + Filter */}
      <div className="flex items-center justify-center gap-3 mb-6 w-full">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search lecturers by name…"
          onSelect={(lec) => setSelected(lec)}
        />
        <FilterPanel key={filterKey} onApply={handleApply} onClear={handleClear} />
      </div>

      {/* Active filter badges */}
      {(selectedFaculty || selectedDepartment) && (
        <div className="flex items-center gap-2 mb-5">
          {selectedFaculty && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 border border-gray-300">
              {selectedFaculty.name}
            </span>
          )}
          {selectedDepartment && (
            <>
              <span className="text-gray-500">→</span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 border border-gray-300">
                {selectedDepartment.name}
              </span>
            </>
          )}
          <button
            onClick={handleClear}
            className="text-gray-600 text-sm hover:underline"
          >
            clear
          </button>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 gap-5">
        {loading && (
          <div className="col-span-2 flex justify-center py-16">
            <Loader />
          </div>
        )}
        {!loading && lecturers.length === 0 && (
          <div className="col-span-2 py-16 text-center text-gray-500">
            No lecturers found
          </div>
        )}
        {!loading &&
          lecturers.map((lec) => (
            <LecturerCard
              key={lec.id}
              lecturer={lec}
              onClick={() => setSelected(lec)}
            />
          ))}
      </div>

      {/* Pagination */}
      {!loading && totalLecturers > 0 && (
        <div className="flex items-center justify-between px-5 py-3 rounded-xl mt-5 bg-gray-50 border border-gray-200">
          <span className="text-sm text-gray-500">
            {(page - 1) * limit + 1}–{Math.min(page * limit, totalLecturers)} of{" "}
            {totalLecturers}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-30"
            >
              ←
            </button>
            <span className="px-2 text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Lecturer Panel */}
      {selected && (
        <LecturerPanel
          lecturer={selected}
          onClose={() => setSelected(null)}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}