import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("progress", className)}
      {...props}
    >
      <div 
        className="progress-bar" 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
