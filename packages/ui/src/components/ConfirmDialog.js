'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, } from './Dialog';
import { Button } from './Button';
/**
 * Custom confirm dialog to replace browser's native confirm().
 * Supports danger, warning, and default variants.
 */
export function ConfirmDialog({ open, onOpenChange, title = 'Confirm', description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', onConfirm, onCancel, }) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };
    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };
    const confirmButtonVariant = variant === 'danger' ? 'destructive' : 'default';
    const iconColor = variant === 'danger'
        ? 'text-destructive'
        : variant === 'warning'
            ? 'text-yellow-500'
            : 'text-primary';
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-sm", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-full bg-muted ${iconColor}`, children: _jsx(AlertTriangle, { className: "h-5 w-5" }) }), _jsx(DialogTitle, { children: title })] }), _jsx(DialogDescription, { className: "pt-2", children: description })] }), _jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: handleCancel, children: cancelLabel }), _jsx(Button, { variant: confirmButtonVariant, onClick: handleConfirm, children: confirmLabel })] })] }) }));
}
//# sourceMappingURL=ConfirmDialog.js.map