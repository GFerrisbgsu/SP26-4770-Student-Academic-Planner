/**
 * PasskeyManagement - Container component for managing passkeys
 * Displays list of passkeys and handles registration/deletion
 */

import { useEffect, useState } from 'react';
import { Plus, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Alert } from '~/components/ui/alert';
import { Skeleton } from '~/components/ui/skeleton';
import { PasskeyCard } from '~/components/PasskeyCard';
import { RegisterPasskeyDialog } from '~/components/RegisterPasskeyDialog';
import { DeletePasskeyDialog } from '~/components/DeletePasskeyDialog';
import { useAuth } from '~/context/AuthContext';
import { isWebAuthnSupported } from '~/utils/webauthn';
import type { PasskeyDTO } from '~/types/passkey';

export function PasskeyManagement() {
  const { registerPasskey, listUserPasskeys, deleteUserPasskey } = useAuth();
  
  const [passkeys, setPasskeys] = useState<PasskeyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Registration dialog state
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  
  // Delete dialog state
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    passkey: PasskeyDTO | null;
    isDeleting: boolean;
  }>({
    open: false,
    passkey: null,
    isDeleting: false,
  });

  // Check browser support
  const webAuthnSupported = isWebAuthnSupported();

  // Fetch passkeys on mount
  useEffect(() => {
    fetchPasskeys();
  }, []);

  const fetchPasskeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const passkeysData = await listUserPasskeys();
      setPasskeys(passkeysData);
    } catch (err) {
      console.error('[PasskeyManagement] Error fetching passkeys:', err);
      setError('Failed to load passkeys. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    toast.success('Passkey registered successfully!');
    fetchPasskeys(); // Refresh the list
  };

  const handleDeleteClick = (passkeyId: number) => {
    const passkey = passkeys.find((p) => p.id === passkeyId);
    if (!passkey) return;
    
    setDeleteDialogState({
      open: true,
      passkey,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogState.passkey) return;

    setDeleteDialogState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteUserPasskey(deleteDialogState.passkey.id);
      
      toast.success('Passkey deleted');
      
      // Close dialog and refresh list
      setDeleteDialogState({ open: false, passkey: null, isDeleting: false });
      fetchPasskeys();
    } catch (err) {
      console.error('[PasskeyManagement] Error deleting passkey:', err);
      toast.error('Failed to delete passkey');
      setDeleteDialogState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteDialogState.isDeleting) {
      setDeleteDialogState({ open: false, passkey: null, isDeleting: false });
    }
  };

  // If WebAuthn not supported, show warning
  if (!webAuthnSupported) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Passkeys
          </h2>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            <p className="text-sm font-medium">Browser Not Supported</p>
            <p className="text-sm">
              Your browser does not support passkeys. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Passkeys
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Passwordless login using your device's biometrics or PIN
          </p>
        </div>
        
        <Button
          onClick={() => setRegisterDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register New Passkey
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && passkeys.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Passkeys Registered
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Register a passkey to enable faster, more secure sign-ins
          </p>
          <Button onClick={() => setRegisterDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Register Your First Passkey
          </Button>
        </div>
      )}

      {/* Passkey List */}
      {!isLoading && !error && passkeys.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Passkeys ({passkeys.length})
          </h3>
          {passkeys.map((passkey) => (
            <PasskeyCard
              key={passkey.id}
              passkey={passkey}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Register Dialog */}
      <RegisterPasskeyDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onSuccess={handleRegisterSuccess}
        onRegister={registerPasskey}
      />

      {/* Delete Dialog */}
      <DeletePasskeyDialog
        open={deleteDialogState.open}
        onOpenChange={handleDeleteCancel}
        passkeyName={deleteDialogState.passkey?.name || ''}
        isDeleting={deleteDialogState.isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
