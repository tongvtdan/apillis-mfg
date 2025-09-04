import * as React from "react"
import { cn } from "@/lib/utils"

export interface SonnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Sonner = React.forwardRef<HTMLDivElement, SonnerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("fixed top-4 right-4 z-50 flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sonner.displayName = "Sonner"

export { Sonner }