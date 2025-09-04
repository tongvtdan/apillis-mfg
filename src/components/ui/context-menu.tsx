import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContextMenuItem {
  label: string
  onClick?: () => void
  disabled?: boolean
  separator?: boolean
}

export interface ContextMenuProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  items: ContextMenuItem[]
  className?: string
}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ className, children, items, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault()
      setPosition({ x: e.clientX, y: e.clientY })
      setIsOpen(true)
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    React.useEffect(() => {
      if (isOpen) {
        const handleClickOutside = () => handleClose()
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
      }
    }, [isOpen])

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div onContextMenu={handleContextMenu}>
          {children}
        </div>
        {isOpen && (
          <div
            className="fixed z-50 bg-base-100 border border-base-300 rounded-box shadow-lg p-2 min-w-48"
            style={{
              left: position.x,
              top: position.y
            }}
          >
            <ul className="menu">
              {items.map((item, index) => (
                <li key={index}>
                  {item.separator ? (
                    <div className="divider my-1" />
                  ) : (
                    <button
                      onClick={() => {
                        item.onClick?.()
                        handleClose()
                      }}
                      disabled={item.disabled}
                      className={cn(
                        "w-full text-left",
                        item.disabled && "disabled"
                      )}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)
ContextMenu.displayName = "ContextMenu"

export { ContextMenu }
