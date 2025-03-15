
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(value) => {
        if (value) onValueChange(value);
      }}
      className={cn(
        "inline-flex border rounded-full p-1 bg-white dark:bg-neutral-800",
        className
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1 text-sm data-[state=on]:bg-primary data-[state=on]:text-white transition-all"
          )}
          aria-label={option.label}
        >
          {option.icon}
          <span>{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
