import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { isWebAuthnSupported, getWebAuthnErrorMessage } from '~/utils/webauthn';
import { ForgotPasswordModal } from '~/components/ForgotPasswordModal';
import type { LoginRequest } from '~/types/user';

interface LoginFormProps {
  /**
   * Optional callback when login is successful
   * Useful if parent component wants to handle post-login logic
   */
  onLoginSuccess?: () => void;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

export function LoginForm({ onLoginSuccess, className = '' }: LoginFormProps) {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();
  const { login, loginWithPasskey } = useAuth();
  const webAuthnSupported = isWebAuthnSupported();

  /**
   * Handle form submission
   * Attempts to login with provided credentials
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!username.trim()) {
        throw new Error('Username is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      // Prepare login request
      const loginRequest: LoginRequest = {
        username: username.trim(),
        password,
        rememberMe,
      };

      // Call login service
      await login(loginRequest);

      // Clear form on success
      setUsername('');
      setPassword('');

      // Call optional callback
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Default: navigate to home page
        navigate('/');
      }

      console.log('Login successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle passkey (passwordless) login
   * Triggers browser WebAuthn prompt
   */
  const handlePasskeyLogin = async () => {
    if (!webAuthnSupported) {
      toast.error('Browser Not Supported', {
        description: 'Your browser does not support passkeys. Please use a modern browser.',
      });
      return;
    }

    setError(null);
    setIsPasskeyLoading(true);

    try {
      await loginWithPasskey();

      // Success - navigate
      toast.success('Signed in with passkey!');
      
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/');
      }

      console.log('Passkey login successful');
    } catch (err) {
      const errorMessage = getWebAuthnErrorMessage(err);
      setError(errorMessage);
      console.error('Passkey login error:', err);
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full space-y-6 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Login Failed</p>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
        </div>
      )}

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
          className="h-10"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          className="h-10"
        />
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
        <Label 
          htmlFor="rememberMe" 
          className="text-sm font-normal cursor-pointer select-none"
        >
          <span className="font-medium">Remember me for 30 days</span>
          <span className="block text-xs text-muted-foreground">
            Keep me logged in on this device
          </span>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || isPasskeyLoading}
        className="w-full h-10 text-base font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>

      {/* Divider */}
      {webAuthnSupported && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
      )}

      {/* Passkey Login Button */}
      {webAuthnSupported && (
        <Button
          type="button"
          variant="outline"
          disabled={isLoading || isPasskeyLoading}
          onClick={handlePasskeyLogin}
          className="w-full h-10 text-base font-medium"
        >
          {isPasskeyLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Sign in with Passkey
            </>
          )}
        </Button>
      )}

      {/* Sign Up Link */}
      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </button>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </form>
  );
}
