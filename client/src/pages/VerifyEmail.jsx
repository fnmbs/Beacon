import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";
import Layout from "../components/Layout";

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
      if (!token) {
        setError("Invalid or missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setSuccess(true);
        // Update user context to reflect email verification
        updateUser({ isEmailVerified: true });
        setLoading(false);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to verify email. Please try again.",
        );
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate, updateUser]);

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 rounded-lg p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-8 text-center font-serif">
              Email Verification
            </h1>

            {loading && (
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
                <p className="text-gray-400">Verifying your email...</p>
              </div>
            )}

            {success && (
              <div className="space-y-6">
                <div className="p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded">
                  <p className="text-green-300 text-sm">
                    ✓ Email verified successfully!
                  </p>
                </div>
                <p className="text-gray-400 text-center">
                  Thank you for verifying your email. You'll be redirected to
                  your dashboard.
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="space-y-6">
                <div className="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>

                {/* Resend Verification Email Button */}
                {user && !user.isEmailVerified && (
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await authAPI.resendVerificationEmail();
                        setError(
                          "Verification email resent. Please check your inbox.",
                        );
                        setLoading(false);
                      } catch (err) {
                        setError("Failed to resend verification email");
                        setLoading(false);
                      }
                    }}
                    className="w-full px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
                  >
                    Resend Verification Email
                  </button>
                )}

                {/* Back to Dashboard Button */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white text-white font-semibold rounded hover:bg-opacity-20 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
