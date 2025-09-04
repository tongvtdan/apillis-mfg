import * as React from "react"
import { cn } from "@/lib/utils"

export interface MenubarItem {
  label: string
  items: Array<{
    label: string
    onClick?: () => void
    disabled?: boolean
    separator?: boolean
  }>
}

export interface MenubarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: MenubarItem[]
  className?: string
}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("navbar bg-base-100", className)} {...props}>
        <div className="navbar-start">
          <div className="dropdown">
            {items.map((item, index) => (
              <div key={index} className="dropdown dropdown-hover">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                  {item.label}
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      {subItem.separator ? (
                        <div className="divider my-1" />
                      ) : (
                        <button
                          onClick={subItem.onClick}
                          disabled={subItem.disabled}
                          className={cn(
                            "w-full text-left",
                            subItem.disabled && "disabled"
                          )}
                        >
                          {subItem.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
Menubar.displayName = "Menubar"

export { Menubar }
