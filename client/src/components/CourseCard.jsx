export default function CourseCard({ course, onClick }) {
  return (
    <div onClick={onClick} className="p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-sm"
      style={{ background: "#fff", border: "1px solid #e5e5e5", color: "#111" }}>
      <div style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: "#f5f5f5", color: "#555", marginBottom: 8 }}>{course.code}</div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{course.name}</h3>
      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#888" }}>
        <span>{course.level} lvl</span>
        <span>•</span>
        <span>{course.credits} units</span>
        <span>•</span>
        <span className="capitalize">{course.type}</span>
      </div>
      <div style={{ borderTop: "1px solid #eee", marginTop: 8, paddingTop: 8, display: "flex", gap: 12, fontSize: 11 }}>
        {course.department_name && <div><span style={{ color: "#bbb" }}>DEPT </span><span style={{ color: "#555" }}>{course.department_name}</span></div>}
        {course.faculty_name && <div><span style={{ color: "#bbb" }}>FAC </span><span style={{ color: "#555" }}>{course.faculty_name}</span></div>}
      </div>
    </div>
  );
}