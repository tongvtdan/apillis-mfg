import * as React from "react"
import { cn } from "@/lib/utils"

export interface AspectRatioProps
  extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
  children: React.ReactNode
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 16 / 9, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        style={{
          aspectRatio: ratio
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
