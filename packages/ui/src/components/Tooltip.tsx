import * as React from "react"
import { cn } from "../lib/utils"

const TooltipContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

interface TooltipProviderProps {
    children: React.ReactNode
    delayDuration?: number
    skipDelayDuration?: number
    disableHoverableContent?: boolean
}

// Simple provider impl
const TooltipProvider = ({ children }: TooltipProviderProps) => <>{children}</>

interface TooltipProps {
    children: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
}

const Tooltip = ({ children, open, defaultOpen, onOpenChange, delayDuration = 200 }: TooltipProps) => {
    const [localOpen, setLocalOpen] = React.useState(defaultOpen || false)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : localOpen
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const handleOpen = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setIsOpen?.(true)
        }, delayDuration)
    }

    const handleClose = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsOpen?.(false)
    }

    React.useEffect(() => {
        return () => {
             if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const contextValue = React.useMemo(() => ({
        open: !!isOpen, 
        onOpenChange: setIsOpen! 
    }), [isOpen, setIsOpen])

    return (
        <TooltipContext.Provider value={contextValue}>
            <div 
                className="relative inline-block"
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
                onFocus={handleOpen}
                onBlur={handleClose}
                role="button" 
                tabIndex={0}
            >
                {children}
            </div>
        </TooltipContext.Provider>
    )
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            className={className}
            {...props}
        />
    )
)
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, sideOffset = 4, ...props }, ref) => {
        const context = React.useContext(TooltipContext)
        if (!context?.open) return null
        
        return (
            <div
                ref={ref}
                role="tooltip"
                className={cn(
                    "absolute z-50 overflow-hidden rounded-[4px] border border-border bg-popover px-3 py-1.5 text-xs shadow-none animate-in fade-in-0 zoom-in-95 text-popover-foreground",
                    className
                )}
                style={{ top: "100%", marginTop: sideOffset, left: "50%", transform: "translateX(-50%)" }}
                {...props}
            />
        )
    }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
