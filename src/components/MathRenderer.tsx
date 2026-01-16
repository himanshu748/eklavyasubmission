import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Process the content to render LaTeX
    let processedContent = content;

    // First, handle escaped dollar signs to prevent them from being treated as math delimiters
    const escapedPlaceholder = '___ESCAPED_DOLLAR___';
    processedContent = processedContent.replace(/\\\$/g, escapedPlaceholder);

    // Replace display math ($$...$$) - handle multiline
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
        });
        return `<div class="katex-display my-4">${rendered}</div>`;
      } catch (e) {
        console.error('KaTeX display error:', e, 'Math:', math);
        return `<code class="bg-muted px-2 py-1 rounded text-sm">${math}</code>`;
      }
    });

    // Replace inline math ($...$) - be more permissive with content
    processedContent = processedContent.replace(/\$([^$]+?)\$/g, (match, math) => {
      // Skip if it looks like a currency value (e.g., $100)
      if (/^\d+([.,]\d+)?$/.test(math.trim())) {
        return match;
      }
      
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          trust: true,
          strict: false,
        });
        return rendered;
      } catch (e) {
        console.error('KaTeX inline error:', e, 'Math:', math);
        return `<code class="bg-muted px-1 py-0.5 rounded text-sm">${math}</code>`;
      }
    });

    // Restore escaped dollar signs
    processedContent = processedContent.replace(new RegExp(escapedPlaceholder, 'g'), '$');

    // Handle line breaks
    processedContent = processedContent.replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`math-content leading-relaxed [&_.katex]:text-inherit ${className}`}
    />
  );
};

export default MathRenderer;
