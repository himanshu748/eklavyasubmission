import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    // Split content into parts: text and math expressions
    const parts: Array<{ type: 'text' | 'display-math' | 'inline-math'; content: string }> = [];
    let remaining = content;

    // Regex to find math expressions
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = mathRegex.exec(content)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }

      // Determine if it's display or inline math
      const mathContent = match[0];
      if (mathContent.startsWith('$$')) {
        parts.push({ type: 'display-math', content: mathContent.slice(2, -2).trim() });
      } else {
        parts.push({ type: 'inline-math', content: mathContent.slice(1, -1).trim() });
      }

      lastIndex = mathRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    // Render each part
    return parts.map((part, index) => {
      if (part.type === 'text') {
        return part.content;
      }

      try {
        const html = katex.renderToString(part.content, {
          displayMode: part.type === 'display-math',
          throwOnError: false,
          trust: true,
          strict: false,
        });

        if (part.type === 'display-math') {
          return `<div class="katex-display my-4 overflow-x-auto">${html}</div>`;
        }
        return html;
      } catch (e) {
        console.error('KaTeX error:', e, 'Content:', part.content);
        return `<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">${part.content}</code>`;
      }
    }).join('');
  }, [content]);

  return (
    <span
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default MathRenderer;
