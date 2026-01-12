import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { BibleVersePopover } from "../../BibleVersePopover";
import React from "react";

export const BibleVerseExtension = Node.create({
  name: "bibleVerse",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      reference: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "bible-verse",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["bible-verse", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { reference } = props.node.attrs;

      // Fallback if no reference
      if (!reference) return <span>Invalid Verse</span>;

      return (
        <NodeViewWrapper as="span" className="inline relative group">
          <BibleVersePopover reference={reference}>
            <span className="inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium cursor-pointer hover:bg-amber-500/20 hover:text-amber-200 transition-colors select-none text-[0.9em] align-baseline whitespace-nowrap box-decoration-clone">
              <span className="mr-1 opacity-50">📖</span>
              {reference}
            </span>
          </BibleVersePopover>
        </NodeViewWrapper>
      );
    });
  },
});
