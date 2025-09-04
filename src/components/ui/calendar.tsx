import * as React from "react"
import { cn } from "@/lib/utils"

export interface CalendarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: Date
  onValueChange?: (date: Date) => void
  disabled?: boolean
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, value, onValueChange, disabled, ...props }, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date)
      onValueChange?.(date)
    }

    // Simple calendar implementation
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear

      days.push(
        <button
          key={day}
          className={cn(
            "calendar-day",
            isSelected && "calendar-day-selected",
            disabled && "calendar-day-disabled"
          )}
          onClick={() => !disabled && handleDateSelect(date)}
          disabled={disabled}
        >
          {day}
        </button>
      )
    }

    return (
      <div ref={ref} className={cn("calendar", className)} {...props}>
        <div className="calendar-header">
          <h3 className="calendar-title">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {days}
          </div>
        </div>
      </div>
    )
  }
)
Calendar.displayName = "Calendar"

export { Calendar }
