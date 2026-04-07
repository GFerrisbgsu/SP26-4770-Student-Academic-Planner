import { useState } from 'react';
import { Shield, KeyRound, Smartphone, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

interface PrivacySecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacySecurityModal({ open, onOpenChange }: PrivacySecurityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Privacy & Security
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Active Sessions */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                <p className="text-xs text-gray-500">You are currently logged in on this device</p>
              </div>
            </div>
            <div className="ml-8 mt-2 px-3 py-2 bg-green-50 rounded border border-green-200 text-xs text-green-700">
              Current session — active
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add extra security to your account</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">Coming Soon</span>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Data & Privacy</p>
                <p className="text-xs text-gray-500">Your data is stored securely and never shared with third parties</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
