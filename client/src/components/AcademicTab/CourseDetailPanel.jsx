import { useState, useEffect } from "react";
import useLecturerStore from "../../store/useLecturerStore";
import useCourseStore from "../../store/useCourseStore";
import useFacultyStore from "../../store/useFacultyStore";
import useDepartmentStore from "../../store/useDepartmentStore";

export default function CourseDetailPanel({ course, isNew, onClose, onUpdate, onDelete, onAdd }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(isNew || false);
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [form, setForm] = useState({});

  const { fetchLecturersByDepartment, clearLecturers, lecturers: departmentLecturers } = useLecturerStore();
  const { fetchAssignedLecturers, clearAssignedLecturers, lecturers: assignedLecturers } = useCourseStore();
  const { fetchFaculties, faculties } = useFacultyStore();
  const { fetchDepartmentsByFaculty, clearDepartments, departments } = useDepartmentStore();

  useEffect(() => {
    clearLecturers(); clearAssignedLecturers(); setEditing(isNew || false); setLecturerSearch("");
    setForm({
      name: course?.name || "",
      code: course?.code || "",
      description: course?.description || "",
      type: course?.type || "compulsory",
      level: course?.level || 100,
      eligibleLevels: course?.eligible_levels || (course?.level ? [course.level] : [100]),
      credits: course?.credits || 1,
      semester: course?.semester || "harmattan",
      facultyId: course?.faculty_id || null,
      departmentId: course?.department_id || null,
      assignedLecturers: course?.lecturer_ids || [],
    });
  }, [course?.id]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => { if (!faculties || faculties.length === 0) { fetchFaculties(); } }, []);
  useEffect(() => { const loadAssignedLecturers = async () => { if (course?.id) { await fetchAssignedLecturers(course.id); } }; loadAssignedLecturers(); }, [course?.id]);
  useEffect(() => { if (assignedLecturers && assignedLecturers.length > 0) { setForm((prev) => ({ ...prev, assignedLecturers: assignedLecturers.map((l) => l.id) })); } }, [assignedLecturers]);
  useEffect(() => { const fetchDepartmentsOnFacultyChange = async () => { if (editing && form.facultyId) { await fetchDepartmentsByFaculty(form.facultyId); } }; fetchDepartmentsOnFacultyChange(); if (editing && !form.facultyId) { clearDepartments(); } }, [form.facultyId, editing]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };
  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.name === "credits" ? Number(e.target.value) : e.target.value })); };
  const toggleEligibleLevel = (lvl) => { setForm((p) => ({ ...p, eligibleLevels: p.eligibleLevels && p.eligibleLevels.includes(lvl) ? p.eligibleLevels.filter((x) => x !== lvl) : [...(p.eligibleLevels || []), lvl] })); };
  const handleFacultyChange = async (e) => { const facultyId = e.target.value; setForm((p) => ({ ...p, facultyId, departmentId: null })); if (facultyId) { await fetchDepartmentsByFaculty(facultyId); } };
  const handleDepartmentChange = async (e) => { const departmentId = e.target.value; setForm((p) => ({ ...p, departmentId })); if (departmentId) { clearLecturers(); await fetchLecturersByDepartment(departmentId); } };
  const handleAssignLecturer = (lecturerId) => { setForm((p) => ({ ...p, assignedLecturers: p.assignedLecturers.includes(lecturerId) ? p.assignedLecturers.filter((id) => id !== lecturerId) : [...p.assignedLecturers, lecturerId] })); };
  const handleSave = async () => { if (isNew) { await onAdd(form); handleClose(); } else if (course?.id) { await onUpdate(course.id, form); setEditing(false); } };
  const handleDelete = async () => { if (course?.id && window.confirm("Are you sure you want to delete this course?")) { await onDelete(course.id); handleClose(); } };
  const handleEditMode = async () => { setEditing(true);     if (!faculties || faculties.length === 0) { await fetchFaculties(1, 100); } if (course?.faculty_id) { await fetchDepartmentsByFaculty(course.faculty_id); } if (course?.department_id) { await fetchLecturersByDepartment(course.department_id); } };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)", opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity 0.3s" }} onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{ width: "400px", background: "#fff", borderLeft: "1px solid #e5e5e5", transform: visible ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{isNew ? "Create New Course" : "Course Details"}</h3>
          <button onClick={handleClose} style={{ color: "#999", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {["name", "code"].map((field) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input name={field} value={form[field] || ""} onChange={handleChange} disabled={!editing}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: editing ? "#fff" : "#f9f9f9", outline: "none" }} />
            </div>
          ))}

          {["facultyId", "departmentId"].map((field) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>{field === "facultyId" ? "Faculty" : "Department"}</label>
              {!editing ? (
                <div style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#f9f9f9" }}>{field === "facultyId" ? (course?.faculty_name || "No faculty") : (course?.department_name || "No department")}</div>
              ) : (
                <>
                  {field === "departmentId" && !form.facultyId && <div style={{ fontSize: 11, padding: "6px 10px", borderRadius: 4, marginBottom: 6, background: "#fef2f2", color: "#991b1b" }}>Pick a faculty first</div>}
                  <select value={form[field] || ""} onChange={field === "facultyId" ? handleFacultyChange : handleDepartmentChange} disabled={field === "departmentId" && !form.facultyId}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }}>
                    <option value="">{field === "facultyId" ? "Select a faculty" : "Select a department"}</option>
                    {(field === "facultyId" ? faculties : departments)?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </>
              )}
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Description</label>
            <textarea name="description" value={form.description || ""} onChange={handleChange} disabled={!editing} rows={3}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: editing ? "#fff" : "#f9f9f9", outline: "none", resize: "none" }} />
          </div>

          {["type", "credits", "semester"].map((field) => {
            const opts = field === "type" ? ["compulsory", "elective"] : field === "credits" ? [1, 2, 3, 4, 5, 6] : ["harmattan", "rain"];
            return (
              <div key={field}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <select name={field} value={form[field] || ""} onChange={handleChange} disabled={!editing}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: editing ? "#fff" : "#f9f9f9", outline: "none" }}>
                  {opts.map((opt) => <option key={opt} value={opt}>{field === "type" ? opt.charAt(0).toUpperCase() + opt.slice(1) : field === "credits" ? `${opt} Credit${opt > 1 ? "s" : ""}` : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
              </div>
            );
          })}

          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Eligible Levels</label>
            {!editing ? (
              <div style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#f9f9f9" }}>{(form.eligibleLevels || []).join(", ")}</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[100,200,300,400,500,600,700].map((lvl) => {
                  const checked = (form.eligibleLevels || []).includes(lvl);
                  return (
                    <label key={lvl} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 8px", border: "1px solid #e5e5e5", borderRadius: 6, background: checked ? "#111" : "#fff", color: checked ? "#fff" : "#111", cursor: "pointer" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEligibleLevel(lvl)} />
                      <span style={{ fontSize: 12 }}>{lvl}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Assign Lecturers</label>
            {editing && <input type="text" placeholder="Search lecturers..." value={lecturerSearch} onChange={(e) => setLecturerSearch(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 12, color: "#111", background: "#fff", outline: "none", marginBottom: 6 }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto", padding: 8, borderRadius: 6, border: "1px solid #e5e5e5", background: "#fafafa" }}>
              {editing ? (() => {
                const filtered = (departmentLecturers || []).filter((l) => l.name.toLowerCase().includes(lecturerSearch.toLowerCase()));
                return filtered.length === 0 ? <span style={{ fontSize: 12, color: "#999", padding: "4px 0" }}>No lecturers in this department</span> : filtered.map((lecturer) => {
                  const isAssigned = (form.assignedLecturers || []).includes(lecturer.id);
                  return <label key={lecturer.id} className="flex items-center gap-2" style={{ fontSize: 12, cursor: "pointer", color: isAssigned ? "#111" : "#666" }}>
                    <input type="checkbox" checked={isAssigned} onChange={() => handleAssignLecturer(lecturer.id)} className="cursor-pointer" />
                    <span>{lecturer.name}</span>
                    {isAssigned && <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#eee", color: "#555" }}>assigned</span>}
                  </label>;
                });
              })() : assignedLecturers.length === 0 ? <span style={{ fontSize: 12, color: "#999", padding: "4px 0" }}>No lecturers assigned</span> : assignedLecturers.map((lecturer) => (
                <div key={lecturer.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#111", padding: "2px 0" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", flexShrink: 0 }} />{lecturer.name}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            {!editing ? (
              <>
                <button onClick={handleEditMode} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#111", cursor: "pointer" }}>Edit</button>
                {!isNew && <button onClick={handleDelete} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#d32f2f", cursor: "pointer" }}>Delete</button>}
              </>
            ) : (
              <>
                <button onClick={handleSave} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#111", cursor: "pointer" }}>{isNew ? "Create" : "Save"}</button>
                <button onClick={() => (isNew ? handleClose() : setEditing(false))} style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, color: "#666", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer" }}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}