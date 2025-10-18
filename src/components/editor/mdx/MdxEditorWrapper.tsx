import React, { useEffect, useRef } from 'react';

type ToolbarVariant = 'basic' | 'full';

interface MdxEditorProps {
  id: string;
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  toolbarVariant?: ToolbarVariant;
  readOnly?: boolean;
  showToolbar?: boolean;
}

const LazyMdxEditor = React.lazy(
  () => import('./MdxEditor')
) as React.LazyExoticComponent<React.ComponentType<MdxEditorProps>>;

declare global {
  interface Window {
    getEditorContent?: (editorId: string) => string;
  }
}

/**
 * @typedef {Object} MdxEditorWrapperProps
 * @property {string} id - ID único para el editor
 * @property {string} [initialContent=''] - Contenido inicial del editor
 */

/**
 * Componente wrapper para el editor MDX
 * @param {MdxEditorWrapperProps} props
 */
interface MdxEditorWrapperProps {
  id: string;
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  toolbarVariant?: ToolbarVariant;
  readOnly?: boolean;
  showToolbar?: boolean;
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
  const [isClient, setIsClient] = React.useState(false);

  // Agregar log para verificar el contenido inicial en el wrapper
  // console.log('MdxEditorWrapper - Initial content:', initialContent);

  useEffect(() => {
    // console.log('MdxEditorWrapper - Setting up getEditorContent');
    // Exponer la función getEditorContent al objeto window
    window.getEditorContent = (editorId: string) => {
      // console.log('getEditorContent called for id:', editorId);
      if (editorId === id) {
        // console.log('Returning content:', contentRef.current);
        return contentRef.current;
      }
      return '';
    };

    // Limpiar al desmontar
    return () => {
      if (window.getEditorContent) {
        delete window.getEditorContent;
      }
    };
  }, [id]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (content: string) => {
    // console.log('MdxEditorWrapper - Content changed:', content);
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