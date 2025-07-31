import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MarkdownTextProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ children, className = '', inline = false }) => {
  // Simple markdown parser that handles common Jupyter-style formatting
  const parseMarkdown = (text: string, inline: boolean): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const processLine = (line: string, lineIndex: number): React.ReactNode | null => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
          codeBlockContent = [];
          return null;
        } else {
          inCodeBlock = false;
          const codeContent = codeBlockContent.join('\n');
          const codeElement = (
            <pre key={`code-${lineIndex}`} className="code-block">
              <code className={`language-${codeBlockLanguage}`}>
                {codeContent}
              </code>
            </pre>
          );
          codeBlockContent = [];
          return codeElement;
        }
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // Handle headers
      if (line.startsWith('#')) {
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          
          // Create header element based on level
          const headerProps = {
            key: `header-${lineIndex}`,
            className: `markdown-header markdown-h${level}`,
            children: processInlineContent(text)
          };
          
          switch (level) {
            case 1: return <h1 {...headerProps} />;
            case 2: return <h2 {...headerProps} />;
            case 3: return <h3 {...headerProps} />;
            case 4: return <h4 {...headerProps} />;
            case 5: return <h5 {...headerProps} />;
            case 6: return <h6 {...headerProps} />;
            default: return <h3 {...headerProps} />;
          }
        }
      }

      // Handle blockquotes
      if (line.startsWith('>')) {
        const quoteText = line.slice(1).trim();
        return (
          <blockquote key={`quote-${lineIndex}`} className="markdown-blockquote">
            {processInlineContent(quoteText)}
          </blockquote>
        );
      }

      // Handle unordered lists
      if (line.match(/^\s*[-*+]\s+/)) {
        const indent = line.match(/^\s*/)?.[0].length || 0;
        const listText = line.replace(/^\s*[-*+]\s+/, '');
        return (
          <div key={`list-${lineIndex}`} className="markdown-list-item" style={{ marginLeft: `${indent * 20}px` }}>
            <span className="list-bullet">•</span>
            <span className="list-content">{processInlineContent(listText)}</span>
          </div>
        );
      }

      // Handle ordered lists
      if (line.match(/^\s*\d+\.\s+/)) {
        const indent = line.match(/^\s*/)?.[0].length || 0;
        const listMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (listMatch) {
          const number = listMatch[1];
          const listText = listMatch[2];
          return (
            <div key={`olist-${lineIndex}`} className="markdown-ordered-list-item" style={{ marginLeft: `${indent * 20}px` }}>
              <span className="list-number">{number}.</span>
              <span className="list-content">{processInlineContent(listText)}</span>
            </div>
          );
        }
      }

      // Handle horizontal rules
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/) || line.match(/^___+$/)) {
        return <hr key={`hr-${lineIndex}`} className="markdown-hr" />;
      }

      // Handle empty lines
      if (line.trim() === '') {
        return <div key={`empty-${lineIndex}`} className="markdown-empty-line" />;
      }

      // Handle regular paragraphs
     return inline ? (
        <span key={`p-${lineIndex}`} className="markdown-paragraph-inline">
            {processInlineContent(line)}
        </span>
        ) : (
        <p key={`p-${lineIndex}`} className="markdown-paragraph">
            {processInlineContent(line)}
        </p>
        );
    };

    // Process inline content (bold, italic, code, LaTeX)
    const processInlineContent = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      let partKey = 0;

      // First handle LaTeX (both block and inline)
      const blockMathPattern = /\$\$(.*?)\$\$/gs;
      const inlineMathPattern = /\$(.*?)\$/g;

      // Find block math first
      const blockMathRanges: Array<{ start: number; end: number; content: string }> = [];
      let blockMatches: RegExpExecArray | null;
      
      while ((blockMatches = blockMathPattern.exec(text)) !== null) {
        blockMathRanges.push({
          start: blockMatches.index,
          end: blockMatches.index + blockMatches[0].length,
          content: blockMatches[1].trim()
        });
      }

      // Find inline math, avoiding block math ranges
      const inlineMathRanges: Array<{ start: number; end: number; content: string }> = [];
      let inlineMatches: RegExpExecArray | null;
      
      while ((inlineMatches = inlineMathPattern.exec(text)) !== null) {
        const start = inlineMatches.index;
        const end = start + inlineMatches[0].length;
        
        const overlapsWithBlock = blockMathRanges.some(block => 
          (start >= block.start && start < block.end) || 
          (end > block.start && end <= block.end)
        );
        
        if (!overlapsWithBlock) {
          inlineMathRanges.push({
            start,
            end,
            content: inlineMatches[1].trim()
          });
        }
      }

      // Combine and sort all math ranges
      const allMathRanges = [
        ...blockMathRanges.map(r => ({ ...r, type: 'block' as const })), 
        ...inlineMathRanges.map(r => ({ ...r, type: 'inline' as const }))
      ].sort((a, b) => a.start - b.start);

      // Process text with LaTeX and other inline formatting
      allMathRanges.forEach((mathRange) => {
        // Process text before the math
        if (currentIndex < mathRange.start) {
          const textPart = text.slice(currentIndex, mathRange.start);
          if (textPart) {
            parts.push(...processTextFormatting(textPart, partKey));
            partKey += 100; // Leave room for sub-parts
          }
        }

        // Add the math part
        try {
          if (mathRange.type === 'block') {
            parts.push(
              <div key={partKey++} className="math-block">
                <BlockMath math={mathRange.content} />
              </div>
            );
          } else {
            parts.push(
              <span key={partKey++} className="math-inline">
                <InlineMath math={mathRange.content} />
              </span>
            );
          }
        } catch (error) {
          console.warn('LaTeX parsing error:', error);
          parts.push(
            <span key={partKey++} className="math-error" title="LaTeX parsing error">
              {mathRange.type === 'block' ? `$$${mathRange.content}$$` : `$${mathRange.content}$`}
            </span>
          );
        }

        currentIndex = mathRange.end;
      });

      // Process remaining text
      if (currentIndex < text.length) {
        const remainingText = text.slice(currentIndex);
        if (remainingText) {
          parts.push(...processTextFormatting(remainingText, partKey));
        }
      }

      return parts.length > 0 ? parts : [text];
    };

    // Process text formatting (bold, italic, code, etc.)
    const processTextFormatting = (text: string, baseKey: number): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      let partKey = baseKey;

      // Patterns for formatting (order matters!)
      const patterns = [
        { regex: /`([^`]+)`/g, type: 'code' },
        { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
        { regex: /\*([^*]+)\*/g, type: 'italic' },
        { regex: /__([^_]+)__/g, type: 'bold' },
        { regex: /_([^_]+)_/g, type: 'italic' },
      ];

      // Find all formatting ranges
      const formatRanges: Array<{ start: number; end: number; content: string; type: string }> = [];
      
      patterns.forEach(pattern => {
        let matches: RegExpExecArray | null;
        while ((matches = pattern.regex.exec(text)) !== null) {
          formatRanges.push({
            start: matches.index,
            end: matches.index + matches[0].length,
            content: matches[1],
            type: pattern.type
          });
        }
      });

      // Sort by start position
      formatRanges.sort((a, b) => a.start - b.start);

      // Remove overlapping ranges (keep the first one)
      const nonOverlappingRanges = formatRanges.filter((range, index) => {
        return !formatRanges.slice(0, index).some(prevRange => 
          (range.start >= prevRange.start && range.start < prevRange.end) ||
          (range.end > prevRange.start && range.end <= prevRange.end)
        );
      });

      // Process the text with formatting
      nonOverlappingRanges.forEach((formatRange) => {
        // Add text before the formatting
        if (currentIndex < formatRange.start) {
          const textPart = text.slice(currentIndex, formatRange.start);
          if (textPart) {
            parts.push(<span key={partKey++}>{textPart}</span>);
          }
        }

        // Add the formatted part
        const content = formatRange.content;
        switch (formatRange.type) {
          case 'bold':
            parts.push(<strong key={partKey++} className="markdown-bold">{content}</strong>);
            break;
          case 'italic':
            parts.push(<em key={partKey++} className="markdown-italic">{content}</em>);
            break;
          case 'code':
            parts.push(<code key={partKey++} className="markdown-inline-code">{content}</code>);
            break;
          default:
            parts.push(<span key={partKey++}>{content}</span>);
        }

        currentIndex = formatRange.end;
      });

      // Add remaining text
      if (currentIndex < text.length) {
        const remainingText = text.slice(currentIndex);
        if (remainingText) {
          parts.push(<span key={partKey++}>{remainingText}</span>);
        }
      }

      return parts.length > 0 ? parts : [<span key={partKey}>{text}</span>];
    };

    // Process all lines
    lines.forEach((line, index) => {
      const element = processLine(line, index);
      if (element !== null) {
        elements.push(element);
      }
    });

    return elements;
  };

  const content = parseMarkdown(children, inline);

  return inline ? (
    <span className={`markdown-inline-text ${className}`}>
        {content}
    </span>
    ) : (
    <div className={`markdown-text ${className}`}>
        {content}
    </div>
    );
};

export default MarkdownText;
