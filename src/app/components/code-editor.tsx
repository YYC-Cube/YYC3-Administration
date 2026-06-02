/**
 * @file code-editor.tsx
 * @description YYC³ Code Editor — Powered by Monaco Editor (@monaco-editor/react)
 *   with full IntelliSense, syntax highlighting, bracket matching, minimap,
 *   find/replace, multi-cursor, code folding, and YYC³ dark theme integration.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @tags P1,frontend,editor,monaco,intellisense
 */

import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { Copy, Loader2, Minus, Plus, Save, Type, WrapText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useThemeColors } from "./hooks/use-theme-colors";

import type { editor } from "monaco-editor";

// ==========================================
// Types
// ==========================================

export interface CodeEditorProps {
  /** File path — used for display and automatic language detection */
  filePath: string;
  /** Initial file content */
  initialContent?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when user saves (Ctrl+S) */
  onSave?: (content: string) => void;
  /** Callback to retrieve current content (exposed for AI context) */
  onEditorReady?: (getter: () => string) => void;
  /** Callback to expose insert-at-cursor function */
  onInsertReady?: (inserter: (text: string) => void) => void;
}

// ==========================================
// Language Detection
// ==========================================

const EXT_LANG_MAP: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  json: "json", md: "markdown", css: "css", scss: "scss", less: "less",
  html: "html", xml: "xml", yaml: "yaml", yml: "yaml",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
  sh: "shell", bash: "shell", sql: "sql", graphql: "graphql",
  toml: "ini", env: "ini", dockerfile: "dockerfile",
};

function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const name = filePath.split("/").pop()?.toLowerCase() ?? "";
  if (name === "dockerfile") return "dockerfile";
  if (name === "makefile") return "makefile";
  if (name.endsWith(".d.ts")) return "typescript";
  return EXT_LANG_MAP[ext] ?? "plaintext";
}

// ==========================================
// YYC³ Dark Theme Definition
// ==========================================

function defineYYC3Theme(monaco: Monaco) {
  monaco.editor.defineTheme("yyc3-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "c084fc" },
      { token: "string", foreground: "86efac" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "67e8f9" },
      { token: "type.identifier", foreground: "67e8f9" },
      { token: "function", foreground: "60a5fa" },
      { token: "variable", foreground: "e2e8f0" },
      { token: "operator", foreground: "f472b6" },
      { token: "delimiter.bracket", foreground: "d1d5db" },
      { token: "tag", foreground: "f87171" },
      { token: "attribute.name", foreground: "fbbf24" },
      { token: "attribute.value", foreground: "86efac" },
      { token: "regexp", foreground: "f97316" },
      { token: "annotation", foreground: "a78bfa" },
      { token: "constant", foreground: "fbbf24" },
      { token: "delimiter", foreground: "9ca3af" },
    ],
    colors: {
      "editor.background": "#0c1210",
      "editor.foreground": "#e2e8f0",
      "editor.lineHighlightBackground": "#ffffff06",
      "editor.selectionBackground": "#00ff8720",
      "editor.inactiveSelectionBackground": "#00ff8710",
      "editor.selectionHighlightBackground": "#00ff8712",
      "editorLineNumber.foreground": "#4b5563",
      "editorLineNumber.activeForeground": "#00ff87",
      "editorCursor.foreground": "#00ff87",
      "editorWhitespace.foreground": "#ffffff08",
      "editorIndentGuide.background": "#ffffff08",
      "editorIndentGuide.activeBackground": "#ffffff15",
      "editor.findMatchBackground": "#00ff8730",
      "editor.findMatchHighlightBackground": "#00ff8715",
      "editorBracketMatch.background": "#00ff8720",
      "editorBracketMatch.border": "#00ff8740",
      "editorGutter.background": "#0c1210",
      "editorWidget.background": "#111a17",
      "editorWidget.border": "#00ff8720",
      "editorSuggestWidget.background": "#111a17",
      "editorSuggestWidget.border": "#00ff8720",
      "editorSuggestWidget.selectedBackground": "#00ff8715",
      "editorSuggestWidget.highlightForeground": "#00ff87",
      "editorHoverWidget.background": "#111a17",
      "editorHoverWidget.border": "#00ff8720",
      "minimap.background": "#0a0f0d",
      "minimapSlider.background": "#00ff8710",
      "minimapSlider.hoverBackground": "#00ff8720",
      "minimapSlider.activeBackground": "#00ff8730",
      "scrollbar.shadow": "#00000030",
      "scrollbarSlider.background": "#ffffff10",
      "scrollbarSlider.hoverBackground": "#ffffff20",
      "scrollbarSlider.activeBackground": "#ffffff30",
      "focusBorder": "#00ff8740",
      "input.background": "#0f1a16",
      "input.border": "#00ff8720",
      "input.foreground": "#e2e8f0",
      "dropdown.background": "#111a17",
      "dropdown.border": "#00ff8720",
    },
  });
}

// ==========================================
// CodeEditor Component
// ==========================================

