import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

const HoverCard = React.forwardRef<HTMLDivElement, HoverCardProps>(
  ({ className, trigger, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("dropdown dropdown-hover", className)} {...props}>
        <div tabIndex={0} role="button" className="m-1">
          {trigger}
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          {children}
        </ul>
      </div>
    )
  }
)
HoverCard.displayName = "HoverCard"

export { HoverCard }
