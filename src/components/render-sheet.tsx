import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface RenderSheetProps {
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function RenderSheet({
  trigger,
  children,
  ...otherProps
}: RenderSheetProps) {
  return (
    <Sheet {...otherProps}>
      {trigger && <SheetTrigger>{trigger}</SheetTrigger>}
      <SheetContent>{children}</SheetContent>
    </Sheet>
  );
}
