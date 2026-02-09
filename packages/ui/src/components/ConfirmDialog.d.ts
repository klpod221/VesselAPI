interface ConfirmDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly title?: string;
    readonly description: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly variant?: 'danger' | 'warning' | 'default';
    readonly onConfirm: () => void;
    readonly onCancel?: () => void;
}
/**
 * Custom confirm dialog to replace browser's native confirm().
 * Supports danger, warning, and default variants.
 */
export declare function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, variant, onConfirm, onCancel, }: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConfirmDialog.d.ts.map