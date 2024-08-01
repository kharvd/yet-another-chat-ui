import { Pencil2Icon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export const ClearButton = ({
  clearMessages,
  className,
}: {
  clearMessages: () => void;
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-10 h-10", className)}
            onClick={clearMessages}
          >
            <Pencil2Icon className="h-6 w-6 opacity-50" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
