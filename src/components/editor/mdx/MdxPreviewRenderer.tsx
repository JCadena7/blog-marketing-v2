import React, { useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import * as runtime from 'react/jsx-runtime';
import { compile } from '@mdx-js/mdx';

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
const ErrorContent: React.FC<{ readonly message: string }> = ({ message }) => (
  <div className="text-red-500">{message}</div>
);

interface MdxPreviewRendererProps {
  readonly content?: string;
}

export default function MdxPreviewRenderer({ content = '' }: MdxPreviewRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType>(() => EmptyContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const renderMdx = async () => {
      if (!content) {
        if (!cancelled) {
          setComponent(() => EmptyContent);
          setError(null);
        }
        return;
      }

      try {
        const code = await compile(content, {
          outputFormat: 'function-body',
          development: false,
          jsx: true
        });
        const { default: MDXContent } = await evaluateCompiled(String(code));
        if (!cancelled) {
          setComponent(() => MDXContent);
          setError(null);
        }
      } catch (err: unknown) {
        const message = `Error al renderizar: ${err instanceof Error ? err.message : String(err)}`;
        console.error(message);
        if (!cancelled) {
          setError(message);
          setComponent(() => () => <ErrorContent message={message} />);
        }
      }
    };
    void renderMdx();
    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div className="mdx-preview">
      {error ? (
        <ErrorContent message={error} />
      ) : (
        <MDXProvider components={mdxComponents}>
          <Component />
        </MDXProvider>
      )}
    </div>
  );
}

async function evaluateCompiled(code: string) {
  const { Fragment, jsx, jsxs } = runtime;
  const fn = new Function('React', 'Fragment', 'jsx', 'jsxs', `${code}\nreturn MDXContent;`);
  return { default: fn(React, Fragment, jsx, jsxs) as React.ComponentType };
}