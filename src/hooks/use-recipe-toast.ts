import { toast } from "sonner";

export function useRecipeToast() {
  const showUndoToast = (message: string, onUndo: () => Promise<void> | void) => {
    toast(message, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: async () => {
          await onUndo();
          toast.success("Action undone");
        },
      },
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  return { showUndoToast, showErrorToast, showSuccessToast };
}
