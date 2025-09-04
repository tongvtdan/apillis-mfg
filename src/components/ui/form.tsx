import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  className?: string
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form ref={ref} className={cn("form-control w-full", className)} {...props}>
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("form-control w-full", className)} {...props}>
        {children}
      </div>
    )
  }
)
FormField.displayName = "FormField"

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("form-control w-full", className)} {...props}>
        {children}
      </div>
    )
  }
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn("label", className)} {...props}>
        <span className="label-text">{children}</span>
      </label>
    )
  }
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    )
  }
)
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("label", className)} {...props}>
        <span className="label-text-alt text-error">{children}</span>
      </div>
    )
  }
)
FormMessage.displayName = "FormMessage"

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
