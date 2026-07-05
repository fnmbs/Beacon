import { useState, useRef, useEffect } from "react";
import CourseCard from "../CourseCard";
import Loader from "../Loader";
import CourseDetailPanel from "./CourseDetailPanel";
import useCourseStore from "../../store/useCourseStore";
import useLecturerStore from "../../store/useLecturerStore";

export default function CoursesTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);
  const limit = 10;

  const { courses, fetchCourses, fetchSearchCourses, loading, totalCourses, addCourse, updateCourse, deleteCourse, assignLecturers, clearAssignedLecturers } = useCourseStore();
  const { clearLecturers } = useLecturerStore();
  const totalPages = totalCourses > 0 ? Math.ceil(totalCourses / limit) : 1;

  useEffect(() => { if (search.trim()) { fetchSearchCourses(search); } else { fetchCourses(page, limit); } }, [page, search]);

  const handleSearch = (e) => { const val = e.target.value; setSearch(val); clearTimeout(debounceRef.current); if (val.trim()) { debounceRef.current = setTimeout(() => { fetchSearchCourses(val); setPage(1); }, 300); } else { fetchCourses(1, limit); setPage(1); } };

  const handleSelectCourse = (course) => { clearLecturers(); clearAssignedLecturers(); setSelected(null); setTimeout(() => setSelected(course), 0); };
  const handleNew = () => { clearLecturers(); clearAssignedLecturers(); setSelected(null); setTimeout(() => { setSelected({ id: null, name: "", code: "", description: "", type: "compulsory", level: 100, credits: 1, semester: "harmattan", faculty_id: null, department_id: null, lecturer_ids: [] }); }, 0); };

  const handleAdd = async (form) => {
    try {
      const payload = { code: form.code, name: form.name, description: form.description, facultyId: form.facultyId, departmentId: form.departmentId, credits: Number(form.credits), semester: form.semester, type: form.type };
      if (form.eligibleLevels && form.eligibleLevels.length > 0) payload.eligibleLevels = form.eligibleLevels;
      else payload.level = Number(form.level);
      const course = await addCourse(payload);
      if (form.assignedLecturers.length > 0) { await assignLecturers(course.id, form.assignedLecturers); }
      setSelected(null);
      await fetchCourses(page, limit);
    }
    catch (error) { console.error("Failed to add course:", error); }
  };
  const handleUpdate = async (id, form) => {
    try {
      const payload = { code: form.code, name: form.name, description: form.description, faculty_id: form.facultyId, department_id: form.departmentId, credits: Number(form.credits), semester: form.semester, type: form.type, is_active: true };
      if (form.eligibleLevels && form.eligibleLevels.length > 0) payload.eligibleLevels = form.eligibleLevels;
      else payload.level = Number(form.level);
      await updateCourse(id, payload);
      if (form.assignedLecturers.length > 0) { await assignLecturers(id, form.assignedLecturers); }
      setSelected(null);
      await fetchCourses(page, limit);
    }
    catch (error) { console.error("Failed to update course:", error); }
  };
  const handleDelete = async (id) => { try { await deleteCourse(id); setSelected(null); await fetchCourses(page, limit); } catch (error) { console.error("Failed to delete course:", error); } };

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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e5e5", color: "#111", background: "#fff", cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ fontSize: 12, color: "#888" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e5e5", color: "#111", background: "#fff", cursor: "pointer", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </>
      )}

      {selected && <CourseDetailPanel key={selected?.id || "new"} course={selected} isNew={!selected.id} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} onAdd={handleAdd} />}
    </div>
  );
}