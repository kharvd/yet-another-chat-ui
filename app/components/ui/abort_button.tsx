import { Button } from "./button";

export function AbortButton({ onAbort }: { onAbort: () => void }) {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
      <Button
        onClick={onAbort}
        className="shadow-md hover:shadow-lg transition-shadow"
      >
        Stop
      </Button>
    </div>
  );
}
