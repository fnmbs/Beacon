import { useState, useEffect } from "react";
import useLecturerStore from "../../store/useLecturerStore";
import useCourseStore from "../../store/useCourseStore";
import useFacultyStore from "../../store/useFacultyStore";
import useDepartmentStore from "../../store/useDepartmentStore";

export default function CourseDetailPanel({
  course,
  isNew,
  onClose,
  onUpdate,
  onDelete,
  onAdd,
}) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(isNew || false);
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [form, setForm] = useState({});

  const {
    fetchLecturersByDepartment,
    clearLecturers,
    lecturers: departmentLecturers,
  } = useLecturerStore();

  const {
    fetchAssignedLecturers,
    clearAssignedLecturers,
    lecturers: assignedLecturers,
  } = useCourseStore();

  const { fetchFaculties, faculties } = useFacultyStore();

  const { fetchDepartmentsByFaculty, clearDepartments, departments } =
    useDepartmentStore();

  useEffect(() => {
    clearLecturers();
    clearAssignedLecturers();
    setEditing(isNew || false);
    setLecturerSearch("");
    setForm({
      name: course?.name || "",
      code: course?.code || "",
      description: course?.description || "",
      type: course?.type || "compulsory",
      level: course?.level || 100,
      credits: course?.credits || 1,
      semester: course?.semester || "harmattan",
      facultyId: course?.faculty_id || null,
      departmentId: course?.department_id || null,
      assignedLecturers: course?.lecturer_ids || [],
    });
  }, [course?.id]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const loadAssignedLecturers = async () => {
      if (course?.id) {
        await fetchAssignedLecturers(course.id);
      }
    };
    loadAssignedLecturers();
  }, [course?.id]);

  useEffect(() => {
    if (assignedLecturers && assignedLecturers.length > 0) {
      setForm((prev) => ({
        ...prev,
        assignedLecturers: assignedLecturers.map((l) => l.id),
      }));
    }
  }, [assignedLecturers]);

  useEffect(() => {
    const fetchDepartmentsOnFacultyChange = async () => {
      if (editing && form.facultyId) {
        await fetchDepartmentsByFaculty(form.facultyId);
      }
    };
    fetchDepartmentsOnFacultyChange();

    if (editing && !form.facultyId) {
      clearDepartments();
    }
  }, [form.facultyId, editing]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "level" || name === "credits" ? Number(value) : value,
    }));
  };

  const handleFacultyChange = async (e) => {
    const facultyId = e.target.value;
    setForm((prev) => ({
      ...prev,
      facultyId,
      departmentId: null,
    }));
    if (facultyId) {
      await fetchDepartmentsByFaculty(facultyId);
    }
  };

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setForm((prev) => ({ ...prev, departmentId }));
    if (departmentId) {
      clearLecturers();
      await fetchLecturersByDepartment(departmentId);
    }
  };

  const handleAssignLecturer = (lecturerId) => {
    setForm((prev) => {
      const alreadyAssigned = prev.assignedLecturers.includes(lecturerId);
      return {
        ...prev,
        assignedLecturers: alreadyAssigned
          ? prev.assignedLecturers.filter((id) => id !== lecturerId)
          : [...prev.assignedLecturers, lecturerId],
      };
    });
  };

  const handleSave = async () => {
    if (isNew) {
      await onAdd(form);
      handleClose();
    } else if (course?.id) {
      await onUpdate(course.id, form);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (
      course?.id &&
      window.confirm("Are you sure you want to delete this course?")
    ) {
      await onDelete(course.id);
      handleClose();
    }
  };

  const handleEditMode = async () => {
    setEditing(true);
    if (!faculties || faculties.length === 0) {
      await fetchFaculties();
    }
    if (course?.faculty_id) {
      await fetchDepartmentsByFaculty(course.faculty_id);
    }
    if (course?.department_id) {
      await fetchLecturersByDepartment(course.department_id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.3)",
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
          background: "#ffffff",
          borderLeft: "1px solid #e5e7eb",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          color: "#111",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <h3 className="text-[14px] font-semibold">
            {isNew ? "Create New Course" : "Course Details"}
          </h3>
          <button onClick={handleClose} style={{ color: "#6b7280" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-[10px] mb-1 block">Course Name</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{
                background: "#f9fafb",
                borderColor: "#e5e7eb",
                color: "#111",
              }}
            />
          </div>

          {/* Code */}
          <div>
            <label className="text-[10px] mb-1 block">Course Code</label>
            <input
              name="code"
              value={form.code || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{
                background: "#f9fafb",
                borderColor: "#e5e7eb",
                color: "#111",
              }}
            />
          </div>

          {/* Faculty */}
          <div>
            <label className="text-[10px] mb-1 block">Faculty</label>
            {!editing ? (
              <div className="px-3 py-2 rounded-lg text-[13px]" style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}>
                {course?.faculty_name || "No faculty"}
              </div>
            ) : (
              <select
                value={form.facultyId || ""}
                onChange={handleFacultyChange}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none border"
                style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
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

          {/* Department */}
          <div>
            <label className="text-[10px] mb-1 block">Department</label>
            {!editing ? (
              <div className="px-3 py-2 rounded-lg text-[13px]" style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}>
                {course?.department_name || "No department"}
              </div>
            ) : (
              <>
                {!form.facultyId && (
                  <div className="text-[11px] p-2 rounded mb-2" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    ⚠ Pick a faculty first
                  </div>
                )}
                <select
                  name="departmentId"
                  value={form.departmentId || ""}
                  onChange={handleDepartmentChange}
                  disabled={!form.facultyId}
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
                  style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
                >
                  <option value="">Select a department</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              disabled={!editing}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none disabled:opacity-50 border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] mb-1 block">Type</label>
            <select
              name="type"
              value={form.type || "compulsory"}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
            >
              <option value="compulsory">Compulsory</option>
              <option value="elective">Elective</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="text-[10px] mb-1 block">Level</label>
            <select
              name="level"
              value={form.level || 100}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
            >
              {[100, 200, 300, 400, 500, 600, 700].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>

          {/* Credits */}
          <div>
            <label className="text-[10px] mb-1 block">Credits</label>
            <select
              name="credits"
              value={form.credits || 1}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
            >
              {[1, 2, 3, 4, 5, 6].map((credit) => (
                <option key={credit} value={credit}>
                  {credit} Credit{credit > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[10px] mb-1 block">Semester</label>
            <select
              name="semester"
              value={form.semester || "harmattan"}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none disabled:opacity-50 border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
            >
              <option value="harmattan">Harmattan</option>
              <option value="rain">Rain</option>
            </select>
          </div>

          {/* Assign Lecturers */}
          <div>
            <label className="text-[10px] mb-2 block">Assign Lecturers</label>
            {editing && (
              <input
                type="text"
                placeholder="Search lecturers..."
                value={lecturerSearch}
                onChange={(e) => setLecturerSearch(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-[12px] outline-none mb-2 border"
                style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111" }}
              />
            )}
            <div
              className="flex flex-col gap-1.5 max-h-48 overflow-y-auto p-2 rounded border"
              style={{ background: "#f9fafb", borderColor: "#e5e7eb" }}
            >
              {editing
                ? (() => {
                    const filtered = (departmentLecturers || []).filter((l) =>
                      l.name.toLowerCase().includes(lecturerSearch.toLowerCase())
                    );
                    return filtered.length === 0 ? (
                      <span className="text-[12px] py-2" style={{ color: "#6b7280" }}>
                        No lecturers in this department
                      </span>
                    ) : (
                      filtered.map((lecturer) => {
                        const isAssigned = (form.assignedLecturers || []).includes(
                          lecturer.id
                        );
                        return (
                          <label
                            key={lecturer.id}
                            className="flex items-center gap-2 text-[12px] cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ color: isAssigned ? "#111" : "#4b5563" }}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => handleAssignLecturer(lecturer.id)}
                              className="cursor-pointer accent-black"
                            />
                            <span>{lecturer.name}</span>
                            {isAssigned && (
                              <span
                                className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: "#d1fae5",
                                  color: "#065f46",
                                }}
                              >
                                assigned
                              </span>
                            )}
                          </label>
                        );
                      })
                    );
                  })()
                : assignedLecturers.length === 0 ? (
                    <span className="text-[12px] py-2" style={{ color: "#6b7280" }}>
                      No lecturers assigned
                    </span>
                  ) : (
                    assignedLecturers.map((lecturer) => (
                      <div
                        key={lecturer.id}
                        className="flex items-center gap-2 text-[12px] px-1 py-0.5 rounded"
                        style={{ color: "#111" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: "#111" }}
                        />
                        {lecturer.name}
                      </div>
                    ))
                  )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            {!editing ? (
              <>
                <button
                  onClick={handleEditMode}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: "#111", color: "#fff" }}
                >
                  Edit
                </button>
                {!isNew && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
                    style={{ background: "#f87171", color: "#111" }}
                  >
                    Delete
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: "#10b981", color: "#fff" }}
                >
                  {isNew ? "Create" : "Save"}
                </button>
                <button
                  onClick={() => (isNew ? handleClose() : setEditing(false))}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: "#9ca3af", color: "#111" }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}