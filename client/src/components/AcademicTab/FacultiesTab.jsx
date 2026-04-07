import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import SearchInput from "../SearchInput";
import FacultyCard from "../FacultyCard";
import Loader from "../Loader";
import FacultyDetailPanel from "./FacultyDetailPanel";
import useFacultyStore from "../../store/useFacultyStore";

export default function FacultiesTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const theme = useTheme();

  const {
    faculties,
    fetchFaculties,
    fetchSearchFaculties,
    loading,
    totalFaculties,
    addFaculty,
    updateFacultyData,
    deleteFacultyData,
  } = useFacultyStore();

  const totalPages = totalFaculties > 0 ? Math.ceil(totalFaculties / limit) : 1;

  // Handle pagination and filter changes
  useEffect(() => {
    if (search.trim()) {
      fetchSearchFaculties(search);
    } else {
      fetchFaculties(page, limit);
    }
  }, [page, search]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setPage(1);
  };

  const handleSelectFaculty = (faculty) => {
    setSelected(null);
    setTimeout(() => setSelected(faculty), 0);
  };

  const handleNew = () => {
    setSelected(null);
    setTimeout(() => {
      setSelected({
        id: null,
        name: "",
        code: "",
        email: "",
        buildingId: null,
        establishedYear: null,
      });
    }, 0);
  };

  const handleAdd = async (form) => {
    try {
      const facultyData = {
        name: form.name,
        code: form.code,
        email: form.email,
        buildingId: form.buildingId || null,
        establishedYear: form.establishedYear || null,
      };
      await addFaculty(facultyData);
      setSelected(null);
      await fetchFaculties(page, limit);
    } catch (error) {
      console.error("Failed to add faculty:", error);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      const facultyData = {
        name: form.name,
        code: form.code,
        email: form.email,
        buildingId: form.buildingId || null,
        establishedYear: form.establishedYear || null,
      };
      await updateFacultyData(id, facultyData);
      setSelected(null);
      await fetchFaculties(page, limit);
    } catch (error) {
      console.error("Failed to update faculty:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFacultyData(id);
      setSelected(null);
      await fetchFaculties(page, limit);
    } catch (error) {
      console.error("Failed to delete faculty:", error);
    }
  };

  return (
    <div style={{ color: theme.text.primary }}>
      {/* Controls Section */}
      <div
        className="mb-8 p-6 rounded-lg border"
        style={{
          background: theme.bg.secondary,
          borderColor: theme.border.light,
        }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search faculties..."
            className="flex-1 px-4 py-2 rounded-lg text-sm border transition-colors"
            style={{
              background: theme.bg.primary,
              color: theme.text.primary,
              borderColor: theme.border.light,
            }}
          />

          {search && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: theme.bg.primary,
                color: theme.text.secondary,
                border: `1px solid ${theme.border.light}`,
              }}
            >
              Clear
            </button>
          )}

          <button
            onClick={handleNew}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              background: theme.accent.primary,
            }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <Loader />}

      {/* Grid Content */}
      {!loading && (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            role="list"
          >
            {faculties.length === 0 ? (
              <div
                className="col-span-full p-16 text-center rounded-lg border-2"
                style={{
                  borderColor: theme.border.light,
                  borderStyle: "dashed",
                  color: theme.text.tertiary,
                }}
              >
                <div className="text-4xl mb-3">🏢</div>
                <p className="text-sm font-medium">
                  {search
                    ? `No faculties matching "${search}"`
                    : "No faculties yet"}
                </p>
              </div>
            ) : (
              faculties.map((faculty) => (
                <div
                  key={faculty.id}
                  onClick={() => handleSelectFaculty(faculty)}
                  className="cursor-pointer rounded-lg border p-4 transition-all hover:border-opacity-100"
                  style={{
                    background: theme.bg.secondary,
                    borderColor: theme.border.light,
                  }}
                >
                  <h3 className="font-semibold text-sm mb-1">{faculty.name}</h3>
                  <p className="text-xs" style={{ color: theme.text.tertiary }}>
                    {faculty.code}
                  </p>
                  {faculty.building_name && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: theme.text.secondary }}
                    >
                      {faculty.building_name}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{
                  background: theme.bg.secondary,
                  borderColor: theme.border.light,
                  border: `1px solid ${theme.border.light}`,
                  color: theme.text.primary,
                }}
              >
                ← Prev
              </button>
              <span
                className="px-4 py-2 text-sm"
                style={{ color: theme.text.secondary }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{
                  background: theme.bg.secondary,
                  borderColor: theme.border.light,
                  border: `1px solid ${theme.border.light}`,
                  color: theme.text.primary,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <FacultyDetailPanel
          faculty={selected}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
