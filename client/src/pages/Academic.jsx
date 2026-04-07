import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import LecturersTab from "../components/AcademicTab/LecturersTab";
import CoursesTab from "../components/AcademicTab/CoursesTab";
import DepartmentsTab from "../components/AcademicTab/DepartmentsTab";
import FacultiesTab from "../components/AcademicTab/FacultiesTab";

const TABS = [
  { id: "Faculties", label: "Faculties" },
  { id: "Departments", label: "Departments" },
  { id: "Lecturers", label: "Lecturers" },
  { id: "Courses", label: "Courses" },
];

export default function Academic() {
  const [tab, setTab] = useState("Faculties");
  const theme = useTheme();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: theme.bg.primary,
        color: theme.text.primary,
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: theme.bg.secondary,
          borderBottom: `1px solid ${theme.border.light}`,
        }}
      >
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Academic
          </h1>

          <p
            className="text-sm mt-1"
            style={{ color: theme.text.secondary }}
          >
            Manage faculties, departments, lecturers, and courses
          </p>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 relative">
            {TABS.map((t) => {
              const active = tab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative pb-3 text-sm font-medium transition-all duration-200"
                  style={{
                    color: active
                      ? theme.text.primary
                      : theme.text.secondary,
                  }}
                >
                  {t.label}

                  {/* underline */}
                  <span
                    className="absolute left-0 bottom-0 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      width: active ? "100%" : "0%",
                      background: theme.accent.primary,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-8 py-6">
        <div
          className="h-full rounded-xl p-6"
          style={{
            background: theme.bg.secondary,
            border: `1px solid ${theme.border.light}`,
          }}
        >
          {tab === "Faculties" && <FacultiesTab />}
          {tab === "Departments" && <DepartmentsTab />}
          {tab === "Lecturers" && <LecturersTab />}
          {tab === "Courses" && <CoursesTab />}
        </div>
      </div>
    </div>
  );
}