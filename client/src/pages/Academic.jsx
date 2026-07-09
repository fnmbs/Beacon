import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import LecturersTab from "../components/AcademicTab/LecturersTab";
import CoursesTab from "../components/AcademicTab/CoursesTab";
import DepartmentsTab from "../components/AcademicTab/DepartmentsTab";
import FacultiesTab from "../components/AcademicTab/FacultiesTab";
import ScheduleTab from "../components/AcademicTab/ScheduleTab";

const TABS = [
  { id: "Faculties", label: "Faculties" },
  { id: "Departments", label: "Departments" },
  { id: "Lecturers", label: "Lecturers" },
  { id: "Courses", label: "Courses" },
  { id: "Schedule", label: "Schedule" },
];

export default function Academic() {
  const [tab, setTab] = useState("Faculties");
  const theme = useTheme();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: theme.bg.primary, color: theme.text.primary }}>
      <div style={{ background: "#1a1a1a" }}>
        <div className="px-8 pt-5 pb-1">
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff" }}>Academic</h1>
          <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Manage faculties, departments, lecturers, and courses</p>
        </div>

        <nav className="flex gap-0.5 px-6 pt-4 pb-3">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "7px 14px", fontSize: 13, fontWeight: 400, color: active ? "#fff" : "#999", background: active ? "rgba(255,255,255,0.1)" : "transparent", border: "none", borderRadius: 6, cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { if (!active) { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.color = "#e5e5e5"; } }}
                onMouseLeave={(e) => { if (!active) { e.target.style.background = "transparent"; e.target.style.color = "#999"; } }}>
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 px-8 py-6">
        {tab === "Faculties" && <FacultiesTab />}
        {tab === "Departments" && <DepartmentsTab />}
        {tab === "Lecturers" && <LecturersTab />}
        {tab === "Courses" && <CoursesTab />}
        {tab === "Schedule" && <ScheduleTab />}
      </div>
    </div>
  );
}