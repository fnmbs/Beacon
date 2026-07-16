import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="1.5" y="1.5" width="5" height="5" rx="0.5" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="0.5" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="0.5" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    to: "/locations",
    label: "Locations",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
        <circle cx="8" cy="6" r="1.5" />
      </svg>
    ),
  },
  {
    to: "/paths",
    label: "Paths",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="3" cy="8" r="1.5" />
        <circle cx="13" cy="3" r="1.5" />
        <circle cx="13" cy="13" r="1.5" />
        <path d="M4.5 8h3l3.5-3.5" />
        <path d="M7.5 8l3.5 3.5" />
      </svg>
    ),
  },
  {
    to: "/tester",
    label: "Navigator",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <polygon points="3,1.5 13,8 3,14.5" />
      </svg>
    ),
  },
  {
    to: "/editor",
    label: "Map Editor",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M2 3h12v10H2z" />
        <path d="M8 3v10" />
        <path d="M2 8h12" />
        <circle cx="8" cy="8" r="1.5" />
      </svg>
    ),
  },
  {
    to: "/campus-boundary",
    label: "Campus Boundary",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M2.5 4.5 8 2l5.5 2.5v7L8 14l-5.5-2.5z" />
        <path d="M8 2v12" />
        <path d="M2.5 4.5 8 7l5.5-2.5" />
      </svg>
    ),
  },
  {
    to: "/academics",
    label: "Academics",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M2 5.5h12M2.5 5.5v6c0 1 .5 1.5 1.5 1.5h10c1 0 1.5-.5 1.5-1.5v-6" />
        <path d="M4 5.5L8 2l4 3.5" />
      </svg>
    ),
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          text-decoration: none;
          color: #6B7280;
          font-size: 13px;
          font-family: system-ui, sans-serif;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.15s ease;
        }
        .sidebar-link:hover {
          background: #F3F4F6;
          color: #111111;
        }
        .sidebar-link.active {
          background: #EAF7F4;
          color: #0F766E;
        }
        .sidebar-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #9CA3AF;
          font-family: system-ui, sans-serif;
        }
      `}</style>

      <div className="flex h-full min-h-screen" style={{ background: "#F5F6F4", color: "#111111", fontFamily: "system-ui, sans-serif" }}>
        {/* MOBILE TOP BAR */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4" style={{ height: "48px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
          <button onClick={() => setOpen(true)} className="flex flex-col gap-1 p-1" aria-label="Open menu">
            <span style={{ display: "block", width: "18px", height: "1.5px", background: "#111" }} />
            <span style={{ display: "block", width: "12px", height: "1.5px", background: "#111" }} />
          </button>
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.02em" }}>MAPU</span>
          <div style={{ width: "26px" }} />
        </div>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
          style={{ width: "220px", background: "#FFFFFF", borderRight: "1px solid #E5E7EB" }}>
          {/* Logo */}
          <div className="flex items-center px-5" style={{ height: "48px", borderBottom: "1px solid #E5E7EB" }}>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#0F766E" }}>MAPU</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", marginLeft: 6, marginTop: 2 }}>ADMIN</span>
          </div>

          <div className="px-4 pt-6 pb-2">
            <span className="sidebar-label">Navigation</span>
          </div>

          <nav className="flex-1 px-2 flex flex-col gap-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className="sidebar-link"
              >
                <span style={{ opacity: 0.6, lineHeight: 0, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: "1px solid #E5E7EB" }}>
            <span className="sidebar-label">Account</span>
            {user && (
              <div className="mt-3">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>{user.fullName}</div>
                <button onClick={handleLogout} className="w-full text-left"
                  style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#9CA3AF", background: "transparent", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.target.style.background = "#F9FAFB"; e.target.style.color = "#111111" }}
                  onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#9CA3AF" }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {open && <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.25)" }} onClick={() => setOpen(false)} />}

        {/* MAIN */}
        <main className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "220px" }}>
          <div className="md:hidden" style={{ height: "48px" }} />



          <Outlet />
        </main>
      </div>
    </>
  );
}
