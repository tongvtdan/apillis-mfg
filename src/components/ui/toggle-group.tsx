import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  options: Array<{ value: string; label: string }>
  value?: string
  onValueChange?: (value: string) => void
  type?: "single" | "multiple"
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, options, value, onValueChange, type = "single", ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value)

    const handleToggle = (optionValue: string) => {
      if (type === "single") {
        const newValue = selectedValue === optionValue ? undefined : optionValue
        setSelectedValue(newValue)
        onValueChange?.(newValue || "")
      } else {
        // Multiple selection logic would go here
        const newValue = optionValue
        setSelectedValue(newValue)
        onValueChange?.(newValue)
      }
    }

    return (
      <div ref={ref} className={cn("btn-group", className)} {...props}>
        {options.map((option) => (
          <button
            key={option.value}
            className={cn("btn", selectedValue === option.value && "btn-active")}
            onClick={() => handleToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

export { ToggleGroup }
