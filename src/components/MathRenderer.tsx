import { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    // Process the content by finding math delimiters and rendering them
    let result = '';
    let i = 0;
    const text = content;

    while (i < text.length) {
      // Check for display math $$...$$
      if (text[i] === '$' && text[i + 1] === '$') {
        const start = i + 2;
        let end = text.indexOf('$$', start);
        if (end === -1) {
          // No closing $$, treat as regular text
          result += text[i];
          i++;
          continue;
        }
        const math = text.slice(start, end);
        try {
          const html = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          result += `<div class="katex-display" style="margin: 1rem 0; overflow-x: auto;">${html}</div>`;
        } catch (e) {
          console.error('KaTeX display error:', e);
          result += `<code style="background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem; display: block; margin: 0.5rem 0;">${escapeHtml(math)}</code>`;
        }
        i = end + 2;
        continue;
      }

      // Check for inline math $...$
      if (text[i] === '$') {
        const start = i + 1;
        let end = -1;
        
        // Find the closing $ (not $$)
        for (let j = start; j < text.length; j++) {
          if (text[j] === '$' && text[j + 1] !== '$') {
            end = j;
            break;
          }
        }
        
        if (end === -1 || end === start) {
          // No closing $ or empty, treat as regular text
          result += text[i];
          i++;
          continue;
        }
        
        const math = text.slice(start, end);
        
        // Skip if it looks like a currency amount
        if (/^\d+([.,]\d+)?$/.test(math.trim())) {
          result += text.slice(i, end + 1);
          i = end + 1;
          continue;
        }
        
        try {
          const html = katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          result += html;
        } catch (e) {
          console.error('KaTeX inline error:', e);
          result += `<code style="background: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 0.125rem;">${escapeHtml(math)}</code>`;
        }
        i = end + 1;
        continue;
      }

      // Regular character - handle newlines properly
      if (text[i] === '\n') {
        result += '<br/>';
      } else {
        result += escapeHtml(text[i]);
      }
      i++;
    }

    return result;
  }, [content]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

// Helper to escape HTML in regular text
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

export default MathRenderer;
