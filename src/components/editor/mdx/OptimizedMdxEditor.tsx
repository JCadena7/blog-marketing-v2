import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Button from '../../ui/Button';
import Card, { CardContent, CardHeader } from '../../ui/Card';
import MdxEditorWrapper from './MdxEditorWrapper';
import MdxPreview from './MdxPreview';

interface OptimizedMdxEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  showPreview?: boolean;
  showToolbar?: boolean;
  className?: string;
}

const OptimizedMdxEditor: React.FC<OptimizedMdxEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = '¿Qué estrategia quieres compartir con la comunidad?',
  minHeight = '8rem',
  maxHeight = '24rem',
  showPreview = true,
  showToolbar = true,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorIdRef = useRef<string>(`omdx-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  const editorId = editorIdRef.current;

  // No outer padding/border to avoid the editor looking "salido"

  return (
    <Card className={`transition-all duration-300 relative ${isFullscreen ? 'fixed inset-4 z-50 max-w-none' : ''}`}>
      {showToolbar && (
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  title={isPreviewMode ? 'Modo edición' : 'Vista previa'}
                  className="p-2"
                >
                  {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                className="p-2"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {isPreviewMode ? (
          <div className="p-4 prose dark:prose-invert max-w-none min-h-32" style={{ minHeight }}>
            <MdxPreview content={content} />
          </div>
        ) : (
          <MdxEditorWrapper
            id={editorId}
            initialContent={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            minHeight={minHeight}
            maxHeight={isFullscreen ? 'calc(100vh - 200px)' : maxHeight}
            className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${className}`}
            toolbarVariant="full"
            showToolbar={showToolbar}
          />
        )}
        
        {/* Character count */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{content.length} caracteres</span>
            <span>Markdown soportado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedMdxEditor;