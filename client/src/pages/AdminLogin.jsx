import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAuthAPI } from "../api/axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }
      const response = await adminAuthAPI.login(email, password);
      const { data } = response.data;
      login(data.admin || data.user, data.token, data.refreshToken);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F6F4",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0F766E",
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            MAPU
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#111111",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Admin Login
          </div>
        </div>

        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E1E5E1",
          borderRadius: 18,
          padding: 24,
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  border: "1px solid #D8DEDA",
                  borderRadius: 12,
                  fontSize: 15,
                  color: "#111111",
                  outline: "none",
                  fontFamily: "system-ui, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  border: "1px solid #D8DEDA",
                  borderRadius: 12,
                  fontSize: 15,
                  color: "#111111",
                  outline: "none",
                  fontFamily: "system-ui, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <span style={{ display: "block", fontSize: 12, color: "#FF3B30", marginBottom: 12, fontFamily: "system-ui, sans-serif" }}>
                {error}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 56,
                background: "#111111",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.opacity = "1";
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div style={{ height: 1, background: "#E5E7EB", margin: "24px 0" }} />

        <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>
          Back to{" "}
          <Link to="/login" style={{ color: "#0F766E", fontWeight: 600, textDecoration: "none", fontFamily: "system-ui, sans-serif" }}>
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
