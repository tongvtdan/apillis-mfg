import * as React from "react"
import { cn } from "@/lib/utils"

export interface CarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[]
  autoPlay?: boolean
  interval?: number
  showArrows?: boolean
  showDots?: boolean
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, autoPlay = false, interval = 5000, showArrows = true, showDots = true, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)

    const next = () => {
      setCurrentIndex((prev) => (prev + 1) % children.length)
    }

    const prev = () => {
      setCurrentIndex((prev) => (prev - 1 + children.length) % children.length)
    }

    const goTo = (index: number) => {
      setCurrentIndex(index)
    }

    React.useEffect(() => {
      if (!autoPlay) return

      const timer = setInterval(next, interval)
      return () => clearInterval(timer)
    }, [autoPlay, interval, children.length])

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className="carousel w-full">
          {children.map((child, index) => (
            <div
              key={index}
              id={`slide${index}`}
              className={cn(
                "carousel-item relative w-full",
                index === currentIndex ? "block" : "hidden"
              )}
            >
              {child}
            </div>
          ))}
        </div>

        {showArrows && children.length > 1 && (
          <>
            <button
              onClick={prev}
              className="btn btn-circle absolute left-5 top-1/2 transform -translate-y-1/2"
            >
              ❮
            </button>
            <button
              onClick={next}
              className="btn btn-circle absolute right-5 top-1/2 transform -translate-y-1/2"
            >
              ❯
            </button>
          </>
        )}

        {showDots && children.length > 1 && (
          <div className="flex justify-center w-full py-2 gap-2">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  "btn btn-xs",
                  index === currentIndex ? "btn-primary" : "btn-ghost"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

export { Carousel }
