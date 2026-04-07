import { useState, useEffect } from "react";

export default function FacultyDetailPanel({
  faculty,
  isNew,
  onClose,
  onUpdate,
  onDelete,
  onAdd,
}) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(isNew || false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset everything when faculty changes
  useEffect(() => {
    setEditing(isNew || false);
    setForm({
      name: faculty?.name || "",
      code: faculty?.code || "",
      email: faculty?.email || "",
      buildingId: faculty?.building_id || "",
      establishedYear: faculty?.established_year || "",
    });
  }, [faculty?.id]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (isNew) {
      await onAdd(form);
      handleClose();
    } else if (faculty?.id) {
      await onUpdate(faculty.id, form);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (
      faculty?.id &&
      window.confirm("Are you sure you want to delete this faculty?")
    ) {
      await onDelete(faculty.id);
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: "420px",
          background: "#111217",
          borderLeft: "1px solid #1a1c23",
          transform: visible ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1f2230" }}
        >
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "#f3f4f6" }}
          >
            {isNew ? "Create New Faculty" : "Faculty Details"}
          </h3>
          <button onClick={handleClose} style={{ color: "#6b7280" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Faculty Name
            </label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50"
              style={{
                background: "#16181d",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            />
          </div>

          {/* Code */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Faculty Code
            </label>
            <input
              name="code"
              value={form.code || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50"
              style={{
                background: "#16181d",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50"
              style={{
                background: "#16181d",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            />
          </div>

          {/* Building ID */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Building ID
            </label>
            <input
              name="buildingId"
              value={form.buildingId || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50"
              style={{
                background: "#16181d",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            />
          </div>

          {/* Established Year */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Established Year
            </label>
            <input
              name="establishedYear"
              type="number"
              value={form.establishedYear || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50"
              style={{
                background: "#16181d",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-2 shrink-0"
          style={{ borderTop: "1px solid #1f2230" }}
        >
          {!editing ? (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: "#1f2230", color: "#f3f4f6" }}
              >
                Close
              </button>
              {!isNew && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all hover:opacity-90"
                    style={{ background: "#60a5fa", color: "#111217" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all hover:opacity-90"
                    style={{ background: "#ef4444", color: "#f3f4f6" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: "#1f2230", color: "#f3f4f6" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#10b981", color: "#f3f4f6" }}
              >
                {loading ? "Saving..." : isNew ? "Create" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
