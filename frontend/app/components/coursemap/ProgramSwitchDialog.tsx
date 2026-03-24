import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import type { ProgramDTO } from '~/types/program';

interface ProgramSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProgram: ProgramDTO;
  onConfirm: () => void;
}

export function ProgramSwitchDialog({
  open,
  onOpenChange,
  targetProgram,
  onConfirm,
}: ProgramSwitchDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch to {targetProgram.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Switching programs will <strong>delete all your current enrollments and
            progress</strong>. Your semester will be reset to Fall 1. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Switch Program
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
