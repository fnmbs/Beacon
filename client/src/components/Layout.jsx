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
          color: #999;
          font-size: 13px;
          font-weight: 400;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.06);
          color: #e5e5e5;
        }
        .sidebar-link.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .sidebar-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #555;
        }
      `}</style>

      <div className="flex h-full min-h-screen bg-[#fff] text-[#111]">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4" style={{ height: "48px", background: "#fff", borderBottom: "1px solid #e5e5e5" }}>
          <button onClick={() => setOpen(true)} className="flex flex-col gap-1 p-1" aria-label="Open menu">
            <span style={{ display: "block", width: "18px", height: "1.5px", background: "#111" }} />
            <span style={{ display: "block", width: "12px", height: "1.5px", background: "#111" }} />
          </button>
          <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.02em" }}>BEACON</span>
          <div style={{ width: "26px" }} />
        </div>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
          style={{ width: "220px", background: "#1a1a1a" }}>
          {/* Logo */}
          <div className="flex items-center px-5" style={{ height: "48px", borderBottom: "1px solid #2a2a2a" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>BEACON</span>
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
                <span style={{ opacity: 0.7, lineHeight: 0, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: "1px solid #2a2a2a" }}>
            <span className="sidebar-label">Account</span>
            {user && (
              <div className="mt-3">
                <div style={{ fontSize: 12, fontWeight: 500, color: "#ccc", marginBottom: 8 }}>{user.fullName}</div>
                <button onClick={handleLogout} className="w-full text-left"
                  style={{ padding: "6px 10px", fontSize: 11, color: "#777", background: "transparent", border: "1px solid #333", borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#ccc" }}
                  onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#777" }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {open && <div className="fixed inset-0 z-40 md:hidden bg-black/20" onClick={() => setOpen(false)} />}

        {/* MAIN */}
        <main className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "220px" }}>
          <div className="md:hidden" style={{ height: "48px" }} />

          {/* Email Verification Banner */}
          {user && !user.isEmailVerified && (
            <div style={{ background: "#fafafa", borderBottom: "1px solid #e5e5e5", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "#666" }}>Please verify your email address. Check your inbox for a verification link.</span>
              <button onClick={async () => { try { await authAPI.resendVerificationEmail(); alert("Verification email resent!"); } catch { alert("Failed to resend email"); } }}
                style={{ background: "none", border: "none", color: "#111", cursor: "pointer", fontSize: 11, fontWeight: 500, textDecoration: "underline" }}>
                Resend
              </button>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </>
  );
}
