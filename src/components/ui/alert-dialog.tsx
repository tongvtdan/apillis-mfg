import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ isOpen, onClose, title, description, children, className }, ref) => {
    if (!isOpen) return null

    return (
      <div className="modal modal-open">
        <div className="modal-box" ref={ref}>
          <h3 className="font-bold text-lg">{title}</h3>
          {description && (
            <p className="py-4">{description}</p>
          )}
          <div className="modal-action">
            {children}
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>
    )
  }
)
AlertDialog.displayName = "AlertDialog"

export { AlertDialog }
