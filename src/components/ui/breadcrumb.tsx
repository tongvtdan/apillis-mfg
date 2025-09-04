import * as React from "react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, items, separator = "/", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("text-sm breadcrumbs", className)} {...props}>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item.href ? (
                <a href={item.href} className="hover:text-primary">
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button onClick={item.onClick} className="hover:text-primary">
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
