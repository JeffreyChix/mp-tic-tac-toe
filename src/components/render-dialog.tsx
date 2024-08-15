import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RenderDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
  hideCloseBtn?: boolean;
}

export function RenderDialog({
  children,
  trigger,
  hideCloseBtn,
  ...otherProps
}: RenderDialogProps) {
  return (
    <Dialog {...otherProps}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent hideCloseBtn={hideCloseBtn}>
        <DialogTitle className="sr-only">Dialog title</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
