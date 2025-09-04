import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        className={cn("btn", pressed ? "btn-primary" : "btn-outline", className)}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
