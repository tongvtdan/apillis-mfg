import * as React from "react"
import { cn } from "@/lib/utils"

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("dropdown", className)} {...props}>
        {children}
      </div>
    )
  }
)
Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} tabIndex={0} role="button" className={cn("m-1", className)} {...props}>
        {children}
      </div>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <ul ref={ref} tabIndex={0} className={cn("dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52", className)} {...props}>
        {children}
      </ul>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
