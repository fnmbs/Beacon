import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-3.5 h-3.5"
      >
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
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-3.5 h-3.5"
      >
        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
        <circle cx="8" cy="6" r="1.5" />
      </svg>
    ),
  },
  {
    to: "/paths",
    label: "Paths",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-3.5 h-3.5"
      >
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
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-3.5 h-3.5"
      >
        <polygon points="3,1.5 13,8 3,14.5" />
      </svg>
    ),
  },
  {
    to: "/academics",
    label: "Academics",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="w-3.5 h-3.5"
      >
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
      {/* Import Instrument Sans */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        .nav-link-label {
          font-family: 'Instrument Sans', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
        }

        .section-label {
          font-family: 'Instrument Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .logo-wordmark {
          font-family: 'Instrument Serif', serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.04em;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          transition: opacity 120ms ease;
          text-decoration: none;
          color: #000;
          border-left: 2px solid transparent;
        }

        .nav-item:hover {
          opacity: 0.5;
        }

        .nav-item.active {
          border-left: 2px solid #000;
          opacity: 1;
        }

        .nav-item.active .nav-link-label {
          font-weight: 500;
        }
      `}</style>

      <div
        className="flex h-full min-h-screen"
        style={{ background: "#ffffff", color: "#000000" }}
      >
        {/* MOBILE TOP BAR */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
          style={{
            height: "52px",
            background: "#ffffff",
            borderBottom: "1px solid #000000",
          }}
        >
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col gap-1 p-1"
            aria-label="Open menu"
          >
            <span
              style={{
                display: "block",
                width: "18px",
                height: "1px",
                background: "#000",
              }}
            />
            <span
              style={{
                display: "block",
                width: "12px",
                height: "1px",
                background: "#000",
              }}
            />
          </button>
          <span className="logo-wordmark">MAPU</span>
          <div style={{ width: "26px" }} />
        </div>

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 flex flex-col z-50 transform transition-transform duration-200 ease-in-out
            ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
          style={{
            width: "200px",
            background: "#ffffff",
            borderRight: "1px solid #000000",
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center px-6"
            style={{ height: "52px", borderBottom: "1px solid #000" }}
          >
            <span className="logo-wordmark">MAPU</span>
          </div>

          {/* Section label */}
          <div className="px-6 pt-7 pb-3">
            <span className="section-label" style={{ opacity: 0.3 }}>
              Menu
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 flex flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        opacity: isActive ? 1 : 0.35,
                        lineHeight: 0,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="nav-link-label">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: "1px solid #000" }}>
            <span className="section-label" style={{ opacity: 0.2 }}>
              Account
            </span>
            {user && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 8,
                  }}
                >
                  {user.fullName}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#000",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={() => setOpen(false)}
          />
        )}

        {/* MAIN */}
        <main
          className="flex-1 flex flex-col min-h-screen"
          style={{
            marginLeft: "200px",
            background: "#ffffff",
            paddingTop: 0,
          }}
        >
          <div className="md:hidden" style={{ height: "52px" }} />

          {/* Email Verification Banner */}
          {user && !user.isEmailVerified && (
            <div
              style={{
                background: "#fff3cd",
                borderBottom: "1px solid #ffc107",
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#856404", fontWeight: 500 }}>
                ⚠️ Please verify your email address. Check your inbox for a
                verification link.
              </span>
              <button
                onClick={async () => {
                  try {
                    await import("../api/axios").then((m) =>
                      m.authAPI.resendVerificationEmail(),
                    );
                    alert("Verification email resent!");
                  } catch (err) {
                    alert("Failed to resend email");
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0c5460",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 500,
                  textDecoration: "underline",
                }}
              >
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
