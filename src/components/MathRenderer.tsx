import { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    let result = content;

    // Replace display math ($$...$$) first
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        const html = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
        });
        return `<div class="katex-display" style="margin: 1rem 0; overflow-x: auto;">${html}</div>`;
      } catch (e) {
        console.error('KaTeX display error:', e);
        return `<code style="background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${math}</code>`;
      }
    });

    // Replace inline math ($...$)
    result = result.replace(/\$([^$]+?)\$/g, (match, math) => {
      // Skip currency-like patterns
      if (/^\d+([.,]\d+)?$/.test(math.trim())) {
        return match;
      }
      
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (e) {
        console.error('KaTeX inline error:', e);
        return `<code style="background: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 0.125rem;">${math}</code>`;
      }
    });

    return result;
  }, [content]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default MathRenderer;
