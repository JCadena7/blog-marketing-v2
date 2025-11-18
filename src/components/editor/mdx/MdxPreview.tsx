import React, { useState, useEffect } from 'react';
import { evaluate } from '@mdx-js/mdx';
import { MDXProvider } from '@mdx-js/react';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type ListProps = React.HTMLAttributes<HTMLUListElement>;
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
type CodeProps = React.HTMLAttributes<HTMLElement>;
type PreProps = React.HTMLAttributes<HTMLPreElement>;
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type TableHeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement>;
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

const H1: React.FC<HeadingProps> = ({ children, ...props }) => (
  <h1 className="text-3xl font-bold mt-6 mb-4" {...props}>
    {children}
  </h1>
);

const H2: React.FC<HeadingProps> = ({ children, ...props }) => (
  <h2 className="text-2xl font-bold mt-5 mb-3" {...props}>
    {children}
  </h2>
);

const H3: React.FC<HeadingProps> = ({ children, ...props }) => (
  <h3 className="text-xl font-bold mt-4 mb-2" {...props}>
    {children}
  </h3>
);

const Paragraph: React.FC<ParagraphProps> = ({ children, ...props }) => (
  <p className="my-3" {...props}>
    {children}
  </p>
);

const UnorderedList: React.FC<ListProps> = ({ children, ...props }) => (
  <ul className="list-disc pl-5 my-3" {...props}>
    {children}
  </ul>
);

const OrderedList: React.FC<ListProps> = ({ children, ...props }) => (
  <ol className="list-decimal pl-5 my-3" {...props}>
    {children}
  </ol>
);

const ListItem: React.FC<ListItemProps> = ({ children, ...props }) => (
  <li className="my-1" {...props}>
    {children}
  </li>
);

const Anchor: React.FC<AnchorProps> = ({ children, href, ...props }) => (
  <a className="text-blue-600 hover:underline" href={href} {...props}>
    {children ?? href}
  </a>
);

const Blockquote: React.FC<BlockquoteProps> = ({ children, ...props }) => (
  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props}>
    {children}
  </blockquote>
);

const InlineCode: React.FC<CodeProps> = ({ children, ...props }) => (
  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
    {children}
  </code>
);

const Preformatted: React.FC<PreProps> = ({ children, ...props }) => (
  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4" {...props}>
    {children}
  </pre>
);

const Image: React.FC<ImageProps> = ({ alt = '', ...props }) => (
  <img className="max-w-full h-auto my-4" alt={alt} {...props} />
);

const TableComponent: React.FC<TableProps> = ({ children, ...props }) => (
  <table className="min-w-full border-collapse my-4" {...props}>
    {children}
  </table>
);

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, ...props }) => (
  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800" {...props}>
    {children}
  </th>
);

const TableCell: React.FC<TableCellProps> = ({ children, ...props }) => (
  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props}>
    {children}
  </td>
);

const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  a: Anchor,
  blockquote: Blockquote,
  code: InlineCode,
  pre: Preformatted,
  img: Image,
  table: TableComponent,
  th: TableHeaderCell,
  td: TableCell
};

const EmptyContent: React.FC = () => <p>Sin contenido</p>;

/**
 * Componente para mostrar la vista previa del contenido MDX
 */
interface MdxPreviewProps {
  readonly content?: string;
  readonly title?: string;
  readonly className?: string;
}

export default function MdxPreview({ content = '', title = '', className = '' }: MdxPreviewProps) {
  const [MDXContent, setMDXContent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      if (!content) {
        if (!cancelled) {
          setMDXContent(() => EmptyContent);
        }
        return;
      }
      try {
        const { default: Content } = await evaluate(content, {
          ...runtime,
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
        });
        if (!cancelled) {
          setMDXContent(() => Content);
          setError(null);
        }
      } catch (err: unknown) {
        console.error('Error al evaluar MDX:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      }
    };
    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [content]);

  if (error) {
    return <div className="text-red-500 py-4">Error al renderizar: {error}</div>;
  }

  if (!MDXContent) {
    return <div className="text-center py-4">Cargando vista previa...</div>;
  }

  return (
    <div className={`mdx-preview ${className}`.trim()}>
      <div className="prose dark:prose-invert max-w-none">
        <MDXProvider components={mdxComponents}>
          <MDXContent components={mdxComponents} />
        </MDXProvider>
      </div>
    </div>
  );
}