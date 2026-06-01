import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const location = useLocation();
  const prefilledEmail =
    typeof location.state === "object" &&
    location.state !== null &&
    "email" in location.state &&
    typeof (location.state as { email?: string }).email === "string"
      ? (location.state as { email: string }).email
      : "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-card-foreground">TaxPal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>
                <p>{formError}</p>
                <p className="mt-2">
                  <Link
                    to="/forgot-password"
                    state={{ email: email.trim().toLowerCase() }}
                    className="font-medium underline underline-offset-4"
                  >
                    Reset your password
                  </Link>
                  {" or "}
                  <Link to="/signup" className="font-medium underline underline-offset-4">
                    create a new account
                  </Link>
                  .
                </p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-3 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2025 TaxPal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
