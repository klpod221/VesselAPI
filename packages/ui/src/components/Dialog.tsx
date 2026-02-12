import * as React from "react"
import { X } from "lucide-react"

import { cn } from "../lib/utils"
import { Portal } from "./Portal"

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [localOpen, setLocalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : localOpen
  const setIsOpen = isControlled ? onOpenChange : setLocalOpen

  const contextValue = React.useMemo(() => ({
    open: !!isOpen,
    onOpenChange: setIsOpen!
  }), [isOpen, setIsOpen])

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  )
}
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext)
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onClick?.(e)
          context?.onOpenChange(true)
        }}
        className={className}
        {...props}
      />
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext)
    if (!context?.open) return null

    return (
      <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        data-state={context.open ? "open" : "closed"}
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 w-full h-full border-0 cursor-default"
        )}
        onClick={() => {
            if (context?.onOpenChange) context.onOpenChange(false)
        }}
        tabIndex={-1} 
      />     {/* Content */}
           <div
            ref={ref}
            className={cn(
                "relative z-50 grid w-full max-w-lg gap-2 p-2 duration-200 sm:rounded-lg bg-background border border-border animate-in fade-in-0 zoom-in-95",
                className
            )}
            {...props}
            >
            {children}
            <button
                type="button"
                onClick={() => context.onOpenChange(false)}
                className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-secondary/50 p-1"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
            </div>
        </div>
      </Portal>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
        {props.children}
    </h2>
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
