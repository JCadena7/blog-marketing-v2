import React, { useEffect, useRef, useState } from 'react';

type ToolbarVariant = 'basic' | 'full';

interface MdxEditorProps {
  readonly id: string;
  readonly initialContent?: string;
  readonly onChange?: (content: string) => void;
  readonly placeholder?: string;
  readonly minHeight?: string;
  readonly maxHeight?: string;
  readonly className?: string;
  readonly toolbarVariant?: ToolbarVariant;
  readonly readOnly?: boolean;
  readonly showToolbar?: boolean;
}

const LazyMdxEditor = React.lazy(
  () => import('./MdxEditor')
) as React.LazyExoticComponent<React.ComponentType<MdxEditorProps>>;

const EDITOR_CONTENT_KEY = 'getEditorContent' as const;

type GlobalWithEditor = typeof globalThis & {
  [EDITOR_CONTENT_KEY]?: (editorId: string) => string;
};

/**
 * Componente wrapper para el editor MDX
 * @param {MdxEditorWrapperProps} props
 */
interface MdxEditorWrapperProps {
  readonly id: string;
  readonly initialContent?: string;
  readonly onChange?: (content: string) => void;
  readonly placeholder?: string;
  readonly minHeight?: string;
  readonly maxHeight?: string;
  readonly className?: string;
  readonly toolbarVariant?: ToolbarVariant;
  readonly readOnly?: boolean;
  readonly showToolbar?: boolean;
}

export default function MdxEditorWrapper({
  id,
  initialContent = '',
  onChange,
  placeholder = 'Escribe tu contenido aquí...',
  minHeight = '8rem',
  maxHeight = '24rem',
  className = '',
  toolbarVariant = 'basic',
  readOnly = false,
  showToolbar = true
}: MdxEditorWrapperProps) {
  const contentRef = useRef<string>(initialContent);
  const [isClient, setIsClient] = useState(false);

  const getGlobal = () => (typeof globalThis !== 'undefined' ? (globalThis as GlobalWithEditor) : undefined);

  useEffect(() => {
    const globalObj = getGlobal();
    if (globalObj) {
      globalObj[EDITOR_CONTENT_KEY] = (editorId: string) => {
        if (editorId === id) {
          return contentRef.current;
        }
        return '';
      };
    }

    return () => {
      if (globalObj) {
        delete globalObj[EDITOR_CONTENT_KEY];
      }
    };
  }, [id]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (content: string) => {
    contentRef.current = content;
    onChange?.(content);
  };

  if (!isClient) {
    // Fallback ligero compatible con SSR
    return (
      <textarea
        defaultValue={initialContent}
        placeholder={placeholder}
        className={`w-full p-4 border-0 rounded-lg resize-none outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${className}`}
        style={{ minHeight, maxHeight }}
        readOnly
      />
    );
  }

  return (
    <React.Suspense
      fallback={
        <div
          className={`w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}
          style={{ minHeight }}
        >
          <div className="animate-pulse p-4 space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        </div>
      }
    >
      <LazyMdxEditor
        id={id}
        initialContent={initialContent}
        onChange={handleChange}
        placeholder={placeholder}
        minHeight={minHeight}
        maxHeight={maxHeight}
        className={className}
        toolbarVariant={toolbarVariant}
        readOnly={readOnly}
        showToolbar={showToolbar}
      />
    </React.Suspense>
  );
}