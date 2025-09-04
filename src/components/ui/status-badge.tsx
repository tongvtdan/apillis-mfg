import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status: "success" | "error" | "warning" | "info" | "pending" | "active" | "inactive"
  children: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    const getStatusClass = () => {
      switch (status) {
        case "success":
          return "badge badge-success"
        case "error":
          return "badge badge-error"
        case "warning":
          return "badge badge-warning"
        case "info":
          return "badge badge-info"
        case "pending":
          return "badge badge-warning"
        case "active":
          return "badge badge-success"
        case "inactive":
          return "badge badge-neutral"
        default:
          return "badge badge-neutral"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(getStatusClass(), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }