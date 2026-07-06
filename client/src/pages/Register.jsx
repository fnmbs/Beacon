import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!fullName || !email || !password || !confirmPassword) { setError("All fields are required"); setLoading(false); return; }
      if (password !== confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
      const response = await authAPI.register(email, password, fullName);
      const { data } = response.data;
      register(data.user, data.token, data.refreshToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: "100%", maxWidth: "340px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#111", letterSpacing: "-0.03em", marginBottom: 6 }}>MAPU</div>
          <div style={{ fontSize: 12, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Create Account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#111", marginBottom: 6 }}>Full Name</label>
            <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#111", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#111", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#111", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#111", marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#111", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#111", marginBottom: 6 }}>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#111", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#111"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"} />
          </div>

          {error && <span style={{ display: "block", fontSize: 12, color: "#d32f2f", marginBottom: 12 }}>{error}</span>}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "10px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "opacity 0.15s", opacity: loading ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!loading) e.target.style.opacity = "0.8" }}
            onMouseLeave={(e) => { if (!loading) e.target.style.opacity = "1" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div style={{ height: 1, background: "#eee", margin: "24px 0" }} />

        <div style={{ textAlign: "center", fontSize: 12, color: "#888" }}>
          Already have an account? <Link to="/login" style={{ color: "#111", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}