import { useState } from "react";
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

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "system-ui, sans-serif", background: "#F5F6F4" }}>
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>Academic</span>
        </div>
        <nav className="flex gap-0.5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "4px 12px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#111" : "#6B7280", background: active ? "#F3F4F6" : "transparent", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="flex-1 p-8">
        {tab === "Faculties" && <FacultiesTab />}
        {tab === "Departments" && <DepartmentsTab />}
        {tab === "Lecturers" && <LecturersTab />}
        {tab === "Courses" && <CoursesTab />}
        {tab === "Schedule" && <ScheduleTab />}
      </div>
    </div>
  );
}