import { User, Mail, Lock, Globe, PieChart, LucideFolderLock, Shield,DollarSign } from "lucide-react";
import "../styles/signup.css";
import CustomDropdown from "../components/CustomDropdown";
import { Link } from "react-router-dom";


const Signup = () => {
  return (
    <div className="signup-container">
      
      {/* LEFT SIDE */}
      <div className="signup-left">
      <div className="features-grid">
          <div className="feature-card">
            <div className="icon"><PieChart size={22} /></div>
            <div>
              <h4>Expense Tracking</h4>
              <p>Categorize automatically</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon"><LucideFolderLock size={22} /></div>
            <div>
              <h4>Tax Estimation</h4>
              <p>Quarterly calculations</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon"><Shield size={22} /></div>
            <div>
              <h4>Secure Data</h4>
              <p>End-to-end encrypted</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon"><User size={22} /></div>
            <div>
              <h4>Multi-Currency</h4>
              <p>Global freelancing</p>
            </div>
          </div>

       </div>

        <h2 className="journey-title">Start your financial journey</h2>
        <p className="journey-desc">
          Join thousands of freelancers who trust TaxPal for their financial management.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="signup-right">
      <div className="form-header">
            <div className="logo">T</div>
            <h2>Create your account</h2>
            <p className="subtext">
              Start managing your freelance finances
            </p>
          </div>
        <div className="glass-card">
          

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-box">
              <User size={18} />
              <input type="text" placeholder="Alex Morgan" />
            </div>
          </div>

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

          <div className="form-group">
            <label>Country</label>
            <CustomDropdown
              placeholder="Select country"
              options={["India", "USA", "UK"]}
              icon={<Globe size={18} />}
            />
          </div>


          <div className="form-group">
            <label>Income Bracket</label>
            <CustomDropdown
              placeholder="Select bracket"
              options={["Low", "Middle", "High"]}
              icon={<DollarSign size={18} />}
            />
          </div>


          <button className="create-btn">
            Create Account →
          </button>

          <p className="signin-link">
            Already have an account?{" "}
            <Link to="/login" className="signin-text">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
