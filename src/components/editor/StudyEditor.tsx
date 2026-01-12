"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BibleVerseExtension } from "./extensions/BibleVerseExtension";
import React, { useEffect } from "react";

interface StudyEditorProps {
  content: string;
  editable?: boolean;
  onChange?: (html: string) => void;
}

export function StudyEditor({
  content,
  editable = false,
  onChange,
}: StudyEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, BibleVerseExtension],
    content: content || "<p>Loading study...</p>",
    editable: editable,
    immediatelyRender: false,
    // Prose classes should be on the wrapper to ensure they cascade correctly to all editor content
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Sync content updates from parent (e.g. loading async data)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      if (content === "") return;
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full prose prose-invert prose-amber max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
