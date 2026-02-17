import { User, Mail, Lock, Globe, PieChart, LucideFolderLock, Shield, DollarSign } from "lucide-react";
import "../../styles/signup.css";
import CustomDropdown from "../../components/ui/CustomDropdown";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { authAPI } from "../../services/api";


const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateUser, setIsAuthenticated } = useUser();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!fullName || !email || !password || !country) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      let currency = "$";
      if (country === "India") currency = "₹";
      else if (country === "UK") currency = "£";

      // Register user with backend
      const result = await authAPI.register(fullName, email, password);
      
      // Update user context with additional info
      updateUser({ name: fullName, email, country, currency, incomeBracket });
      setIsAuthenticated(true);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">


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

          <form onSubmit={handleSignup}>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}
            
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-box">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

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

            <div className="form-group">
              <label style={{ color: '#000000' }}>Country</label>
              <CustomDropdown
                placeholder="Select country" style={{ color: '#000000' }}
                options={["India", "USA", "UK"]}
                icon={<Globe size={18} />}
                onSelect={setCountry}
              />
            </div>


            <div className="form-group">
              <label>Income Bracket</label>
              <CustomDropdown
                placeholder="Select bracket"
                options={["Low", "Middle", "High"]}
                icon={<DollarSign size={18} />}
                onSelect={setIncomeBracket}
              />
            </div>


            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

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
