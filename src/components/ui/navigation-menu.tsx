import * as React from "react"
import { cn } from "@/lib/utils"

export interface NavigationMenuItem {
  label: string
  href?: string
  onClick?: () => void
  children?: NavigationMenuItem[]
}

export interface NavigationMenuProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: NavigationMenuItem[]
  className?: string
}

const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("navbar bg-base-100", className)} {...props}>
        <div className="navbar-start">
          {items.map((item, index) => (
            <div key={index} className="dropdown dropdown-hover">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                {item.href ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <button onClick={item.onClick}>{item.label}</button>
                )}
              </div>
              {item.children && (
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      {child.href ? (
                        <a href={child.href}>{child.label}</a>
                      ) : (
                        <button onClick={child.onClick}>{child.label}</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
NavigationMenu.displayName = "NavigationMenu"

export { NavigationMenu }
