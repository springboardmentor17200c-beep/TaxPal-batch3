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

      {/* LEFT SECTION */}
      <div className="login-left">

        <div className="overview-card">

          <div className="overview-header">
            <div className="overview-icon">
              <BarChart3 />
            </div>
            <div>
              <h3>Financial Overview</h3>
              <p>Real-time insights</p>
            </div>
          </div>

          <div className="overview-stats">

            <div className="stat-box">
              <div className="stat-left">
                <span className="stat-icon green">↗</span>
                <span>Revenue Growth</span>
              </div>
              <span className="green">+24.5%</span>
            </div>

            <div className="stat-box">
              <div className="stat-left">
                <span className="stat-icon blue">$</span>
                <span>Tax Savings</span>
              </div>
              <span className="blue">$3,420</span>
            </div>

          </div>

        </div>


        <h2 className="login-title">
          Manage your freelance finances with confidence
        </h2>

        <p className="login-desc">
          Track income, estimate taxes, and gain insights — all in one beautiful dashboard.
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="login-right">

        <div className="login-header">
          <div className="logo">T</div>
          <h2>Welcome back</h2>
          <p>Sign in to your TaxPal account</p>
        </div>

        <div className="glass-card">

          {!isResetMode ? (
            <form onSubmit={handleLogin}>
              {/* LOGIN FORM */}
              {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}

              <div className="form-group">
                <label>Email</label>
                <div className="input-box">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-box">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsResetMode(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          ) : (
            <>
              {/* PASSWORD RESET FORM */}
              {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}
              {success && <div style={{ color: '#059669', marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', borderRadius: '0.5rem' }}>{success}</div>}

              {/* STEP 1: Enter Email */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestReset}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-box">
                      <Mail size={18} />
                      <input
                        type="email"
                        placeholder="you@example.com"
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
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Check your email for the 6-digit reset code
                    </p>
                    <div className="input-box">
                      <Lock size={18} />
                      <input
                        type="text"
                        placeholder="Enter reset code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                        disabled={loading}
                        required
                        maxLength="6"
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
    </div>
  );
};

export default Login;
