// CoursesTab.jsx
import { useState, useRef, useEffect } from "react";
import SearchInput from "../SearchInput";
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

  const {
    courses,
    fetchCourses,
    fetchSearchCourses,
    loading,
    totalCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    assignLecturers,
    clearAssignedLecturers,
  } = useCourseStore();

  const { clearLecturers } = useLecturerStore();

  const totalPages = totalCourses > 0 ? Math.ceil(totalCourses / limit) : 1;

  useEffect(() => {
    if (search.trim()) {
      fetchSearchCourses(search);
    } else {
      fetchCourses(page, limit);
    }
  }, [page]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);

    if (val.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSearchCourses(val);
        setPage(1);
      }, 300);
    } else {
      fetchCourses(1, limit);
      setPage(1);
    }
  };

  const handleSelectCourse = (course) => {
    clearLecturers();
    clearAssignedLecturers();
    setSelected(null);
    setTimeout(() => setSelected(course), 0);
  };

  const handleNew = () => {
    clearLecturers();
    clearAssignedLecturers();
    setSelected(null);
    setTimeout(() => {
      setSelected({
        id: null,
        name: "",
        code: "",
        description: "",
        type: "compulsory",
        level: 100,
        credits: 1,
        semester: "harmattan",
        faculty_id: null,
        department_id: null,
        lecturer_ids: [],
      });
    }, 0);
  };

  const handleAdd = async (form) => {
    try {
      const courseData = {
        code: form.code,
        name: form.name,
        description: form.description,
        facultyId: form.facultyId,
        departmentId: form.departmentId,
        level: Number(form.level),
        credits: Number(form.credits),
        semester: form.semester,
        type: form.type,
      };
      const course = await addCourse(courseData);
      if (form.assignedLecturers.length > 0) {
        await assignLecturers(course.id, form.assignedLecturers);
      }
      setSelected(null);
      await fetchCourses(page, limit);
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      const courseData = {
        code: form.code,
        name: form.name,
        description: form.description,
        faculty_id: form.facultyId,
        department_id: form.departmentId,
        level: Number(form.level),
        credits: Number(form.credits),
        semester: form.semester,
        type: form.type,
        is_active: true,
      };
      await updateCourse(id, courseData);
      if (form.assignedLecturers.length > 0) {
        await assignLecturers(id, form.assignedLecturers);
      }
      setSelected(null);
      await fetchCourses(page, limit);
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setSelected(null);
      await fetchCourses(page, limit);
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="p-8 mx-20" style={{ background: "#fff", color: "#111" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search courses by name or code…"
          />
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
          style={{ background: "#111", color: "#fff" }}
        >
          + New Course
        </button>
      </div>

      {/* Loading State */}
      {loading && <Loader />}

      {/* Courses Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {courses.length === 0 ? (
              <div
                className="p-8 text-center rounded-lg"
                style={{ background: "#f9f9f9", color: "#6b7280", border: "1px solid #e5e7eb" }}
              >
                No courses found
              </div>
            ) : (
              courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleSelectCourse(course)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-[12px] disabled:opacity-50"
                style={{ background: "#f3f4f6", color: "#111", border: "1px solid #e5e7eb" }}
              >
                ← Prev
              </button>
              <span className="text-[12px]" style={{ color: "#6b7280" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded text-[12px] disabled:opacity-50"
                style={{ background: "#f3f4f6", color: "#111", border: "1px solid #e5e7eb" }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Panel */}
      {selected && (
        <CourseDetailPanel
          key={selected?.id || "new"}
          course={selected}
          isNew={!selected.id}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}