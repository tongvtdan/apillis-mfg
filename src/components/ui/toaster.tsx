import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToasterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
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
Toaster.displayName = "Toaster"

export { Toaster }
