import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "../lib/utils"

const AccordionContext = React.createContext<{
  value: string | undefined
  onValueChange: (value: string) => void
} | null>(null)

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple" // Keeping interface compatibleish, implementing single for now
  collapsible?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = "single", collapsible, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState<string | undefined>(defaultValue)
    const currentValue = value ?? localValue

    const handleValueChange = (itemValue: string) => {
      const newValue = (currentValue === itemValue && collapsible) ? "" : itemValue
      setLocalValue(newValue)
      onValueChange?.(newValue)
    }

    const contextValue = React.useMemo(() => ({
      value: currentValue,
      onValueChange: handleValueChange
    }), [currentValue, collapsible, onValueChange])

    return (
      <AccordionContext.Provider value={contextValue}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-value={value}
        className={cn("border-b border-border transition-all", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { value } as any)
          }
          return child
        })}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string // injected by Item
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, value, onClick, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const isOpen = context?.value === value

    return (
      <div className="flex">
        <button
          ref={ref}
          type="button"
          onClick={(e) => {
            onClick?.(e)
            if (value) context?.onValueChange(value)
          }}
          data-state={isOpen ? "open" : "closed"}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180",
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </button>
      </div>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string // injected by Item
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const isOpen = context?.value === value

    return (
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "overflow-hidden text-sm transition-all grid", // using grid for animation
          isOpen ? "animate-accordion-down grid-rows-[1fr]" : "animate-accordion-up grid-rows-[0fr]",
          className
        )}
        {...props}
      >
        <div className="min-h-0"> {/* Wrapper for grid animation */}
            <div className="pb-4 pt-0">{children}</div>
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
