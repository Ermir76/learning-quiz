import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const LaTeXRenderer = ({ text }) => {
  // Split text by LaTeX delimiters and render each part
  const renderWithLaTeX = (text) => {
    // Handle both inline $...$ and block $$...$$ LaTeX
    const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block LaTeX
        const latex = part.slice(2, -2);
        return <BlockMath key={index} math={latex} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline LaTeX
        const latex = part.slice(1, -1);
        return <InlineMath key={index} math={latex} />;
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  return <span>{renderWithLaTeX(text)}</span>;
};

export default LaTeXRenderer;