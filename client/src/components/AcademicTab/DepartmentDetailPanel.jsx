import { useState, useEffect } from "react";
import useFacultyStore from "../../store/useFacultyStore";

export default function DepartmentDetailPanel({ department, isNew, onClose, onUpdate, onDelete, onAdd }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(isNew || false);
  const [form, setForm] = useState({});
  const [departmentData, setDepartmentData] = useState(null);
  const { fetchFaculties, faculties } = useFacultyStore();

  useEffect(() => {
    const loadFullDepartmentData = async () => { if (department?.id && !isNew) { try { setDepartmentData(department); } catch (error) { console.error("Failed to load department data:", error); } } };
    loadFullDepartmentData();
  }, [department?.id, isNew]);

  useEffect(() => {
    setEditing(isNew || false);
    const displayData = departmentData || department;
    setForm({ name: displayData?.name || "", code: displayData?.code || "", email: displayData?.email || "", buildingId: displayData?.building_id || "", facultyId: displayData?.faculty_id || "", headId: displayData?.head_id || "" });
  }, [department?.id, departmentData]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };
  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSave = async () => { if (isNew) { await onAdd(form); handleClose(); } else if (department?.id) { await onUpdate(department.id, form); setEditing(false); } };
  const handleDelete = async () => { if (department?.id && window.confirm("Are you sure you want to delete this department?")) { await onDelete(department.id); handleClose(); } };
  const handleEditMode = async () => { setEditing(true); if (!faculties || faculties.length === 0) { await fetchFaculties(); } };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)", opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity 0.3s" }} onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{ width: "400px", background: "#fff", borderLeft: "1px solid #e5e5e5", transform: visible ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{isNew ? "Create New Department" : "Department Details"}</h3>
          <button onClick={handleClose} style={{ color: "#999", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {["name", "code", "email", "buildingId", "headId"].map((field) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>
                {field === "buildingId" ? "Building ID" : field === "headId" ? "Head ID" : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input name={field} value={form[field] || ""} onChange={handleChange} disabled={!editing} type={field === "email" ? "email" : "text"}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: editing ? "#fff" : "#f9f9f9", outline: "none" }} />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Faculty</label>
            {!editing ? (
              <div style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#f9f9f9" }}>{departmentData?.faculty_name || department?.faculty_name || "No faculty assigned"}</div>
            ) : (
              <select name="facultyId" value={form.facultyId || ""} onChange={handleChange}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }}>
                <option value="">Select a faculty</option>
                {faculties?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 flex gap-2 shrink-0" style={{ borderTop: "1px solid #e5e5e5" }}>
          {!editing && !isNew && <button onClick={handleEditMode} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: "1px solid #e5e5e5", background: "#fff", color: "#111", cursor: "pointer" }}>Edit</button>}
          {editing && <button onClick={handleSave} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#111", cursor: "pointer" }}>{isNew ? "Create" : "Save"}</button>}
          {!isNew && !editing && <button onClick={handleDelete} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#d32f2f", cursor: "pointer" }}>Delete</button>}
          {editing && <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, color: "#666", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer" }}>Cancel</button>}
        </div>
      </div>
    </>
  );
}