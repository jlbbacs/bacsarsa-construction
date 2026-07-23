import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Link2,
  Link2Off,
  ImagePlus,
  Table as TableIcon,
  Info,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Rows3,
  Columns3,
  Trash2,
  CombineIcon,
  SplitSquareHorizontal,
} from "lucide-react";
import { uploadImage } from "../../lib/storage";
import { Callout, type CalloutType } from "./tiptap/CalloutExtension";

const HEADING_OPTIONS = [
  { label: "Paragraph", value: "0" },
  { label: "Heading 1", value: "1" },
  { label: "Heading 2", value: "2" },
  { label: "Heading 3", value: "3" },
  { label: "Heading 4", value: "4" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-safety-500 text-white" : "text-steel-600 hover:bg-concrete-100 hover:text-charcoal-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-concrete-200" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImageFile(file: File) {
    try {
      const url = await uploadImage(file, "blog-images");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Image upload failed.");
    }
  }

  function handleSetLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function toggleCallout(type: CalloutType) {
    if (editor.isActive("callout", { type })) {
      editor.chain().focus().unsetCallout().run();
    } else {
      editor.chain().focus().setCallout(type).run();
    }
  }

  const inTable = editor.isActive("table");

  return (
    <div className="flex flex-col gap-1 rounded-t-md border border-b-0 border-concrete-200 bg-concrete-50 p-2">
      <div className="flex flex-wrap items-center gap-1">
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <select
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : editor.isActive("heading", { level: 4 })
                    ? "4"
                    : "0"
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
          }}
          className="h-8 rounded-md border border-concrete-200 bg-white px-2 text-xs font-semibold text-charcoal-900 outline-none focus:border-safety-500"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Divider />

        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <ToolbarButton
          label="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Checklist"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListChecks className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Block Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Insert Link" active={editor.isActive("link")} onClick={handleSetLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove Link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert Image" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageFile(file);
            e.target.value = "";
          }}
        />
        <ToolbarButton
          label="Insert Table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Info Callout"
          active={editor.isActive("callout", { type: "info" })}
          onClick={() => toggleCallout("info")}
        >
          <Info className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Warning Callout"
          active={editor.isActive("callout", { type: "warning" })}
          onClick={() => toggleCallout("warning")}
        >
          <AlertTriangle className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Success Callout"
          active={editor.isActive("callout", { type: "success" })}
          onClick={() => toggleCallout("success")}
        >
          <CheckCircle2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Tip Callout"
          active={editor.isActive("callout", { type: "tip" })}
          onClick={() => toggleCallout("tip")}
        >
          <Lightbulb className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {inTable && (
        <div className="flex flex-wrap items-center gap-1 border-t border-concrete-200 pt-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-wide text-steel-500">Table</span>
          <ToolbarButton label="Add Row Below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Rows3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows3 className="h-4 w-4 opacity-50" />
          </ToolbarButton>
          <ToolbarButton label="Add Column Right" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Columns3 className="h-4 w-4 opacity-50" />
          </ToolbarButton>
          <ToolbarButton label="Merge Cells" onClick={() => editor.chain().focus().mergeCells().run()}>
            <CombineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Split Cell" onClick={() => editor.chain().focus().splitCell().run()}>
            <SplitSquareHorizontal className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Toggle Header Row"
            active={editor.isActive("tableHeader")}
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight,
      Callout,
      Placeholder.configure({ placeholder: "Write your post..." }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-post min-h-64 max-h-[32rem] overflow-y-auto px-4 py-3 outline-none",
      },
    },
  });

  // Keep the editor in sync when a different post is loaded into the same instance.
  const lastLoadedContent = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== lastLoadedContent.current && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    lastLoadedContent.current = content;
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="rounded-b-md border border-concrete-200 bg-white" />
    </div>
  );
}
