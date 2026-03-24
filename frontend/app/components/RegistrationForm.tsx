import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import type { CreateUserRequest } from '~/types/user';

interface RegistrationFormProps {
  /**
   * Optional callback when registration is successful
   * Useful if parent component wants to handle post-registration logic
   */
  onRegistrationSuccess?: () => void;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegistrationForm({ onRegistrationSuccess, className = '' }: RegistrationFormProps) {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const navigate = useNavigate();
  const { register } = useAuth();

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
  const isValidPassword = (password: string): boolean => {
    // At least 8 characters, contains at least one letter and one number
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  };

  /**
   * Validate individual fields and return validation errors
   */
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    // First name validation
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.trim().length < 1) {
      errors.firstName = 'First name must not be empty';
    } else if (firstName.trim().length > 100) {
      errors.firstName = 'First name must be no more than 100 characters long';
    }

    // Last name validation
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 1) {
      errors.lastName = 'Last name must not be empty';
    } else if (lastName.trim().length > 100) {
      errors.lastName = 'Last name must be no more than 100 characters long';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (username.trim().length > 50) {
      errors.username = 'Username must be no more than 50 characters long';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errors.password = 'Password must be at least 8 characters long and contain both letters and numbers';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  /**
   * Handle form submission
   * Creates new user account and automatically logs them in
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration request
      const registrationRequest: CreateUserRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      };

      // Register user (creates account and automatically logs them in)
      await register(registrationRequest);

      // Clear form on success
      setFirstName('');
      setLastName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      // Call optional callback
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      } else {
        // Redirect to email verification page
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }

      console.log('Registration successful');
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        // Use the actual error message from backend (most informative)
        errorMessage = err.message;
        
        // Clean up the error message if it's too technical
        if (errorMessage.includes('Failed to send email')) {
          // Extract the Resend error if present
          const resendMatch = errorMessage.match(/"message":"([^"]+)"/);
          if (resendMatch) {
            errorMessage = resendMatch[1];
          }
        }
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real-time validation for fields as user types
   */
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    const errors = validateForm();
    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field]
    }));
  };

  /**
   * Get password strength indicator
   */
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-zA-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    if (password.length >= 12) strength += 1;

    const strengthMap = {
      0: { text: 'Very Weak', color: 'text-red-600' },
      1: { text: 'Weak', color: 'text-red-500' },
      2: { text: 'Fair', color: 'text-yellow-500' },
      3: { text: 'Good', color: 'text-blue-500' },
      4: { text: 'Strong', color: 'text-green-500' },
      5: { text: 'Very Strong', color: 'text-green-600' },
    };

    return { strength, ...strengthMap[Math.min(strength, 5) as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit} className={`w-full space-y-6 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Registration Failed</p>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
        </div>
      )}

      {/* First Name and Last Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => handleFieldBlur('firstName')}
            disabled={isLoading}
            autoComplete="given-name"
            className={`h-10 ${validationErrors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {validationErrors.firstName && (
            <p className="text-sm text-destructive">{validationErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => handleFieldBlur('lastName')}
            disabled={isLoading}
            autoComplete="family-name"
            className={`h-10 ${validationErrors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {validationErrors.lastName && (
            <p className="text-sm text-destructive">{validationErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          disabled={isLoading}
          autoComplete="email"
          className={`h-10 ${validationErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {validationErrors.email && (
          <p className="text-sm text-destructive">{validationErrors.email}</p>
        )}
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => handleFieldBlur('username')}
          disabled={isLoading}
          autoComplete="username"
          className={`h-10 ${validationErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {validationErrors.username && (
          <p className="text-sm text-destructive">{validationErrors.username}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-50 characters. Letters, numbers, hyphens, and underscores only.
        </p>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a secure password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleFieldBlur('password')}
          disabled={isLoading}
          autoComplete="new-password"
          className={`h-10 ${validationErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {validationErrors.password && (
          <p className="text-sm text-destructive">{validationErrors.password}</p>
        )}
        {/* Password strength indicator */}
        {password && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-secondary rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  passwordStrength.strength >= 3 ? 'bg-green-500' : 
                  passwordStrength.strength >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
              />
            </div>
            <span className={passwordStrength.color}>
              {passwordStrength.text}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          At least 8 characters with letters and numbers
        </p>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleFieldBlur('confirmPassword')}
          disabled={isLoading}
          autoComplete="new-password"
          className={`h-10 ${validationErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {validationErrors.confirmPassword && (
          <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
        )}
        {/* Password match indicator */}
        {confirmPassword && password && (
          <div className="flex items-center gap-2 text-xs">
            {password === confirmPassword ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 text-base font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </form>
  );
}