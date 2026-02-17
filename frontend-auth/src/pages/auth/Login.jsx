import { Mail, Lock, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { useState } from "react";
import { authAPI } from "../../services/api";
import { useUser } from "../../context/UserContext";


const Login = () => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter email and password");
        setLoading(false);
        return;
      }

      const result = await authAPI.login(email, password);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!resetEmail) {
        setError("Please enter your email");
        setLoading(false);
        return;
      }

      const result = await authAPI.requestPasswordReset(resetEmail);
      setSuccess(result.message || "Reset code sent to your email");
      // For development testing, show the code
      if (result.resetCode) {
        console.log(`Reset Code (for testing): ${result.resetCode}`);
      }
      setResetStep(2); // Move to code verification step
    } catch (err) {
      setError(err.message || "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!resetCode) {
        setError("Please enter the reset code");
        setLoading(false);
        return;
      }

      const result = await authAPI.verifyResetCode(resetEmail, resetCode);
      setSuccess("Code verified successfully");
      setResetStep(3); // Move to password reset step
    } catch (err) {
      setError(err.message || "Invalid or expired reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError("Please enter both passwords");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const result = await authAPI.resetPassword(
        resetEmail,
        resetCode,
        newPassword,
        confirmPassword
      );

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        setIsResetMode(false);
        setResetStep(1);
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <BarChart3 size={40} />
          <h1>TaxPal</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isResetMode ? (
          <>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-box">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-box">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login →"}
              </button>
            </form>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up here</Link>
            </div>

            <button
              type="button"
              className="forgot-link"
              onClick={() => setIsResetMode(true)}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </>
        ) : (
          <>
            {/* STEP 1: Request Reset */}
            {resetStep === 1 && (
              <form onSubmit={handleRequestReset}>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-box">
                    <Mail size={18} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Code →"}
                </button>
              </form>
            )}

            {/* STEP 2: Verify Code */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label>Reset Code</label>
                  <div className="input-box">
                    <Lock size={18} />
                    <input
                      type="text"
                      placeholder="Enter reset code from email"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code →"}
                </button>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {resetStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-box">
                      <Lock size={18} />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-box">
                      <Lock size={18} />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password →"}
                  </button>
                </form>
              )}

              <div className="back-to-login">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetStep(1);
                    setResetEmail("");
                    setResetCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Login;
