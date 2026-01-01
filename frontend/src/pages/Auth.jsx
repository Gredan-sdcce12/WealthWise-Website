import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  // Inline auth messaging for beginner-friendly UX
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Clear any previous messages when submitting
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      if (isLogin) {
        // SIGN IN: email/password via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Generic invalid credentials message
          setErrorMessage("Invalid email or password");
          return;
        }

        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        // SIGN UP: create account with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        // Supabase returns an error when the email is already registered.
        // In some cases (e.g., email confirmation pending), `error` can be null
        // but `data.user.identities` will be empty, which also indicates the user exists.
        const userExists = data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

        if (error || userExists) {
          const msg = (error?.message || "").toLowerCase();
          const isAlreadyRegistered = msg.includes("already registered") || error?.status === 400 || userExists;

          if (isAlreadyRegistered) {
            // Strict duplicate handling: do not register again; stay on Sign Up and show error
            setErrorMessage("This email is already registered. Please Sign in instead.");
            return;
          }

          setErrorMessage(error?.message || "Sign up failed");
          return;
        }

        // Success: account created; guide user to verify email before sign-in
        setSuccessMessage(
          "Account created successfully! Please check your email and confirm your sign-up before logging in."
        );
        // Keep user on sign-up view; they can switch to Sign In after confirming
      }
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleAuth = async () => {
    // Prevent concurrent flows
    if (isOAuthLoading || isLoading) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Google sign-in failed");
      }
      // On success, Supabase will handle the redirect
    } catch (err) {
      setErrorMessage("Google sign-in failed. Please try again.");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear messages when switching modes
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-emerald relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-primary-foreground">WealthWise</span>
            </div>
            
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight max-w-md">
              Take Control of Your Financial Future
            </h1>
            
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Join thousands of users who trust WealthWise to manage their finances, 
              track expenses, and achieve their financial goals.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {["SC", "MJ", "ER", "AK"].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center text-primary-foreground text-sm font-medium border-2 border-primary-foreground/30"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Join 50,000+ users managing their wealth
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-muted-foreground mb-8 hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">WealthWise</span>
          </div>

          <Card variant="flat" className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-1 px-0">
              <CardTitle className="text-3xl font-bold">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription className="text-base">
                {isLogin 
                  ? "Enter your credentials to access your account" 
                  : "Enter your details to get started with WealthWise"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10"
                        variant="emerald"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      variant="emerald"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      variant="emerald"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        variant="emerald"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-end">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                {isLogin && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary/80" />
                    Your data is securely encrypted
                  </p>
                )}

                {/* Inline auth feedback */}
                {errorMessage && (
                  <p className="text-sm text-red-600" role="alert">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600" role="status">{successMessage}</p>
                )}

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading
                    ? isLogin
                      ? "Signing in..."
                      : "Creating account..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleGoogleAuth}
                  disabled={isOAuthLoading || isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isOAuthLoading ? "Connecting..." : "Continue with Google"}
                </Button>
              </form>

              <p className="text-center text-muted-foreground mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}