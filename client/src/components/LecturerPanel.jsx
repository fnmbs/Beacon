import { useEffect, useState } from "react";

export default function LecturerPanel({ lecturer, onClose, onDelete, onUpdate }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState();

  useEffect(() => { setForm({ name: lecturer?.name || "", email: lecturer?.email || "", departmentId: lecturer?.department_id || "" }); }, [lecturer]);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };
  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = () => { onDelete(lecturer.id); setShowDeleteModal(false); handleClose(); };
  const cancelDelete = () => setShowDeleteModal(false);
  const handleSave = () => { onUpdate(lecturer.id, form); setEditing(false); };
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const courses = lecturer?.courses ?? [];
  const timetable = lecturer?.timetable ?? {};
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hasTimetable = DAYS.some((day) => (timetable[day] ?? []).length > 0);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.3)", opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{ width: "400px", background: "#fff", borderLeft: "1px solid #e5e5e5", transform: visible ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, background: "#f0f0f0", color: "#666" }}>
              {lecturer?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{lecturer?.name}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{lecturer?.department_name ?? "No department"}</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ color: "#999", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999" }}>Details</span>
              <button onClick={() => setEditing((e) => !e)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "1px solid #e5e5e5", background: "#fff", color: "#555", cursor: "pointer" }}>{editing ? "Cancel" : "Edit"}</button>
            </div>
            {editing ? (
              <div className="flex flex-col gap-3">
                {[{ label: "Name", name: "name" }, { label: "Email", name: "email", type: "email" }].map((f) => (
                  <div key={f.name}>
                    <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>{f.label}</label>
                    <input name={f.name} value={form?.[f.name] || ""} onChange={h} type={f.type || "text"}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", outline: "none" }} />
                  </div>
                ))}
                <button onClick={handleSave} style={{ width: "100%", padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#111", cursor: "pointer" }}>Save changes</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {[{ label: "Name", value: form?.name }, { label: "Email", value: form?.email }, { label: "Department", value: lecturer?.department_name || "—" }, { label: "Faculty", value: lecturer?.faculty_name || "—" }].map((d) => (
                  <div key={d.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: "#888" }}>{d.label}</span>
                    <span style={{ fontSize: 13, color: "#111" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", display: "block", marginBottom: 8 }}>Courses</span>
            {courses.length === 0 ? <span style={{ fontSize: 12, color: "#bbb" }}>No courses assigned</span> : (
              <div className="flex flex-col gap-1.5">
                {courses.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e5e5" }}>
                    <span style={{ fontSize: 11, color: "#888" }}>{c.code}</span>
                    <span style={{ fontSize: 12, color: "#111" }}>{c.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "#f0f0f0", color: "#666" }}>{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", display: "block", marginBottom: 8 }}>Timetable</span>
            {!hasTimetable ? <span style={{ fontSize: 12, color: "#bbb" }}>No timetable available</span> : (
              <div className="flex flex-col gap-3">
                {DAYS.map((day) => {
                  const entries = timetable[day] ?? [];
                  if (entries.length === 0) return null;
                  return <div key={day}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbb", marginBottom: 4 }}>{day}</div>
                    {entries.map((entry) => (
                      <div key={entry.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e5e5", marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#111" }}>{entry.course_name}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{entry.location_name}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "#888", marginLeft: 12 }}>{entry.start_time} – {entry.end_time}</span>
                      </div>
                    ))}
                  </div>;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5" style={{ borderTop: "1px solid #e5e5e5" }}>
          <button onClick={handleDelete} style={{ width: "100%", padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", border: "none", background: "#d32f2f", cursor: "pointer" }}>Delete lecturer</button>
        </div>
      </div>

      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-60" style={{ background: "rgba(0,0,0,0.3)" }} onClick={cancelDelete} />
          <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg p-5 flex flex-col gap-4" style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Delete lecturer</h3>
              <p style={{ fontSize: 13, color: "#888" }}>Are you sure you want to delete <span style={{ color: "#111" }}>{lecturer?.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3 mt-2">
                <button onClick={cancelDelete} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #e5e5e5", color: "#111", background: "#fff", cursor: "pointer", fontSize: 12 }}>Cancel</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", color: "#fff", background: "#d32f2f", cursor: "pointer", fontSize: 12 }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}