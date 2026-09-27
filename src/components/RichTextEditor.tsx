import { useEditor, EditorContent, NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Type,
  Highlighter,
  Palette,
  Image as ImageIcon,
  Smile,
  X,
  Trash2,
} from 'lucide-react';

// Custom resizable image component
const ResizableImageComponent = ({ node, updateAttributes, selected, deleteNode, editor }: NodeViewProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string>('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageRef.current) return;
    
    setIsResizing(true);
    setResizeCorner(corner);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({
      width: imageRef.current.offsetWidth,
      height: imageRef.current.offsetHeight,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !imageRef.current) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const aspectRatio = startSize.height / startSize.width;
      
      let newWidth = startSize.width;
      
      // Handle different corners
      if (resizeCorner === 'br' || resizeCorner === 'tr') {
        newWidth = Math.max(100, startSize.width + deltaX);
      } else if (resizeCorner === 'bl' || resizeCorner === 'tl') {
        newWidth = Math.max(100, startSize.width - deltaX);
      }
      
      const newHeight = newWidth * aspectRatio;

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeCorner('');
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize, resizeCorner, updateAttributes]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Keep the node selected - TipTap handles this automatically
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNode();
  };

  return (
    <NodeViewWrapper 
      className="relative inline-block my-2" 
      data-drag-handle
    >
      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={`relative inline-block transition-all duration-150 ${
          selected 
            ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' 
            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 rounded-lg'
        }`}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className="rounded-lg max-w-full cursor-pointer select-none"
          style={{
            width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
            height: node.attrs.height ? `${node.attrs.height}px` : 'auto',
            maxWidth: '100%',
          }}
          draggable={false}
        />
        
        {/* Resize handles and delete button - only show when selected */}
        {selected && (
          <>
            {/* Delete button - positioned at top right */}
            <button
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-150 z-20 hover:scale-110"
              title="Delete image"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Corner resize handles */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'tl')}
              className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'tr')}
              className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'bl')}
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'br')}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />

            {/* Edge resize handles for more precise control */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'tr')}
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'tl')}
              className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize hover:bg-blue-100 hover:scale-110 transition-all z-10 shadow-sm"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// Custom Image extension with resize support
const ResizableImage = Image.extend({
  selectable: true,
  draggable: true,
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

// FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { NoteBackground } from '@/types/note';
import { getBackgroundStyle } from '@/components/BackgroundThemeSheet';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  background?: NoteBackground;
}

const TEXT_COLORS = [
  '#1F2933',
  '#E53E3E',
  '#DD6B20',
  '#D69E2E',
  '#38A169',
  '#3182CE',
  '#805AD5',
  '#D53F8C',
];

const HIGHLIGHT_COLORS = [
  '#FEF3C7',
  '#FECACA',
  '#FED7AA',
  '#D9F99D',
  '#A7F3D0',
  '#BFDBFE',
  '#DDD6FE',
  '#FBCFE8',
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  background, 
}: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[800px] text-gray-800',
      },
    },
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  const handleEmojiSelect = useCallback((emoji: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji.native).run();
    }
    setShowEmojiPicker(false);
  }, [editor]);

  const setFontSize = useCallback((size: string) => {
    if (editor) {
      editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    }
    setShowFontSizePicker(false);
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('underline') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        {/* Strikethrough */}
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('strike') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFontSizePicker(!showFontSizePicker);
              setShowTextColorPicker(false);
              setShowHighlightPicker(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1"
            title="Font Size"
          >
            <Type className="w-4 h-4" />
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 min-w-[100px]">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                  style={{ fontSize: size }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTextColorPicker(!showTextColorPicker);
              setShowHighlightPicker(false);
              setShowFontSizePicker(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors duration-150"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showTextColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20 min-w-[200px]">
              <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Text Color</p>
              <div className="flex flex-wrap gap-3">
                {TEXT_COLORS.map((color) => {
                  const isActive = editor.isActive('textStyle', { color });
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowTextColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md ${
                        isActive 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-md' 
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Set text color to ${color}`}
                    />
                  );
                })}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowTextColorPicker(false);
                  }}
                  className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center bg-white"
                  title="Remove text color"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowTextColorPicker(false);
              setShowFontSizePicker(false);
            }}
            className={`p-2 rounded-lg transition-colors duration-150 ${
              editor.isActive('highlight') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 text-gray-700'
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20 min-w-[200px]">
              <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Highlight Color</p>
              <div className="flex flex-wrap gap-3">
                {HIGHLIGHT_COLORS.map((color) => {
                  const isActive = editor.isActive('highlight', { color });
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        // First remove any existing highlight, then apply the new one
                        editor.chain().focus().unsetHighlight().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md ${
                        isActive 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-md' 
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Highlight with ${color}`}
                    />
                  );
                })}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center bg-white"
                  title="Remove highlight"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Image Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowTextColorPicker(false);
              setShowHighlightPicker(false);
              setShowFontSizePicker(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full right-0 mt-1 z-20">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
              />
            </div>
          )}
        </div>

      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef} 
        className="flex-1 overflow-y-auto p-8 transition-all duration-300"
        style={getBackgroundStyle(background)}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Custom styles for the editor */}
      <style>{`
        .ProseMirror {
          min-height: 800px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9CA3AF;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror img.rich-text-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        .ProseMirror img.rich-text-image:hover {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
        }
        .ProseMirror img.ProseMirror-selectednode {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
        }
        .ProseMirror mark {
          border-radius: 2px;
          padding: 0 2px;
        }
        .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
