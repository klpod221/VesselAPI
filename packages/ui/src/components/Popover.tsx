import * as React from "react"
import { cn } from "../lib/utils"

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Popover = ({ open, onOpenChange, children }: PopoverProps) => {
  const [localOpen, setLocalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : localOpen
  const setIsOpen = isControlled ? onOpenChange : setLocalOpen

  // Close on click outside
  const popoverRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen?.(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, setIsOpen])


  const contextValue = React.useMemo(() => ({
    open: !!isOpen,
    onOpenChange: setIsOpen!
  }), [isOpen, setIsOpen])

  return (
    <PopoverContext.Provider value={contextValue}>
      <div ref={popoverRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
            onClick?.(e)
            context?.onOpenChange(!context.open)
        }}
        className={className}
        {...props}
      />
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    if (!context?.open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground outline-none animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{ top: "100%", ...style }}
        {...props}
      />
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
