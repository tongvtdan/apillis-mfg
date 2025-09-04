import * as React from "react"
import { cn } from "@/lib/utils"

export interface EnhancedListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  status?: "success" | "error" | "warning" | "info" | "pending" | "active" | "inactive"
  actions?: React.ReactNode
  children?: React.ReactNode
}

const EnhancedListItem = React.forwardRef<HTMLDivElement, EnhancedListItemProps>(
  ({ className, title, subtitle, description, status, actions, children, ...props }, ref) => {
    const getStatusClass = () => {
      switch (status) {
        case "success":
          return "border-l-4 border-l-success"
        case "error":
          return "border-l-4 border-l-error"
        case "warning":
          return "border-l-4 border-l-warning"
        case "info":
          return "border-l-4 border-l-info"
        case "pending":
          return "border-l-4 border-l-warning"
        case "active":
          return "border-l-4 border-l-success"
        case "inactive":
          return "border-l-4 border-l-neutral"
        default:
          return ""
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200",
          getStatusClass(),
          className
        )}
        {...props}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="card-title text-base">{title}</h3>
              {subtitle && (
                <p className="text-sm text-base-content/70">{subtitle}</p>
              )}
              {description && (
                <p className="text-sm text-base-content/60 mt-1">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }
)
EnhancedListItem.displayName = "EnhancedListItem"

export { EnhancedListItem }