import * as React from "react"
import { cn } from "@/lib/utils"

export interface CommandItem {
  label: string
  value: string
  onClick?: () => void
  disabled?: boolean
}

export interface CommandProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: CommandItem[]
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, items, placeholder = "Search...", onSearch, ...props }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filteredItems, setFilteredItems] = React.useState(items)

    const handleSearch = (query: string) => {
      setSearchQuery(query)
      const filtered = items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredItems(filtered)
      onSearch?.(query)
    }

    return (
      <div ref={ref} className={cn("join join-vertical", className)} {...props}>
        <div className="join-item">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="join-item">
          <ul className="menu bg-base-100 w-full rounded-box">
            {filteredItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    "w-full text-left",
                    item.disabled && "disabled"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
)
Command.displayName = "Command"

export { Command }
