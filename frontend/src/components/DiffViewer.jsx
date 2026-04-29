import { DiffEditor } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

function extractModifiedText(diffContent) {
  return diffContent
    .split("\n")
    .filter((line) => !line.startsWith("---") && !line.startsWith("@@") && !line.startsWith("diff --git"))
    .map((line) => {
      if (line.startsWith("+")) {
        return line.slice(1);
      }
      if (line.startsWith("-")) {
        return "";
      }
      return line.startsWith(" ") ? line.slice(1) : line;
    })
    .join("\n");
}

function extractOriginalText(diffContent) {
  return diffContent
    .split("\n")
    .filter((line) => !line.startsWith("+++") && !line.startsWith("@@") && !line.startsWith("diff --git"))
    .map((line) => {
      if (line.startsWith("-")) {
        return line.slice(1);
      }
      if (line.startsWith("+")) {
        return "";
      }
      return line.startsWith(" ") ? line.slice(1) : line;
    })
    .join("\n");
}

/**
 * Monaco diff viewer with line decorations for review comments.
 */
export default function DiffViewer({ diffContent, comments }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const modifiedEditor = editorRef.current.getModifiedEditor();
    const decorations = comments
      .filter((comment) => Number.isInteger(comment.line_start))
      .map((comment) => ({
        range: new monacoRef.current.Range(comment.line_start, 1, comment.line_start, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName:
            comment.severity === "critical"
              ? "review-glyph-critical"
              : comment.severity === "high"
                ? "review-glyph-high"
                : comment.severity === "medium"
                  ? "review-glyph-medium"
                  : "review-glyph-low",
          glyphMarginHoverMessage: { value: comment.message },
        },
      }));

    modifiedEditor.deltaDecorations([], decorations);
    const disposable = modifiedEditor.onMouseDown((event) => {
      const lineNumber = event.target.position?.lineNumber;
      const match = comments.find((comment) => comment.line_start === lineNumber);
      if (match) {
        document.getElementById(`comment-${match.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => disposable.dispose();
  }, [comments]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
      <DiffEditor
        height="72vh"
        original={extractOriginalText(diffContent)}
        modified={extractModifiedText(diffContent)}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          glyphMargin: true,
          minimap: { enabled: false },
          wordWrap: "on",
          fontSize: 13,
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
        }}
      />
    </div>
  );
}
