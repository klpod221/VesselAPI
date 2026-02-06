export interface CodeEditorProps {
    readonly value: string;
    readonly onChange?: (value: string) => void;
    readonly language?: 'json' | 'text';
    readonly readOnly?: boolean;
    readonly placeholder?: string;
    readonly className?: string;
    readonly minHeight?: string;
    readonly maxHeight?: string;
}
/**
 * CodeMirror-based code editor with JSON syntax highlighting.
 */
export declare function CodeEditor({ value, onChange, language, readOnly, placeholder, className, minHeight, maxHeight, }: CodeEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CodeEditor.d.ts.map