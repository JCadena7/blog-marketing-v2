import React, { useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import * as runtime from 'react/jsx-runtime';
import { compile } from '@mdx-js/mdx';

/**
 * Componente para renderizar contenido MDX en la vista previa
 * @param {Object} props
 * @param {string} props.content - Contenido MDX a renderizar
 */
interface MdxPreviewRendererProps {
  content?: string;
}

export default function MdxPreviewRenderer({ content = '' }: MdxPreviewRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType>(() => () => null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function renderMdx() {
      if (!content) {
        setComponent(() => () => <p>Sin contenido</p>);
        return;
      }

      try {
        // Compilar el MDX a un componente React
        const code = await compile(content, {
          outputFormat: 'function-body',
          development: false,
          jsx: true,
        });

        // Crear un componente a partir del código compilado
        const { default: MDXContent } = await evaluate(String(code), runtime);
        setComponent(() => MDXContent);
        setError(null);
      } catch (err: unknown) {
        console.error('Error al renderizar MDX:', err);
        setError(`Error al renderizar: ${err instanceof Error ? err.message : String(err)}`);
        setComponent(() => () => <p>Error al renderizar el contenido</p>);
      }
    }

    renderMdx();
  }, [content]);

  // Función para evaluar el código compilado
  async function evaluate(code: string, r: typeof runtime) {
    const { Fragment, jsx, jsxs } = r;
    const fn = new Function('React', 'Fragment', 'jsx', 'jsxs', `${code}\nreturn MDXContent;`);
    return { default: fn(React, Fragment, jsx, jsxs) as React.ComponentType };
  }

  // Componentes personalizados para el MDX
  const components = {
    h1: (props: any) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
    p: (props: any) => <p className="my-3" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-5 my-3" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-5 my-3" {...props} />,
    li: (props: any) => <li className="my-1" {...props} />,
    a: (props: any) => <a className="text-blue-600 hover:underline" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
    code: (props: any) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props} />,
    pre: (props: any) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4" {...props} />,
    img: (props: any) => <img className="max-w-full h-auto my-4" {...props} />,
    table: (props: any) => <table className="min-w-full border-collapse my-4" {...props} />,
    th: (props: any) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800" {...props} />,
    td: (props: any) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />,
  };

  return (
    <div className="mdx-preview">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <MDXProvider components={components}>
          <Component />
        </MDXProvider>
      )}
    </div>
  );
}