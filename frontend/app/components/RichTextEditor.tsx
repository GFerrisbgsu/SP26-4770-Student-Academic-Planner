import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function editorButtonClass(isActive: boolean): string {
  return `px-3 py-1.5 text-sm rounded-md border transition-colors ${
    isActive
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;
}

export function RichTextEditor({ value, onChange, placeholder = 'Write your note...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[260px] w-full rounded-b-lg border border-t-0 border-gray-300 px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-gray-300 bg-gray-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editorButtonClass(editor.isActive('bold'))}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editorButtonClass(editor.isActive('italic'))}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorButtonClass(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorButtonClass(editor.isActive('bulletList'))}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorButtonClass(editor.isActive('orderedList'))}
        >
          Numbered List
        </button>
      </div>
      <EditorContent editor={editor} />
      <p className="mt-2 text-xs text-gray-500">{placeholder}</p>
    </div>
  );
}