import React, { useCallback } from 'react';
import '@mdxeditor/editor/style.css';
// import { MDXEditor } from '@mdxeditor/editor';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  UndoRedo,
  InsertFrontmatter,
  StrikeThroughSupSubToggles,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  ChangeCodeMirrorLanguage,
  ConditionalContents
} from '@mdxeditor/editor';

/**
 * @typedef {Object} MdxEditorProps
 * @property {string} [initialContent=''] - Contenido inicial del editor
 * @property {function} onChange - Función que se llama cuando cambia el contenido
 * @property {string} id - ID único para el editor
 */

/**
 * Componente del editor MDX
 * @param {MdxEditorProps} props
 */
export default function MdxEditor({
  initialContent = '',
  onChange,
  id,
  placeholder = 'Escribe tu contenido aquí...',
  minHeight = '12rem',
  maxHeight = 'auto',
  className = '',
  toolbarVariant = 'full',
  readOnly = false,
  showToolbar = true
}: {
  initialContent?: string;
  onChange?: (content: string) => void;
  id: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  toolbarVariant?: 'basic' | 'full';
  readOnly?: boolean;
  showToolbar?: boolean;
}) {
  const handleChange = useCallback((content: string) => {
    // console.log('Editor content changed:', content);
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  const handleEditorError = (error: unknown) => {
    // console.error('Editor error:', error);
  };

  // Agregar log para verificar el contenido inicial
  // console.log('Initial content received:', initialContent);

  const basePlugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    markdownShortcutPlugin()
  ];

  const fullOnlyPlugins = [
    tablePlugin(),
    codeBlockPlugin({
      defaultCodeBlockLanguage: 'javascript'
    }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        python: 'Python',
        html: 'HTML',
        css: 'CSS'
      }
    }),
    frontmatterPlugin(),
    diffSourcePlugin()
  ];

  const toolbarContentsBasic = (
    <div className="flex flex-wrap gap-2 p-2">
      <div className="flex items-center gap-1 border-r pr-2">
        <BoldItalicUnderlineToggles />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <ListsToggle />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <CreateLink />
        <InsertImage />
      </div>
      <div className="flex items-center gap-1">
        <UndoRedo />
      </div>
    </div>
  );

  const toolbarContentsFull = (
    <div className="flex flex-wrap gap-2 p-2">
      <div className="flex items-center gap-1 border-r pr-2">
        <BlockTypeSelect />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <BoldItalicUnderlineToggles />
        <StrikeThroughSupSubToggles />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <ListsToggle />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <CreateLink />
        <InsertImage />
        <InsertTable />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <ConditionalContents
          options={[
            {
              when: (editor: any) => editor?.editorType === 'codeblock',
              contents: () => <ChangeCodeMirrorLanguage />
            },
            {
              fallback: () => <InsertCodeBlock />
            }
          ]}
        />
      </div>
      <div className="flex items-center gap-1 border-r pr-2">
        <InsertFrontmatter />
      </div>
      <div className="flex items-center gap-1">
        <DiffSourceToggleWrapper>
          <UndoRedo />
        </DiffSourceToggleWrapper>
      </div>
    </div>
  );

  const plugins = [
    ...basePlugins,
    ...(toolbarVariant === 'full' ? fullOnlyPlugins : []),
    ...(showToolbar
      ? [
          toolbarPlugin({
            toolbarContents: () => (toolbarVariant === 'full' ? toolbarContentsFull : toolbarContentsBasic)
          })
        ]
      : [])
  ];

  const wrapperStyle = {
    ['--mdx-min-height' as any]: minHeight,
    ['--mdx-max-height' as any]: maxHeight
  } as React.CSSProperties;

  return (
    <div
      className={`mdx-editor-wrapper ${className}`}
      id={id}
      style={wrapperStyle}
    >
      <style>{`

/* COLORES DE TEXTO DEL USUARIO EN EL EDITOR MDX */

/* Área principal del editor - LIGHT MODE (texto negro) */
.mdx-editor {
  padding: 1rem;
}
[data-mdx-editor]:not(.cm-editor):not(.cm-editor *) {
  font-family: system-ui, -apple-system, sans-serif;
  color: #1a1a1a !important; /* Negro en modo claro */
}

.dark [data-mdx-editor]:not(.cm-editor):not(.cm-editor *) {
  color: #ffffff !important; /* Blanco en modo oscuro */
}

/* Refuerzo: todos los nodos de contenido heredan color claro en dark */
/* Refuerzo: todos los nodos de contenido heredan color claro en dark, excepto CodeMirror */
.dark .mdx-editor,
.dark .mdx-editor * {
  color: #e5e7eb !important; /* gray-100 */
}

// /* Personalización de gutters de CodeMirror */
// .dark .cm-gutters {
//   background-color: #ffffff !important; /* Fondo blanco para gutters no seleccionados */
//   color: #000000 !important; /* Texto negro para números de línea */
// }

.dark .cm-activeLineGutter {
  background-color:rgb(255, 255, 255) !important; /* Fondo negro para gutter de línea activa */
  color:rgb(0, 0, 0) !important; /* Texto blanco para número de línea activa */
}
/* Mantener enlaces legibles y con contraste en dark */
.dark .mdx-editor a {
  color:rgb(49, 108, 176) !important; /* blue-300 */
}

/* Texto común hereda color en oscuro */
.dark .mdx-editor p,
.dark .mdx-editor li,
.dark .mdx-editor h1,
.dark .mdx-editor h2,
.dark .mdx-editor h3,
.dark .mdx-editor h4,
.dark .mdx-editor h5,
.dark .mdx-editor h6,
.dark .mdx-editor span,
.dark .mdx-editor strong,
.dark .mdx-editor em {
  color: inherit !important;
}

/* Inline code chips: fondo oscuro y texto claro en dark */
.dark .mdx-editor code:not(pre code) {
  background-color: rgba(71, 71, 71, 0.08) !important;
  color:rgb(0, 0, 0) !important; /* gray-200 */
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
}

/* Placeholder del editor en oscuro */
.dark .mdx-editor [data-placeholder] {
  color:rgba(12, 12, 12, 0.19) !important; /* gray-400 */
}

/* Menús desplegables (Radix Popper) del editor siempre por encima del modal */
.mdx-editor-wrapper [data-radix-popper-content-wrapper] {
  z-index: 60 !important; /* Modal usa z-50; esto lo coloca encima */
}
/* Ajuste visual de dropdowns en light/dark */
.mdx-editor-wrapper [data-radix-popper-content-wrapper] > * {
  background-color: #ffffff; /* Light */
  color: #1f2937; /* slate-800 */
}
.dark .mdx-editor-wrapper [data-radix-popper-content-wrapper] > * {
  background-color: #111827; /* gray-900 */
  color:rgb(14, 14, 14); /* gray-50 */
}

/* Tooltips/autocomplete de CodeMirror por encima también */
.mdx-editor-wrapper .cm-tooltip {
  z-index: 60 !important;
}

/* CodeMirror en modo oscuro: fondo oscuro y texto claro */
.dark .mdx-editor-wrapper .cm-editor {
  background-color: #0f172a !important; /* slate-900 */
  color:rgb(27, 27, 27) !important; /* gray-200 */
  border-radius: 0.5rem;
}
.dark .mdx-editor-wrapper .cm-content,
.dark .mdx-editor-wrapper .cm-line {
  color: #e5e7eb !important; /* texto claro */
}
.dark .mdx-editor-wrapper .cm-gutters {
  background-color: #0f172a !important;
  color:rgb(0, 0, 0) !important; /* gray-400 para números de línea */
  border-right-color: rgba(90, 90, 90, 0.08) !important;
}
.dark .mdx-editor-wrapper .cm-activeLine {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
.dark .mdx-editor-wrapper .cm-selectionBackground,
.dark .mdx-editor-wrapper .cm-content ::selection {
  background-color: rgba(0, 0, 0, 0.32) !important; /* azul translúcido */
}
      `}</style>
      <MDXEditor
        onChange={handleChange}
        markdown={initialContent}
        contentEditableClassName="prose dark:prose-invert max-w-none mdx-editor"
        onError={handleEditorError}
        suppressHtmlProcessing={false}
        placeholder={placeholder}
        readOnly={readOnly}
        autoFocus
        plugins={plugins}
      />
    </div>
  );
}