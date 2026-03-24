import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate email
      if (!email.trim()) {
        throw new Error('Email is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call password reset API
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setSuccess(true);
      console.log('Password reset email sent to:', email);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setEmail('');
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reset Password</DialogTitle>
          <DialogDescription>
            {success
              ? 'Check your email for reset instructions'
              : 'Enter your email address and we\'ll send you a link to reset your password'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          // Success state
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900">Email Sent!</p>
                <p className="text-sm text-green-800">
                  If an account exists with <strong>{email}</strong>, you will receive a password
                  reset link shortly.
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Don't see the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-10 pl-9"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send a password reset link to this email address
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
