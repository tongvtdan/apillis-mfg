import * as React from "react"
import { cn } from "@/lib/utils"

export interface ResizableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
  minSize?: number
  maxSize?: number
  defaultSize?: number
}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  ({ className, children, direction = "horizontal", minSize = 100, maxSize = 800, defaultSize = 200, ...props }, ref) => {
    const [size, setSize] = React.useState(defaultSize)
    const [isResizing, setIsResizing] = React.useState(false)

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsResizing(true)
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newSize = direction === "horizontal" 
        ? e.clientX 
        : e.clientY

      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    React.useEffect(() => {
      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isResizing])

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        style={{
          [direction === "horizontal" ? "width" : "height"]: `${size}px`
        }}
        {...props}
      >
        {children}
        <div
          className={cn(
            "absolute cursor-col-resize bg-base-300 hover:bg-primary",
            direction === "horizontal" ? "w-1 h-full right-0 top-0" : "h-1 w-full bottom-0 left-0"
          )}
          onMouseDown={handleMouseDown}
        />
      </div>
    )
  }
)
Resizable.displayName = "Resizable"

export { Resizable }
