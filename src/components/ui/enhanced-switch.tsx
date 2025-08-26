import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const EnhancedSwitch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400",
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-all duration-300 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0"
            )}
        >
            {/* ON state icon */}
            <Check
                className={cn(
                    "h-3 w-3 text-green-600 transition-opacity duration-300",
                    "data-[state=checked]:opacity-100 data-[state=unchecked]:opacity-0"
                )}
            />
            {/* OFF state icon */}
            <X
                className={cn(
                    "h-3 w-3 text-gray-400 transition-opacity duration-300 absolute",
                    "data-[state=checked]:opacity-0 data-[state=unchecked]:opacity-100"
                )}
            />
        </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
))
EnhancedSwitch.displayName = SwitchPrimitives.Root.displayName

export { EnhancedSwitch }
