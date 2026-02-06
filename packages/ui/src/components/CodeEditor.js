'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { cn } from '../lib/utils';
/**
 * CodeMirror-based code editor with JSON syntax highlighting.
 */
export function CodeEditor({ value, onChange, language = 'json', readOnly = false, placeholder, className, minHeight = '200px', maxHeight = '400px', }) {
    const extensions = language === 'json' ? [json()] : [];
    const handleChange = (val) => {
        onChange?.(val);
    };
    return (_jsx("div", { className: cn('overflow-hidden rounded-md border border-border', className), children: _jsx(CodeMirror, { value: value, onChange: handleChange, extensions: extensions, readOnly: readOnly, placeholder: placeholder, basicSetup: {
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: !readOnly,
                highlightSelectionMatches: true,
                autocompletion: !readOnly,
            }, style: {
                minHeight,
                maxHeight,
                overflow: 'auto',
            }, theme: "dark" }) }));
}
//# sourceMappingURL=CodeEditor.js.map