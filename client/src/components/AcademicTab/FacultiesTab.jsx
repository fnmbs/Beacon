import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Loader from "../Loader";
import FacultyDetailPanel from "./FacultyDetailPanel";
import useFacultyStore from "../../store/useFacultyStore";

export default function FacultiesTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const theme = useTheme();

  const { faculties, fetchFaculties, fetchSearchFaculties, loading, totalFaculties, addFaculty, updateFacultyData, deleteFacultyData } = useFacultyStore();
  const totalPages = totalFaculties > 0 ? Math.ceil(totalFaculties / limit) : 1;

  useEffect(() => { if (search.trim()) { fetchSearchFaculties(search); } else { fetchFaculties(page, limit); } }, [page, search]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleClearFilters = () => { setSearch(""); setPage(1); };

  const handleSelectFaculty = (faculty) => { setSelected(null); setTimeout(() => setSelected(faculty), 0); };
  const handleNew = () => { setSelected(null); setTimeout(() => { setSelected({ id: null, name: "", code: "", email: "", buildingId: null, establishedYear: null }); }, 0); };

  const handleAdd = async (form) => {
    try { await addFaculty({ name: form.name, code: form.code, email: form.email, buildingId: form.buildingId || null, establishedYear: form.establishedYear || null }); setSelected(null); await fetchFaculties(page, limit); }
    catch (error) { console.error("Failed to add faculty:", error); }
  };
  const handleUpdate = async (id, form) => {
    try { await updateFacultyData(id, { name: form.name, code: form.code, email: form.email, buildingId: form.buildingId || null, establishedYear: form.establishedYear || null }); setSelected(null); await fetchFaculties(page, limit); }
    catch (error) { console.error("Failed to update faculty:", error); }
  };
  const handleDelete = async (id) => {
    try { await deleteFacultyData(id); setSelected(null); await fetchFaculties(page, limit); }
    catch (error) { console.error("Failed to delete faculty:", error); }
  };

  return (
    <div style={{ color: theme.text.primary }}>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <input type="text" value={search} onChange={handleSearch} placeholder="Search faculties..." className="flex-1 outline-none"
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff" }} />
          {search && <button onClick={handleClearFilters} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 12, color: "#666", background: "none", cursor: "pointer" }}>Clear</button>}
          <button onClick={handleNew} style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500, color: "#fff", background: "#111", cursor: "pointer" }}>+ New</button>
        </div>
      </div>

      {loading && <Loader />}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {faculties.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-lg" style={{ border: "1px dashed #e5e5e5", color: theme.text.tertiary }}>
                <p style={{ fontSize: 13 }}>{search ? `No faculties matching "${search}"` : "No faculties yet"}</p>
              </div>
            ) : faculties.map((faculty) => (
              <div key={faculty.id} onClick={() => handleSelectFaculty(faculty)} className="cursor-pointer rounded-lg p-4 transition-all hover:shadow-sm"
                style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#999", marginBottom: 4 }}>{faculty.code}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{faculty.name}</h3>
                {faculty.building_name && <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{faculty.building_name}</p>}
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

      {selected && <FacultyDetailPanel faculty={selected} onClose={() => setSelected(null)} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} />}
    </div>
  );
}