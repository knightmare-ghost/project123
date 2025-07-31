import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  continueText?: string;
  discardText?: string;
}

export function ConfirmCloseDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Unsaved Changes",
  description = "You have unsaved changes. Are you sure you want to close this dialog? All your changes will be lost.",
  continueText = "Continue Editing",
  discardText = "Discard Changes"
}: ConfirmCloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {continueText}
          </Button>
          <Button 
            type="button" 
            className="bg-red-600 text-white" 
            onClick={onConfirm}
          >
            {discardText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to handle dialog close with confirmation
 * @param hasUnsavedChanges Function that returns true if there are unsaved changes
 * @param setIsDialogOpen Function to set the dialog open state
 * @param setIsConfirmCloseDialogOpen Function to set the confirm close dialog open state
 * @returns A function to handle onOpenChange event for the Dialog component
 */
export function handleDialogClose(
  hasUnsavedChanges: () => boolean,
  setIsDialogOpen: (open: boolean) => void,
  setIsConfirmCloseDialogOpen: (open: boolean) => void
) {
  return (open: boolean) => {
    if (!open && hasUnsavedChanges()) {
      // If trying to close the dialog with unsaved data, show confirmation first
      setIsConfirmCloseDialogOpen(true);
    } else {
      setIsDialogOpen(open);
    }
  };
}