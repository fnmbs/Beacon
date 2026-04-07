import { useEffect, useState } from "react";

export default function LecturerPanel({ lecturer, onClose, onDelete, onUpdate }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState();

  useEffect(() => {
    setForm({
      name: lecturer?.name || "",
      email: lecturer?.email || "",
      departmentId: lecturer?.department_id || "",
    });
  }, [lecturer]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300 bg-black"
        style={{ opacity: visible ? 0.3 : 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "420px",
          background: "#fff",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          color: "#000",
          borderLeft: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-100 text-gray-700">
              {lecturer?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold">{lecturer?.name}</span>
              <span className="text-[11px] text-gray-500">{lecturer?.department_name ?? "No department"}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Details / Edit */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Details</SectionLabel>
              <button
                onClick={() => setEditing((e) => !e)}
                className="text-sm px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                <Field label="Name">
                  <input
                    name="name"
                    value={form.name}
                    onChange={h}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-black"
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email"
                    value={form.email}
                    onChange={h}
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-black"
                  />
                </Field>
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-lg text-sm font-medium mt-1 bg-black text-white"
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Detail label="Name" value={form?.name} />
                <Detail label="Email" value={form?.email} />
                <Detail label="Department" value={lecturer?.department_name ?? "—"} />
                <Detail label="Faculty" value={lecturer?.faculty_name ?? "—"} />
              </div>
            )}
          </div>

          {/* Courses */}
          <div>
            <SectionLabel>Courses</SectionLabel>
            {courses.length === 0 ? (
              <Empty>No courses assigned</Empty>
            ) : (
              <div className="flex flex-col gap-1.5">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-500">{c.code}</span>
                    <span className="text-[12px]">{c.name}</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timetable */}
          <div>
            <SectionLabel>Timetable</SectionLabel>
            {!hasTimetable ? (
              <Empty>No timetable available</Empty>
            ) : (
              <div className="flex flex-col gap-3">
                {DAYS.map((day) => {
                  const entries = timetable[day] ?? [];
                  if (entries.length === 0) return null;
                  return (
                    <div key={day}>
                      <div className="text-xs uppercase tracking-widest mb-1.5 text-gray-400">
                        {day}
                      </div>
                      <div className="flex flex-col gap-1">
                        {entries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[12px]">{entry.course_name}</span>
                              <span className="text-[11px] text-gray-500">{entry.location_name}</span>
                            </div>
                            <span className="text-[11px] ml-4 text-gray-500">{entry.start_time} – {entry.end_time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete lecturer
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-60 bg-black opacity-30" onClick={cancelDelete} />
          <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-4 bg-white border border-gray-200 shadow-lg">
              <h3 className="text-[15px] font-semibold text-black">Delete lecturer</h3>
              <p className="text-[13px] text-gray-500">
                Are you sure you want to delete <span className="text-black">{lecturer?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-2">
                <button onClick={cancelDelete} className="flex-1 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SectionLabel({ children }) {
  return <div className="text-xs uppercase tracking-widest mb-3 text-gray-500">{children}</div>;
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] text-black">{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-1.5 text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return <span className="text-[12px] text-gray-400">{children}</span>;
}