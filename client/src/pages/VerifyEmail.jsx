import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) { setError("Invalid or missing verification token."); setLoading(false); return; }
      try {
        await authAPI.verifyEmail(token);
        setSuccess(true);
        updateUser({ isEmailVerified: true });
        setLoading(false);
        setTimeout(() => { navigate("/dashboard"); }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to verify email. Please try again.");
        setLoading(false);
      }
    };
    verifyEmail();
  }, [token, navigate, updateUser]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 20px" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111", textAlign: "center", marginBottom: 24, letterSpacing: "-0.03em" }}>Email Verification</h1>

          {loading && (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <div className="animate-spin rounded-full h-8 w-8" style={{ border: "2px solid #e5e5e5", borderTopColor: "#111" }} />
              </div>
              <p style={{ color: "#888", fontSize: 13 }}>Verifying your email...</p>
            </div>
          )}

          {success && (
            <div style={{ textAlign: "center" }}>
              <div style={{ padding: "10px 16px", marginBottom: 12, background: "#f6f6f6", border: "1px solid #e5e5e5", borderRadius: 6 }}>
                <p style={{ color: "#111", fontSize: 13 }}>✓ Email verified successfully!</p>
              </div>
              <p style={{ color: "#888", fontSize: 12 }}>Thank you for verifying your email. You'll be redirected to your dashboard.</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6 }}>
                <p style={{ color: "#d32f2f", fontSize: 13 }}>{error}</p>
              </div>
              {user && !user.isEmailVerified && (
                <button onClick={async () => { try { setLoading(true); await authAPI.resendVerificationEmail(); setError("Verification email resent. Please check your inbox."); setLoading(false); } catch { setError("Failed to resend verification email"); setLoading(false); } }}
                  style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#fff", background: "#111", border: "none", cursor: "pointer", width: "100%" }}>Resend Verification Email</button>
              )}
              <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, color: "#111", background: "none", border: "1px solid #e5e5e5", cursor: "pointer", width: "100%" }}>Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}