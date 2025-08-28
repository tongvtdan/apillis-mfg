import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Factory, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { validateLoginForm, validateRegistrationForm } from '@/lib/auth-validation';
import {
  extractDomain,
  buildEmail,
  saveDomain,
  getSavedDomain,
  saveUsername,
  getSavedUsername,
  saveRememberPassword,
  getRememberPassword,
  savePassword,
  getSavedPassword
} from '@/lib/auth-utils';

export default function Auth() {
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [signInData, setSignInData] = useState({
    username: '',
    domain: '',
    password: ''
  });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const from = location.state?.from?.pathname || '/dashboard';

  // Load saved authentication data on component mount
  useEffect(() => {
    const savedDomain = getSavedDomain();
    const savedUsername = getSavedUsername();
    const savedRememberPassword = getRememberPassword();
    const savedPassword = getSavedPassword();

    setSignInData(prev => ({
      ...prev,
      domain: savedDomain,
      username: savedUsername,
      password: savedPassword
    }));
    setRememberPassword(savedRememberPassword);
  }, []);

  // Handle domain input change with smart parsing
  const handleDomainChange = (value: string) => {
    let cleanDomain = value;

    // If user pastes a full email, extract the domain
    if (value.includes('@')) {
      cleanDomain = extractDomain(value);
    } else {
      // Remove http://, https://, www. prefixes if user types them
      cleanDomain = value.replace(/^(https?:\/\/)?(www\.)?/, '');
    }

    setSignInData(prev => ({ ...prev, domain: cleanDomain }));
  };

  // Handle username input change with smart parsing
  const handleUsernameChange = (value: string) => {
    let cleanUsername = value;

    // If user pastes a full email, extract the username
    if (value.includes('@')) {
      cleanUsername = value.split('@')[0];
    }

    setSignInData(prev => ({ ...prev, username: cleanUsername }));
  };

  // Get the full email for display
  const getFullEmail = () => {
    if (!signInData.username || !signInData.domain) return '';
    return buildEmail(signInData.username, signInData.domain);
  };

  if (user && !loading) {
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Build full email from username and domain
    const fullEmail = getFullEmail();

    if (!fullEmail) {
      setErrors(['Please enter both username and domain']);
      return;
    }

    // Validate form
    const validation = validateLoginForm({ email: fullEmail, password: signInData.password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Starting sign in process...');
      console.log('  Email:', fullEmail);
      console.log('  Remember password:', rememberPassword);

      await signIn(fullEmail, signInData.password);

      console.log('✅ Sign in successful, now saving preferences...');
      console.log('  Domain:', signInData.domain);
      console.log('  Username:', signInData.username);
      console.log('  Remember password:', rememberPassword);

      // Save authentication preferences on successful login
      if (signInData.domain) {
        saveDomain(signInData.domain);
        console.log('✅ Domain saved to localStorage');
      }
      if (signInData.username) {
        saveUsername(signInData.username);
        console.log('✅ Username saved to localStorage');
      }

      saveRememberPassword(rememberPassword);
      console.log('✅ Remember password preference saved:', rememberPassword);

      savePassword(signInData.password, rememberPassword);
      if (rememberPassword) {
        console.log('✅ Password saved to localStorage (remember me enabled)');
      } else {
        console.log('🗑️ Password not saved (remember me disabled)');
      }

    } catch (error) {
      console.error('❌ Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate form
    const validation = validateRegistrationForm(signUpData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.displayName);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-base-200/50 p-4">
      <div className="auth-container mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Factory className="auth-logo" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Apillis Manufacturing Portal</h1>
          <p className="text-muted-foreground mt-2">Complete Manufacturing Operations Platform</p>
        </div>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length > 0 && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="auth-tabs-list">
                <TabsTrigger value="signin" className="auth-tab-trigger">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="auth-tab-trigger">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-domain">Domain</Label>
                    <Input
                      id="signin-domain"
                      type="text"
                      placeholder="Enter your domain (e.g., factorypulse.vn)"
                      value={signInData.domain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="border-base-300 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      type="text"
                      placeholder="Enter your username"
                      value={signInData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="border-base-300 focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Show constructed email for verification */}
                  {getFullEmail() && (
                    <div className="p-3 bg-muted/50 rounded-md border">
                      <p className="text-sm text-muted-foreground">
                        Signing in as: <span className="font-medium text-foreground">{getFullEmail()}</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        className="border-base-300 focus:border-primary transition-colors pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-password"
                      checked={rememberPassword}
                      onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                    />
                    <Label htmlFor="remember-password" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>

                  <Button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      const email = prompt('Enter your email address:');
                      if (email) {
                        setResetEmail(email);
                        handleResetPassword({ preventDefault: () => { } } as React.FormEvent);
                      }
                    }}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.displayName}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signUpData.password}
                      onChange={(e) => {
                        const password = e.target.value;
                        setSignUpData(prev => ({ ...prev, password }));

                        // Update password strength indicator
                        let score = 0;
                        const feedback: string[] = [];

                        if (password.length >= 8) score += 1;
                        else feedback.push('At least 8 characters');

                        if (/[A-Z]/.test(password)) score += 1;
                        else feedback.push('One uppercase letter');

                        if (/[a-z]/.test(password)) score += 1;
                        else feedback.push('One lowercase letter');

                        if (/\d/.test(password)) score += 1;
                        else feedback.push('One number');

                        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
                        else feedback.push('One special character');

                        setPasswordStrength({ score, feedback });
                      }}
                      required
                    />

                    {/* Password Strength Indicator */}
                    {signUpData.password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${level <= passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength.score <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            Password strength: {
                              passwordStrength.score <= 2 ? 'Weak' :
                                passwordStrength.score <= 3 ? 'Fair' :
                                  passwordStrength.score <= 4 ? 'Good' : 'Strong'
                            }
                          </span>
                          {passwordStrength.feedback.length > 0 && (
                            <div className="mt-1">
                              Missing: {passwordStrength.feedback.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}