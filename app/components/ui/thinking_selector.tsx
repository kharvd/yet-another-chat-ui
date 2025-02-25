import { CaretSortIcon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ThinkingLevel } from "~/hooks/use_model";

const thinkingLevels: { value: ThinkingLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ThinkingSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: ThinkingLevel;
  onChange: (value: ThinkingLevel) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu open={disabled ? false : open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[100px] justify-between overflow-hidden"
          disabled={disabled}
        >
          {thinkingLevels.find((level) => level.value === value)?.label ||
            "Thinking level"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Thinking Level</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(value) => onChange(value as ThinkingLevel)}
        >
          {thinkingLevels.map((level) => (
            <DropdownMenuRadioItem key={level.value} value={level.value}>
              {level.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