export function CodeEditor({
  filePath,
  initialContent,
  readOnly = false,
  onChange,
  onSave,
  onEditorReady,
  onInsertReady,
}: CodeEditorProps) {
  const tc = useThemeColors();
  const language = detectLanguage(filePath);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [modified, setModified] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [lineCount, setLineCount] = useState(0);
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState<"off" | "on">("off");
  const [showMinimap, setShowMinimap] = useState(true);

  const defaultContent = initialContent ?? `/**\n * @file ${filePath.split("/").pop()}\n * @description YYC³ Component\n * @author YanYuCloudCube Team <admin@0379.email>\n * @version v1.0.0\n */\n\nimport { useState, useCallback } from "react";\nimport { useThemeColors } from "./hooks/use-theme-colors";\nimport { motion } from "motion/react";\n\n/** Component props */\ninterface Props {\n  title?: string;\n  className?: string;\n}\n\n/** Main component */\nexport function Component({ title = "YYC³", className }: Props) {\n  const tc = useThemeColors();\n  const [count, setCount] = useState(0);\n\n  const handleClick = useCallback(() => {\n    setCount((prev) => prev + 1);\n  }, []);\n\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      className={className}\n      style={{ background: tc.bgBase, color: tc.textPrimary }}\n    >\n      <h1>{title}</h1>\n      <p>Count: {count}</p>\n      <button onClick={handleClick}>Increment</button>\n    </motion.div>\n  );\n}\n`;

  /** Called once Monaco is mounted */
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Define + apply the YYC³ dark theme
    defineYYC3Theme(monaco);
    monaco.editor.setTheme("yyc3-dark");

    // Register Ctrl+S as a save action
    editor.addAction({
      id: "yyc3-save",
      label: "Save File",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: (ed) => {
        const content = ed.getValue();
        onSave?.(content);
        setModified(false);
      },
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorLine(e.position.lineNumber);
      setCursorCol(e.position.column);
    });

    // Track line count
    const model = editor.getModel();
    if (model) {
      setLineCount(model.getLineCount());
      model.onDidChangeContent(() => {
        setLineCount(model.getLineCount());
      });
    }

    // Expose content getter for AI context injection
    onEditorReady?.(() => editor.getValue());

    // Expose insert-at-cursor function
    onInsertReady?.((text) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.executeEdits("insert", [
          {
            range: selection,
            text,
          },
        ]);
      }
    });

    // Focus the editor
    editor.focus();
  }, [onSave, onEditorReady, onInsertReady]);

  /** Content change handler */
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setModified(true);
      onChange?.(value);
    }
  }, [onChange]);

  /** Update editor options when controls change */
  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize,
      wordWrap,
      minimap: { enabled: showMinimap },
    });
  }, [fontSize, wordWrap, showMinimap]);

  /** Copy all content */
  const handleCopy = useCallback(() => {
    const content = editorRef.current?.getValue() ?? "";
    navigator.clipboard?.writeText(content);
  }, []);

  /** Manual save trigger */
  const handleSaveClick = useCallback(() => {
    const content = editorRef.current?.getValue() ?? "";
    onSave?.(content);
    setModified(false);
  }, [onSave]);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border"
      style={{ background: "#0c1210", borderColor: tc.borderDefault }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: tc.borderSubtle }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono truncate" style={{ color: tc.textMuted }}>
            {filePath}
          </span>
          {modified && (
            <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(234,179,8,0.12)", color: "#eab308" }}>
              Modified
            </span>
          )}
          {readOnly && (
            <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(107,114,128,0.12)", color: "#6b7280" }}>
              Read Only
            </span>
          )}
          <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,255,135,0.08)", color: "#00ff87" }}>
            {language}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
            title="Decrease font size">
            <Minus className="w-3 h-3" style={{ color: tc.textMuted }} />
          </button>
          <span className="text-[9px] w-6 text-center" style={{ color: tc.textMuted }}>{fontSize}</span>
          <button onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
            title="Increase font size">
            <Plus className="w-3 h-3" style={{ color: tc.textMuted }} />
          </button>
          <button onClick={() => setWordWrap((w) => w === "off" ? "on" : "off")}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
            title="Toggle word wrap"
            style={{ background: wordWrap === "on" ? "rgba(0,255,135,0.1)" : "transparent" }}>
            <WrapText className="w-3 h-3" style={{ color: wordWrap === "on" ? "#00ff87" : tc.textMuted }} />
          </button>
          <button onClick={() => setShowMinimap((m) => !m)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
            title="Toggle minimap"
            style={{ background: showMinimap ? "rgba(0,255,135,0.1)" : "transparent" }}>
            <Type className="w-3 h-3" style={{ color: showMinimap ? "#00ff87" : tc.textMuted }} />
          </button>
          <button onClick={handleCopy}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
            title="Copy all">
            <Copy className="w-3 h-3" style={{ color: tc.textMuted }} />
          </button>
          {onSave && (
            <button onClick={handleSaveClick}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
              title="Save (Ctrl+S)">
              <Save className="w-3 h-3" style={{ color: modified ? "#eab308" : tc.textMuted }} />
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          defaultValue={defaultContent}
          theme="vs-dark"
          onMount={handleEditorMount}
          onChange={handleChange}
          loading={
            <div className="flex items-center justify-center h-full gap-2"
              style={{ background: "#0c1210" }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00ff87" }} />
              <span className="text-[11px]" style={{ color: "#6b7280" }}>
                Loading Monaco Editor...
              </span>
            </div>
          }
          options={{
            readOnly,
            fontSize,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace",
            fontLigatures: true,
            wordWrap,
            minimap: { enabled: showMinimap, scale: 1, showSlider: "mouseover" },
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            foldingStrategy: "indentation",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            renderWhitespace: "selection",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 8, bottom: 8 },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showSnippets: true,
            },
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: "all",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            contextmenu: true,
            mouseWheelZoom: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 border-t text-[9px]"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: tc.borderSubtle, color: tc.textMuted }}>
        <div className="flex items-center gap-3">
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: "#00ff87" }}>{language}</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span>Monaco</span>
        </div>
      </div>
    </div>
  );
}