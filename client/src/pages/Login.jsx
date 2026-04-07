import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";

export default function Login() {
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

      const response = await authAPI.login(email, password);
      const { data } = response.data;

      login(data.user, data.token, data.refreshToken);
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
        background: "#ffffff",
        fontFamily: "'Instrument Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        .login-container {
          width: 100%;
          max-width: 380px;
          padding: 0 20px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #000;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 12px;
          color: #999;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 400;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 14px;
          color: #000;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #000;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .form-input::placeholder {
          color: #bbb;
        }

        .error-message {
          display: block;
          font-size: 12px;
          color: #d32f2f;
          margin-top: 6px;
          font-weight: 400;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #333;
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-link {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: #666;
        }

        .auth-link a {
          color: #000;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .auth-link a:hover {
          opacity: 0.6;
        }

        .divider {
          height: 1px;
          background: #e0e0e0;
          margin: 24px 0;
        }
      `}</style>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">BEACON</div>
          <div className="login-subtitle">Campus Navigation</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <span className="error-message">{error}</span>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="divider" />

       
      </div>
    </div>
  );
}
