// CourseCard.jsx
export default function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        color: "#111",
      }}
    >
      {/* Code Badge */}
      <div
        className="inline-block px-2 py-1 rounded text-[10px] font-mono font-semibold mb-2 w-fit"
        style={{ background: "#f3f4f6", color: "#111" }}
      >
        {course.code}
      </div>

      {/* Course Name */}
      <h3 className="font-semibold text-[14px] mb-1 h-12">{course.name}</h3>

      {/* Info Row */}
      <div
        className="flex items-center gap-3 text-[11px]"
        style={{ color: "#6b7280" }}
      >
        <span>{course.level} lvl</span>
        <span>•</span>
        <span>{course.credits} units</span>
        <span>•</span>
        <span className="capitalize">{course.type}</span>
      </div>

      <div className="flex gap-4 mt-2 pt-2 border-t" style={{ borderColor: "#e5e7eb" }}>
        {/* Department Info */}
        {course.department_name && (
          <div>
            <div className="text-[10px]" style={{ color: "#9ca3af" }}>
              DEPARTMENT
            </div>
            <div className="text-[12px] mt-1">{course.department_name}</div>
          </div>
        )}
        {course.faculty_name && (
          <div>
            <div className="text-[10px]" style={{ color: "#9ca3af" }}>
              FACULTY
            </div>
            <div className="text-[12px] mt-1">{course.faculty_name}</div>
          </div>
        )}
      </div>
    </div>
  );
}