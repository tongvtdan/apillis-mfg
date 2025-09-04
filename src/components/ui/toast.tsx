import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, type = "info", duration = 5000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }, [duration, onClose])

    if (!isVisible) return null

    const getToastClass = () => {
      switch (type) {
        case "success":
          return "alert alert-success"
        case "error":
          return "alert alert-error"
        case "warning":
          return "alert alert-warning"
        case "info":
        default:
          return "alert alert-info"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 max-w-sm",
          getToastClass(),
          className
        )}
      >
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="btn btn-sm btn-circle btn-ghost"
        >
          ✕
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
