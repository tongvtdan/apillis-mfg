import * as React from "react"
import { cn } from "@/lib/utils"

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

export interface AccordionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[]
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, items, type = "single", defaultValue, onValueChange, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<string[]>(
      defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
    )

    const handleToggle = (itemId: string) => {
      if (type === "single") {
        const newOpenItems = openItems.includes(itemId) ? [] : [itemId]
        setOpenItems(newOpenItems)
        onValueChange?.(newOpenItems[0] || "")
      } else {
        const newOpenItems = openItems.includes(itemId)
          ? openItems.filter(id => id !== itemId)
          : [...openItems, itemId]
        setOpenItems(newOpenItems)
        onValueChange?.(newOpenItems)
      }
    }

    return (
      <div ref={ref} className={cn("join join-vertical", className)} {...props}>
        {items.map((item) => (
          <div key={item.id} className="collapse collapse-arrow join-item border border-base-300">
            <input
              type="checkbox"
              checked={openItems.includes(item.id)}
              onChange={() => handleToggle(item.id)}
            />
            <div className="collapse-title text-xl font-medium">
              {item.title}
            </div>
            <div className="collapse-content">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

export { Accordion }
