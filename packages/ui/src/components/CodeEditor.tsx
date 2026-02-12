'use client';

import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { cn } from '../lib/utils';
import { useSettingsStore } from '@vessel/core';
import { EditorView } from '@codemirror/view';

export interface CodeEditorProps {
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly language?: 'json' | 'text';
  readonly readOnly?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

const neonTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#161616',
    foreground: '#E4E4E7',
    caret: '#39FF14',
    selection: '#39FF1433',
    selectionMatch: '#39FF1433',
    lineHighlight: '#27272A',
    gutterBackground: '#161616',
    gutterForeground: '#71717A',
  },
  styles: [
    { tag: t.keyword, color: '#FF79C6', fontWeight: 'bold' },
    { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#E4E4E7' },
    { tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: '#F1FA8C' },
    { tag: [t.function(t.variableName), t.labelName], color: '#39FF14' },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#BD93F9' },
    { tag: [t.definition(t.name), t.separator], color: '#E4E4E7' },
    { tag: [t.className], color: '#39FF14' },
    { tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#BD93F9' },
    { tag: [t.typeName], color: '#39FF14' },
    { tag: [t.operator, t.operatorKeyword], color: '#FF79C6' },
    { tag: [t.url, t.escape, t.regexp, t.link], color: '#F1FA8C' },
    { tag: [t.meta, t.comment], color: '#6272A4' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: '#BD93F9' },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#BD93F9' },
  ],
});

/**
 * CodeMirror-based code editor with JSON syntax highlighting.
 * This component MUST be placed inside a container with explicit height (e.g., h-64, h-full with parent constraints).
 */
export function CodeEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  placeholder,
  className,
}: CodeEditorProps) {
  const { wordWrap, lineNumbers, editorFontSize, formatOnPaste } = useSettingsStore();

  const formatOnPasteExtension = EditorView.domEventHandlers({
    paste(event, view) {
      if (!formatOnPaste || language !== 'json' || readOnly) return false;

      const clipboardText = event.clipboardData?.getData('text/plain');
      if (!clipboardText) return false;

      try {
        const formatted = JSON.stringify(JSON.parse(clipboardText), null, 2);
        // Only intervene if formatting actually changed something
        if (formatted === clipboardText) return false;

        event.preventDefault();
        view.dispatch(view.state.replaceSelection(formatted));
        onChange?.(view.state.doc.toString());
        return true;
      } catch {
        // Not valid JSON — let CodeMirror handle normal paste
        return false;
      }
    },
  });

  const extensions = [
    ...(language === 'json' ? [json()] : []),
    ...(wordWrap ? [EditorView.lineWrapping] : []),
    formatOnPasteExtension,
  ];

  return (
    <div className={cn('w-full h-full overflow-auto bg-card rounded-[4px] border border-border', className)}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        readOnly={readOnly}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: lineNumbers,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: true,
          autocompletion: !readOnly,
        }}
        theme={neonTheme}
        className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
        style={{ fontSize: `${editorFontSize}px` }}
      />
    </div>
  );
}
