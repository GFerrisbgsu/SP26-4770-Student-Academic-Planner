/**
 * PasskeyCard - Display individual passkey with delete action
 */

import { Trash2, KeyRound } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import type { PasskeyDTO } from '~/types/passkey';

interface PasskeyCardProps {
  passkey: PasskeyDTO;
  onDelete: (id: number) => void;
}

export function PasskeyCard({ passkey, onDelete }: PasskeyCardProps) {
  // Format creation date
  const createdDate = new Date(passkey.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="group relative p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {passkey.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Created: {createdDate}
          </p>
        </div>

        {/* Delete button - shows on hover */}
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          onClick={() => onDelete(passkey.id)}
          aria-label={`Delete ${passkey.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
