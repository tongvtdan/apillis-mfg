import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // For the adaptive theme, we'll use the system preference
  const theme = "system";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/100 group-[.toaster]:text-foreground group-[.toaster]:border-amber-400 group-[.toaster]:border-2 group-[.toaster]:shadow-lg group-[.toaster]:shadow-amber-400/40 group-[.toaster]:font-semibold",
          description: "group-[.toast]:text-muted-foreground/100 group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }