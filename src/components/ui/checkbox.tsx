import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="label cursor-pointer">
        {label && <span className="label-text">{label}</span>}
        <input
          type="checkbox"
          className={cn("checkbox checkbox-primary", className)}
          ref={ref}
          {...props}
        />
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
