import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
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

  const { departments, fetchDepartments, fetchSearchDepartments, fetchDepartmentsByFacultyFilter, loading, totalDepartments, addDepartment, updateDepartment, deleteDepartment } = useDepartmentStore();
  const { fetchFaculties, faculties } = useFacultyStore();
  const totalPages = totalDepartments > 0 ? Math.ceil(totalDepartments / limit) : 1;

  useEffect(() => { if (!faculties || faculties.length === 0) { fetchFaculties(); } }, []);
  useEffect(() => { if (search.trim()) { fetchSearchDepartments(search); } else if (facultyFilter) { fetchDepartmentsByFacultyFilter(facultyFilter, page, limit); } else { fetchDepartments(page, limit); } }, [page, facultyFilter, search]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFacultyFilter = (e) => { setFacultyFilter(e.target.value); setPage(1); setSearch(""); };
  const handleClearFilters = () => { setFacultyFilter(""); setSearch(""); setPage(1); };
  const handleSelectDepartment = (dept) => { setSelected(null); setTimeout(() => setSelected(dept), 0); };

  const handleNew = async () => { if (!faculties || faculties.length === 0) await fetchFaculties(); setSelected(null); setTimeout(() => { setSelected({ id: null, name: "", code: "", email: "", buildingId: null, facultyId: null, headId: null }); }, 0); };

  const handleAdd = async (form) => {
    try { await addDepartment({ name: form.name, code: form.code, email: form.email, facultyId: form.facultyId || null, buildingId: form.buildingId || null, headId: form.headId || null }); setSelected(null); await fetchDepartments(page, limit); }
    catch (error) { console.error("Failed to add department:", error); }
  };
  const handleUpdate = async (id, form) => {
    try { await updateDepartment(id, { name: form.name, code: form.code, email: form.email, facultyId: form.facultyId || null, buildingId: form.buildingId || null, headId: form.headId || null }); setSelected(null); await fetchDepartments(page, limit); }
    catch (error) { console.error("Failed to update department:", error); }
  };
  const handleDelete = async (id) => {
    try { await deleteDepartment(id); setSelected(null); await fetchDepartments(page, limit); }
    catch (error) { console.error("Failed to delete department:", error); }
  };

  return (
    <div style={{ color: theme.text.primary }}>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <input type="text" value={search} onChange={handleSearch} placeholder="Search departments..." className="flex-1 outline-none"
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff" }} />
          <select value={facultyFilter} onChange={handleFacultyFilter}
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 12, color: "#111", background: "#fff", minWidth: "160px" }}>
            <option value="">All Faculties</option>
            {faculties?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          {(search || facultyFilter) && <button onClick={handleClearFilters} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 12, color: "#666", background: "none", cursor: "pointer" }}>Clear</button>}
          <button onClick={handleNew} style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500, color: "#fff", background: "#111", cursor: "pointer" }}>+ New</button>
        </div>
      </div>

      {loading && <Loader />}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {departments.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-lg" style={{ border: "1px dashed #e5e5e5", color: theme.text.tertiary }}>
                <p style={{ fontSize: 13 }}>{facultyFilter ? `No departments in ${faculties?.find((f) => f.id === facultyFilter)?.name}` : search ? `No departments matching "${search}"` : "No departments yet"}</p>
              </div>
            ) : departments.map((dept) => (
              <div key={dept.id} onClick={() => handleSelectDepartment(dept)} className="cursor-pointer rounded-lg p-4 transition-all hover:shadow-sm"
                style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#999", marginBottom: 4 }}>{dept.code}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{dept.name}</h3>
                {dept.faculty_name && <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{dept.faculty_name}</p>}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e5e5", color: "#111", background: "#fff", cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ padding: "6px 14px", fontSize: 12, color: "#888" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e5e5", color: "#111", background: "#fff", cursor: "pointer", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {selected && <DepartmentDetailPanel department={selected} faculties={faculties || []} onClose={() => setSelected(null)} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} />}
    </div>
  );
}