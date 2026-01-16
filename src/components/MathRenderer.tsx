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
    if (!containerRef.current) return;

    // Process the content to render LaTeX
    let processedContent = content;

    // Replace display math ($$...$$)
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-display">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
        })}</div>`;
      } catch (e) {
        console.error('KaTeX error:', e);
        return `<code>${math}</code>`;
      }
    });

    // Replace inline math ($...$)
    processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          trust: true,
        });
      } catch (e) {
        console.error('KaTeX error:', e);
        return `<code>${math}</code>`;
      }
    });

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`math-content leading-relaxed ${className}`}
    />
  );
};

export default MathRenderer;
