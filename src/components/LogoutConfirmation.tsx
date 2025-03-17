
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from 'lucide-react';

interface LogoutConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

const LogoutConfirmation = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isLoggingOut 
}: LogoutConfirmationProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center mt-4">Sign out from MedSync?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            {isLoggingOut ? "Signing out..." : "Yes, sign out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmation;
