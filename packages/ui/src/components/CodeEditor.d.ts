export interface CodeEditorProps {
    readonly value: string;
    readonly onChange?: (value: string) => void;
    readonly language?: 'json' | 'text';
    readonly readOnly?: boolean;
    readonly placeholder?: string;
    readonly className?: string;
}
/**
 * CodeMirror-based code editor with JSON syntax highlighting.
 * This component MUST be placed inside a container with explicit height (e.g., h-64, h-full with parent constraints).
 */
export declare function CodeEditor({ value, onChange, language, readOnly, placeholder, className, }: CodeEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CodeEditor.d.ts.map