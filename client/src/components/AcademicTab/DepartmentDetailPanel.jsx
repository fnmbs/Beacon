import { useState, useEffect } from "react";
import useFacultyStore from "../../store/useFacultyStore";
import useDepartmentStore from "../../store/useDepartmentStore";

export default function DepartmentDetailPanel({
  department,
  isNew,
  onClose,
  onUpdate,
  onDelete,
  onAdd,
}) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(isNew || false);
  const [form, setForm] = useState({});
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { fetchFaculties, faculties } = useFacultyStore();

  // Fetch full department data when panel opens
  useEffect(() => {
    const loadFullDepartmentData = async () => {
      if (department?.id && !isNew) {
        setLoading(true);
        try {
          // This will be used via API call if needed
          setDepartmentData(department);
        } catch (error) {
          console.error("Failed to load department data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadFullDepartmentData();
  }, [department?.id, isNew]);

  // Reset everything when department changes
  useEffect(() => {
    setEditing(isNew || false);
    const displayData = departmentData || department;
    setForm({
      name: displayData?.name || "",
      code: displayData?.code || "",
      email: displayData?.email || "",
      buildingId: displayData?.building_id || "",
      facultyId: displayData?.faculty_id || "",
      headId: displayData?.head_id || "",
    });
  }, [department?.id, departmentData]);

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
    } else if (department?.id) {
      await onUpdate(department.id, form);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (
      department?.id &&
      window.confirm("Are you sure you want to delete this department?")
    ) {
      await onDelete(department.id);
      handleClose();
    }
  };

  const handleEditMode = async () => {
    setEditing(true);
    if (!faculties || faculties.length === 0) {
      await fetchFaculties();
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
            {isNew ? "Create New Department" : "Department Details"}
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
              Department Name
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
              Department Code
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

          {/* Faculty */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Faculty
            </label>
            {!editing ? (
              <div
                className="px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: "#16181d",
                  border: "1px solid #1f2230",
                  color: "#f3f4f6",
                }}
              >
                {departmentData?.faculty_name ||
                  department?.faculty_name ||
                  "No faculty assigned"}
              </div>
            ) : (
              <select
                name="facultyId"
                value={form.facultyId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: "#16181d",
                  border: "1px solid #1f2230",
                  color: "#f3f4f6",
                }}
              >
                <option value="">Select a faculty</option>
                {faculties?.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Building ID */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Building ID (Optional)
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

          {/* Head ID */}
          <div>
            <label
              className="text-[10px] mono uppercase mb-1 block"
              style={{ color: "#f3f4f6" }}
            >
              Head ID (Optional)
            </label>
            <input
              name="headId"
              value={form.headId || ""}
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
          className="px-6 py-4 flex gap-3 shrink-0"
          style={{ borderTop: "1px solid #1f2230" }}
        >
          {!editing && !isNew && (
            <button
              onClick={handleEditMode}
              className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: "#1a1d23",
                border: "1px solid #1f2230",
                color: "#60a5fa",
              }}
            >
              Edit
            </button>
          )}
          {editing && (
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: "#10b981",
                color: "#111217",
              }}
            >
              {isNew ? "Create" : "Save"}
            </button>
          )}
          {!isNew && !editing && (
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: "#ef4444",
                color: "#fff",
              }}
            >
              Delete
            </button>
          )}
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: "#1a1d23",
                border: "1px solid #1f2230",
                color: "#f3f4f6",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
}
