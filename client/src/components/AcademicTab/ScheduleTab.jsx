import { useState, useEffect } from "react";
import { getAllCourses, getAllTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from "../../api/axios";
import useLocationStore from "../../store/useLocationStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduleTab() {
  const [courses, setCourses] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ course_id: "", location_id: "", day: "Monday", start_time: "", end_time: "" });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState("");
  const { locations, fetchAllLocations } = useLocationStore();

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, timetableRes] = await Promise.all([
        getAllCourses(1, 999),
        getAllTimetable(),
      ]);
      if (coursesRes.data?.courses) setCourses(coursesRes.data.courses);
      if (timetableRes.data?.entries) setEntries(timetableRes.data.entries);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    if (!locations.length) fetchAllLocations();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => { setEditingId(null); setForm({ course_id: "", location_id: "", day: "Monday", start_time: "", end_time: "" }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course_id || !form.location_id) { toast_("Select a course and location"); return; }
    if (!form.start_time || !form.end_time) { toast_("Set start and end time"); return; }
    try {
      if (editingId) {
        await updateTimetableEntry(editingId, form);
        toast_("Entry updated");
      } else {
        await createTimetableEntry(form);
        toast_("Scheduled");
      }
      resetForm();
      const res = await getAllTimetable();
      if (res.data?.entries) setEntries(res.data.entries);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Failed to save schedule";
      toast_(msg);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({ course_id: entry.course_id, location_id: entry.location_id, day: entry.day, start_time: entry.start_time?.slice(0, 5) || "", end_time: entry.end_time?.slice(0, 5) || "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this schedule entry?")) return;
    try {
      await deleteTimetableEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) resetForm();
      toast_("Entry removed");
    } catch (_) { toast_("Failed to delete"); }
  };

  const grouped = DAYS.map((day) => ({
    day,
    items: entries.filter((e) => e.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const courseMap = {};
  courses.forEach((c) => { courseMap[c.id] = c; });

  const locationMap = {};
  locations.forEach((l) => { locationMap[l.id] = l; });

  return (
    <div>
      <div className="mb-6 p-5 rounded-lg" style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{editingId ? "Edit Schedule Entry" : "New Schedule Entry"}</h3>
          {editingId && <button type="button" onClick={resetForm} style={{ fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div style={{ minWidth: 180, flex: 1 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Course</label>
            <select name="course_id" value={form.course_id} onChange={handleChange}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }}>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 160, flex: 1 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Location</label>
            <select name="location_id" value={form.location_id} onChange={handleChange}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Day</label>
            <select name="day" value={form.day} onChange={handleChange}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>Start (HH:MM)</label>
            <input type="text" name="start_time" value={form.start_time} onChange={handleChange} placeholder="08:00" maxLength={5}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }} />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 4 }}>End (HH:MM)</label>
            <input type="text" name="end_time" value={form.end_time} onChange={handleChange} placeholder="09:00" maxLength={5}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 13, color: "#111", background: "#fff", outline: "none" }} />
          </div>
          <button type="submit"
            style={{ padding: "8px 20px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500, color: "#fff", background: "#111", cursor: "pointer", height: 37 }}>
            {editingId ? "Update" : "Schedule"}
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "#999" }}>Loading…</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "#999" }}>No schedule entries yet</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {grouped.map(({ day, items }) => (
            <div key={day} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555" }}>{day}</span>
                <span style={{ fontSize: 11, color: "#bbb", marginLeft: 8 }}>{items.length}</span>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {items.length === 0 ? (
                  <div style={{ padding: "20px 14px", fontSize: 12, color: "#ccc", textAlign: "center" }}>No entries</div>
                ) : items.map((entry) => (
                  <div key={entry.id} style={{ padding: "10px 14px", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span style={{ fontWeight: 500, color: "#111" }}>{entry.course_code}</span>
                        <span style={{ color: "#888", marginLeft: 6 }}>{entry.course_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(entry)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 12, padding: "2px 4px" }}
                          title="Edit">✎</button>
                        <button onClick={() => handleDelete(entry.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 13, padding: "2px 4px" }}
                          title="Remove">✕</button>
                      </div>
                    </div>
                    <div style={{ color: "#999", marginTop: 3 }}>
                      {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                      <span style={{ margin: "0 6px" }}>·</span>
                      {entry.location_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5" style={{ zIndex: 10001, background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
