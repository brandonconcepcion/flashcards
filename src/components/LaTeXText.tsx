import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXTextProps {
  children: string;
  className?: string;
}

const LaTeXText: React.FC<LaTeXTextProps> = ({ children, className = '' }) => {
  // Function to parse text and render LaTeX
  const renderTextWithLaTeX = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let partKey = 0;

    // Regex patterns for LaTeX
    const blockMathPattern = /\$\$(.*?)\$\$/gs; // Block math: $$...$$
    const inlineMathPattern = /\$(.*?)\$/g; // Inline math: $...$

    // First, handle block math ($$...$$)
    let blockMatches: RegExpExecArray | null;
    const blockMathRanges: Array<{ start: number; end: number; content: string }> = [];
    
    while ((blockMatches = blockMathPattern.exec(text)) !== null) {
      blockMathRanges.push({
        start: blockMatches.index,
        end: blockMatches.index + blockMatches[0].length,
        content: blockMatches[1].trim()
      });
    }

    // Then handle inline math ($...$), but skip ranges that are already block math
    let inlineMatches: RegExpExecArray | null;
    const inlineMathRanges: Array<{ start: number; end: number; content: string }> = [];
    
    while ((inlineMatches = inlineMathPattern.exec(text)) !== null) {
      const start = inlineMatches.index;
      const end = start + inlineMatches[0].length;
      
      // Check if this range overlaps with any block math range
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
    const allMathRanges = [...blockMathRanges.map(r => ({ ...r, type: 'block' })), 
                          ...inlineMathRanges.map(r => ({ ...r, type: 'inline' }))]
      .sort((a, b) => a.start - b.start);

    // Process the text
    allMathRanges.forEach((mathRange) => {
      // Add text before the math
      if (currentIndex < mathRange.start) {
        const textPart = text.slice(currentIndex, mathRange.start);
        if (textPart) {
          parts.push(
            <span key={partKey++}>
              {textPart.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
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
        // If LaTeX parsing fails, show the original text
        console.warn('LaTeX parsing error:', error);
        parts.push(
          <span key={partKey++} className="math-error" title="LaTeX parsing error">
            {mathRange.type === 'block' ? `$$${mathRange.content}$$` : `$${mathRange.content}$`}
          </span>
        );
      }

      currentIndex = mathRange.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(
        <span key={partKey++}>
          {remainingText.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`latex-text ${className}`}>
      {renderTextWithLaTeX(children)}
    </div>
  );
};

export default LaTeXText;
