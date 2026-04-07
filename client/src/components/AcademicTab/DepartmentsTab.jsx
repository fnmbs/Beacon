import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import SearchInput from "../SearchInput";
import DepartmentCard from "../DepartmentCard";
import Loader from "../Loader";
import DepartmentDetailPanel from "./DepartmentDetailPanel";
import useDepartmentStore from "../../store/useDepartmentStore";
import useFacultyStore from "../../store/useFacultyStore";

export default function DepartmentsTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [facultyFilter, setFacultyFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const theme = useTheme();

  const {
    departments,
    fetchDepartments,
    fetchSearchDepartments,
    fetchDepartmentsByFacultyFilter,
    loading,
    totalDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartmentStore();

  const { fetchFaculties, faculties } = useFacultyStore();

  const totalPages =
    totalDepartments > 0 ? Math.ceil(totalDepartments / limit) : 1;

  // Load faculties on mount
  useEffect(() => {
    if (!faculties || faculties.length === 0) {
      fetchFaculties();
    }
  }, []);

  // Handle pagination and filter changes
  useEffect(() => {
    if (search.trim()) {
      fetchSearchDepartments(search);
    } else if (facultyFilter) {
      fetchDepartmentsByFacultyFilter(facultyFilter, page, limit);
    } else {
      fetchDepartments(page, limit);
    }
  }, [page, facultyFilter, search]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
  };

  const handleFacultyFilter = (e) => {
    const faculty = e.target.value;
    setFacultyFilter(faculty);
    setPage(1);
    setSearch("");
  };

  const handleClearFilters = () => {
    setFacultyFilter("");
    setSearch("");
    setPage(1);
  };

  const handleSelectDepartment = (department) => {
    setSelected(null);
    setTimeout(() => setSelected(department), 0);
  };

  const handleNew = async () => {
    if (!faculties || faculties.length === 0) {
      await fetchFaculties();
    }
    setSelected(null);
    setTimeout(() => {
      setSelected({
        id: null,
        name: "",
        code: "",
        email: "",
        buildingId: null,
        facultyId: null,
        headId: null,
      });
    }, 0);
  };

  const handleAdd = async (form) => {
    try {
      const departmentData = {
        name: form.name,
        code: form.code,
        email: form.email,
        facultyId: form.facultyId || null,
        buildingId: form.buildingId || null,
        headId: form.headId || null,
      };
      await addDepartment(departmentData);
      setSelected(null);
      await fetchDepartments(page, limit);
    } catch (error) {
      console.error("Failed to add department:", error);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      const departmentData = {
        name: form.name,
        code: form.code,
        email: form.email,
        facultyId: form.facultyId || null,
        buildingId: form.buildingId || null,
        headId: form.headId || null,
      };
      await updateDepartment(id, departmentData);
      setSelected(null);
      await fetchDepartments(page, limit);
    } catch (error) {
      console.error("Failed to update department:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      setSelected(null);
      await fetchDepartments(page, limit);
    } catch (error) {
      console.error("Failed to delete department:", error);
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
            placeholder="Search departments..."
            className="flex-1 px-4 py-2 rounded-lg text-sm border transition-colors"
            style={{
              background: theme.bg.primary,
              color: theme.text.primary,
              borderColor: theme.border.light,
            }}
          />

          <select
            value={facultyFilter}
            onChange={handleFacultyFilter}
            className="px-4 py-2 rounded-lg text-sm border transition-colors"
            style={{
              background: theme.bg.primary,
              color: theme.text.primary,
              borderColor: theme.border.light,
              minWidth: "180px",
            }}
          >
            <option value="">All Faculties</option>
            {faculties?.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>

          {(search || facultyFilter) && (
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
            {departments.length === 0 ? (
              <div
                className="col-span-full p-16 text-center rounded-lg border-2"
                style={{
                  borderColor: theme.border.light,
                  borderStyle: "dashed",
                  color: theme.text.tertiary,
                }}
              >
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-medium">
                  {facultyFilter
                    ? `No departments in ${faculties?.find((f) => f.id === facultyFilter)?.name}`
                    : search
                      ? `No departments matching "${search}"`
                      : "No departments yet"}
                </p>
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDepartment(dept)}
                  className="cursor-pointer rounded-lg border p-4 transition-all hover:border-opacity-100"
                  style={{
                    background: theme.bg.secondary,
                    borderColor: theme.border.light,
                  }}
                >
                  <h3 className="font-semibold text-sm mb-1">{dept.name}</h3>
                  <p className="text-xs" style={{ color: theme.text.tertiary }}>
                    {dept.code}
                  </p>
                  {dept.faculty_name && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: theme.text.secondary }}
                    >
                      {dept.faculty_name}
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
        <DepartmentDetailPanel
          department={selected}
          faculties={faculties || []}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
