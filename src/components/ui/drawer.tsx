import * as React from "react"
import { cn } from "@/lib/utils"

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("drawer", className)} {...props}>
        {children}
      </div>
    )
  }
)
Drawer.displayName = "Drawer"

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("drawer-content", className)} {...props}>
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

const DrawerSide = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("drawer-side", className)} {...props}>
        {children}
      </div>
    )
  }
)
DrawerSide.displayName = "DrawerSide"

const DrawerOverlay = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("drawer-overlay", className)} {...props}>
        {children}
      </div>
    )
  }
)
DrawerOverlay.displayName = "DrawerOverlay"

export { Drawer, DrawerContent, DrawerSide, DrawerOverlay }
