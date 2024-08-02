import { Button } from "./button";

export function FloatingButton({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}) {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
      <Button
        onClick={onClick}
        variant={variant}
        className="shadow-md hover:shadow-lg transition-shadow"
      >
        {children}
      </Button>
    </div>
  );
}
