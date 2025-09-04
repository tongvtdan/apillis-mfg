import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Factory, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { DaisyUIThemeToggle } from '@/components/ui/daisyui-theme-toggle';

export default function Auth() {
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  // Form states
  const [signInData, setSignInData] = useState({
    domain: '',
    username: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState({
    domain: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const from = location.state?.from?.pathname || '/dashboard';

  if (user && !loading) {
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Check if username contains @ (full email)
    const isFullEmail = signInData.username.includes('@');

    if (!signInData.username || !signInData.password) {
      setErrors(['Please enter username/email and password']);
      return;
    }

    // Domain is only required if username is not a full email
    if (!isFullEmail && !signInData.domain) {
      setErrors(['Please enter domain when using username only']);
      return;
    }

    setIsLoading(true);
    try {
      // Check if username already contains @ (full email)
      let email;
      if (isFullEmail) {
        // Username is already a full email address
        email = signInData.username;
      } else {
        // Construct email from username and domain
        email = `${signInData.username}@${signInData.domain}`;
      }

      console.log('Attempting sign in with email:', email);
      await signIn(email, signInData.password);
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors(['Invalid credentials']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!signUpData.domain || !signUpData.username || !signUpData.email || !signUpData.password || !signUpData.displayName) {
      setErrors(['Please fill in all fields']);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.displayName);
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors(['Failed to create account']);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4">
        <DaisyUIThemeToggle variant="icon" size="lg" />
      </div>

      <div className="auth-container mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Factory className="auth-logo" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Apillis Manufacturing Portal</h1>
          <p className="text-base-content/70 mt-2">Complete Manufacturing Operations Platform</p>
        </div>

        {/* Authentication Card */}
        <div className="auth-card card">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-base-content">Authentication</h2>
            <p className="text-base-content/70 mb-6">Sign in to your account or create a new one</p>

            {errors.length > 0 && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <ul className="list-disc pl-4 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div role="tablist" className="tabs tabs-lift mb-6">
              <a
                role="tab"
                className={`tab flex-1 ${activeTab === 'signin' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('signin')}
                aria-selected={activeTab === 'signin'}
              >
                Sign In
              </a>
              <a
                role="tab"
                className={`tab flex-1 ${activeTab === 'signup' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('signup')}
                aria-selected={activeTab === 'signup'}
              >
                Sign Up
              </a>
            </div>

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Username or Email</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username (e.g., senior.engineer) or full email"
                    className="input input-bordered w-full"
                    value={signInData.username}
                    onChange={(e) => setSignInData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                {!signInData.username.includes('@') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content">Domain</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your domain (e.g., factorypulse.vn)"
                      className="input input-bordered w-full"
                      value={signInData.domain}
                      onChange={(e) => setSignInData(prev => ({ ...prev, domain: e.target.value }))}
                      required={!signInData.username.includes('@')}
                    />
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="input input-bordered w-full pr-10"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="label-text text-base-content">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-button btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </button>

                <div className="text-center">
                  <button type="button" className="link link-primary">
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Domain</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your domain (e.g., factorypulse.vn)"
                    className="input input-bordered w-full"
                    value={signUpData.domain}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, domain: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="input input-bordered w-full"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Display Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="input input-bordered w-full"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input input-bordered w-full"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="input input-bordered w-full"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}