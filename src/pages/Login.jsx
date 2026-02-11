import { Mail, Lock,BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/login.css";
import { useState } from "react";


const Login = () => {

  const [isResetMode, setIsResetMode] = useState(false);

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
            <>
              {/* LOGIN FORM */}

              <div className="form-group">
                <label>Email</label>
                <div className="input-box">
                  <Mail size={18} />
                  <input type="email" placeholder="you@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-box">
                  <Lock size={18} />
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsResetMode(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button className="login-btn">Sign In →</button>
            </>
          ) : (
            <>
              {/* RESET PASSWORD FORM */}

              <div className="form-group">
                <label>Email</label>
                <div className="input-box">
                  <Mail size={18} />
                  <input type="email" placeholder="you@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-box">
                  <Lock size={18} />
                  <input type="password" placeholder="Enter new password" />
                </div>
              </div>

              <div className="form-group">
                <label>Re-enter Password</label>
                <div className="input-box">
                  <Lock size={18} />
                  <input type="password" placeholder="Confirm password" />
                </div>
              </div>

              <button className="login-btn">Reset Password →</button>

              <div className="back-to-login">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setIsResetMode(false)}
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
