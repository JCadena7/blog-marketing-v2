import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../../ui/Button';
import MdxEditorWrapper from './MdxEditorWrapper';

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxLength?: number;
  showPreview?: boolean;
  className?: string;
}

const SimpleMarkdownEditor: React.FC<SimpleMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe tu contenido aquí...',
  minHeight = '8rem',
  maxLength,
  showPreview = false,
  className = ''
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [content, setContent] = useState<string>(value);
  const editorIdRef = useRef<string>(`smdx-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = useCallback((newValue: string) => {
    const limited = typeof maxLength === 'number' ? newValue.slice(0, maxLength) : newValue;
    setContent(limited);
    onChange(limited);
  }, [maxLength, onChange]);

  const renderPreview = () => {
    let html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1<\/h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1<\/h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1<\/h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1<\/strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1<\/em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1<\/code>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary-500 pl-4 italic my-2 text-gray-700 dark:text-gray-300">$1<\/blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1<\/li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1<\/li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">$1<\/a>')
      .replace(/\n/g, '<br>');

    return { __html: html };
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Header with preview toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div />
        {showPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title={isPreviewMode ? 'Modo edición' : 'Vista previa'}
            className="p-1 h-7 w-7"
          >
            {isPreviewMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        )}
      </div>

      {/* Editor/Preview */}
      {isPreviewMode ? (
        <div 
          className="p-3 prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          style={{ minHeight }}
          dangerouslySetInnerHTML={renderPreview()}
        />
      ) : (
        <div className="w-full p-0">
          <MdxEditorWrapper
            id={editorIdRef.current}
            initialContent={content}
            onChange={handleChange}
            placeholder={placeholder}
            minHeight={minHeight}
            maxHeight={undefined}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            toolbarVariant="basic"
            showToolbar
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Markdown soportado</span>
          {typeof maxLength === 'number' && (
            <span className={content.length >= maxLength - 50 ? 'text-amber-500 dark:text-amber-400' : ''}>
              {content.length}/{maxLength} caracteres
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMarkdownEditor;