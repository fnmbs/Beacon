import { useState, useRef, useEffect } from "react";
import CourseCard from "../CourseCard";
import Loader from "../Loader";
import CourseDetailPanel from "./CourseDetailPanel";
import useCourseStore from "../../store/useCourseStore";
import useLecturerStore from "../../store/useLecturerStore";

export default function CoursesTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const debounceRef = useRef(null);
  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { courses, fetchAllCourses, fetchSearchCourses, loading, totalCourses, addCourse, updateCourse, deleteCourse, assignLecturers, clearAssignedLecturers } = useCourseStore();
  const { clearLecturers } = useLecturerStore();

  useEffect(() => { if (search.trim()) { fetchSearchCourses(search); } else { fetchAllCourses(); } }, [search]);

  const handleSearch = (e) => { const val = e.target.value; setSearch(val); clearTimeout(debounceRef.current); if (val.trim()) { debounceRef.current = setTimeout(() => { fetchSearchCourses(val); }, 300); } else { fetchAllCourses(); } };

  const handleSelectCourse = (course) => { clearLecturers(); clearAssignedLecturers(); setSelected(null); setTimeout(() => setSelected(course), 0); };
  const handleNew = () => { clearLecturers(); clearAssignedLecturers(); setSelected(null); setTimeout(() => { setSelected({ id: null, name: "", code: "", description: "", type: "compulsory", level: 100, credits: 1, semester: "harmattan", faculty_id: null, department_id: null, lecturer_ids: [] }); }, 0); };

  const handleAdd = async (form) => {
    try {
      const payload = { code: form.code, name: form.name, description: form.description || "", facultyId: form.facultyId, departmentId: form.departmentId, credits: Number(form.credits), semester: form.semester, type: form.type };
      if (form.eligibleLevels && form.eligibleLevels.length > 0) payload.eligibleLevels = form.eligibleLevels;
      const course = await addCourse(payload);
      if (form.assignedLecturers.length > 0) { await assignLecturers(course.id, form.assignedLecturers); }
      setSelected(null);
      await fetchAllCourses();
      toast_("Course created");
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create course";
      toast_(msg);
      throw error;
    }
  };
  const handleUpdate = async (id, form) => {
    try {
      const payload = { code: form.code, name: form.name, description: form.description, faculty_id: form.facultyId, department_id: form.departmentId, credits: Number(form.credits), semester: form.semester, type: form.type, is_active: true };
      if (form.eligibleLevels && form.eligibleLevels.length > 0) payload.eligibleLevels = form.eligibleLevels;
      await updateCourse(id, payload);
      if (form.assignedLecturers.length > 0) { await assignLecturers(id, form.assignedLecturers); }
      setSelected(null);
      await fetchAllCourses();
    }
    catch (error) { console.error("Failed to update course:", error); }
  };
  const handleDelete = async (id) => { try { await deleteCourse(id); setSelected(null); await fetchAllCourses(); } catch (error) { console.error("Failed to delete course:", error); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#111", opacity: 0.25 }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" /><path d="M13 13l-2.5-2.5" />
            </svg>
            <input className="w-full outline-none" style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
              placeholder="Search courses by name or code…" value={search} onChange={handleSearch} />
          </div>
        </div>
        <button onClick={handleNew} style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500, color: "#fff", background: "#111", cursor: "pointer" }}>+ New Course</button>
      </div>

      {loading && <Loader />}

      {!loading && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {courses.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-lg" style={{ background: "#fafafa", color: "#999", border: "1px dashed #e5e5e5" }}>No courses found</div>
            ) : courses.map((course) => <CourseCard key={course.id} course={course} onClick={() => handleSelectCourse(course)} />)}
          </div>

          <div style={{ fontSize: 11, color: "#bbb", marginTop: -12, marginBottom: 16 }}>{totalCourses} course{totalCourses !== 1 ? "s" : ""}</div>
        </>
      )}

      {selected && <CourseDetailPanel key={selected?.id || "new"} course={selected} isNew={!selected.id} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} onAdd={handleAdd} />}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5" style={{ zIndex: 10001, background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>{toast}</div>}
    </div>
  );
}