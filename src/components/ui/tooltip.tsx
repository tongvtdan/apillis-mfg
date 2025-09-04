import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  position?: "top" | "bottom" | "left" | "right"
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, children, content, position = "top", ...props }, ref) => {
    const positionClasses = {
      top: "tooltip-top",
      bottom: "tooltip-bottom",
      left: "tooltip-left",
      right: "tooltip-right"
    }

    return (
      <div
        ref={ref}
        className={cn("tooltip", positionClasses[position], className)}
        data-tip={typeof content === "string" ? content : undefined}
        {...props}
      >
        {children}
        {typeof content !== "string" && (
          <div className="tooltip-content">
            {content}
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("tooltip-trigger", className)} {...props}>
        {children}
      </div>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("tooltip-content", className)} {...props}>
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

const TooltipProvider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    )
  }
)
TooltipProvider.displayName = "TooltipProvider"

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent }
