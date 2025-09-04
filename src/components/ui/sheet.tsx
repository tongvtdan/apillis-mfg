import * as React from "react"
import { cn } from "@/lib/utils"

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, isOpen = false, onClose, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("modal", isOpen && "modal-open", className)} {...props}>
        {children}
      </div>
    )
  }
)
Sheet.displayName = "Sheet"

const SheetContent = React.forwardRef<HTMLDivElement, SheetProps & { side?: "left" | "right" | "top" | "bottom" }>(
  ({ className, children, side = "right", ...props }, ref) => {
    const sideClasses = {
      left: "modal-left",
      right: "modal-right",
      top: "modal-top",
      bottom: "modal-bottom"
    }

    return (
      <div ref={ref} className={cn("modal-box", sideClasses[side], className)} {...props}>
        {children}
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetOverlay = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("modal-backdrop", className)} {...props}>
        {children}
      </div>
    )
  }
)
SheetOverlay.displayName = "SheetOverlay"

const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn("btn", className)} {...props}>
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

export { Sheet, SheetContent, SheetTrigger, SheetOverlay }

