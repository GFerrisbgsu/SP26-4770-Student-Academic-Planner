/**
 * RegisterPasskeyDialog - Modal for registering a new passkey
 */

import { useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Alert } from '~/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getWebAuthnErrorMessage } from '~/utils/webauthn';

interface RegisterPasskeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onRegister: (name: string) => Promise<void>;
}

export function RegisterPasskeyDialog({
  open,
  onOpenChange,
  onSuccess,
  onRegister,
}: RegisterPasskeyDialogProps) {
  const [passkeyName, setPasskeyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    // Validate input
    if (!passkeyName.trim()) {
      setError('Please enter a name for your passkey');
      return;
    }

    setError(null);
    setIsRegistering(true);

    try {
      await onRegister(passkeyName.trim());
      
      // Success - close dialog and notify parent
      setPasskeyName('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const errorMessage = getWebAuthnErrorMessage(err);
      setError(errorMessage);
      console.error('[RegisterPasskeyDialog] Registration error:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClose = () => {
    if (!isRegistering) {
      setPasskeyName('');
      setError(null);
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRegistering) {
      handleRegister();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Register New Passkey</DialogTitle>
              <DialogDescription>
                Create a passkey to sign in without a password
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <p className="text-sm font-medium">Registration Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </Alert>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="passkey-name">Passkey Name</Label>
            <Input
              id="passkey-name"
              placeholder="e.g., My Laptop, iPhone Touch ID"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isRegistering}
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Give your passkey a recognizable name to identify this device
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
              <li>Your browser will prompt you to create a passkey</li>
              <li>Use Touch ID, Face ID, Windows Hello, or your device PIN</li>
              <li>Your passkey stays on your device and is never shared</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRegistering}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            disabled={isRegistering || !passkeyName.trim()}
          >
            {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRegistering ? 'Registering...' : 'Register Passkey'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
