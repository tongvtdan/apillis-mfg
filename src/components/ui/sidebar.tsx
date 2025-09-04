import * as React from "react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
  children?: SidebarItem[]
}

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[]
  className?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("drawer-side", className)} {...props}>
        <aside className="min-h-screen w-80 bg-base-200 text-base-content">
          <div className="p-4">
            <ul className="menu menu-lg">
              {items.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    <a href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </a>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="flex items-center gap-2 w-full text-left"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  )}
                  {item.children && (
                    <ul className="menu menu-compact">
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          {child.href ? (
                            <a href={child.href} className="flex items-center gap-2">
                              {child.icon}
                              {child.label}
                            </a>
                          ) : (
                            <button
                              onClick={child.onClick}
                              className="flex items-center gap-2 w-full text-left"
                            >
                              {child.icon}
                              {child.label}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

export { Sidebar }
