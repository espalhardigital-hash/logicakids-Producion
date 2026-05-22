import React, { useState } from 'react';
import './Fase3Styles.css';

interface TokenData {
  id: string;
  word: string;
  isNumeric: boolean;
  value?: number;
  isValid?: boolean; // true = important, false = distractor
}

interface DetectiveNotebookProps {
  textSegments: (string | TokenData)[];
  onDataFound: (value: number) => void;
}

export const DetectiveNotebook: React.FC<DetectiveNotebookProps> = ({ 
  textSegments,
  onDataFound 
}) => {
  const [selectedTokens, setSelectedTokens] = useState<Record<string, 'valid' | 'invalid'>>({});

  const handleTokenClick = (token: TokenData) => {
    if (selectedTokens[token.id]) return; // Ya fue seleccionado

    // Lógica visual del token
    const status = token.isValid ? 'valid' : 'invalid';
    setSelectedTokens(prev => ({ ...prev, [token.id]: status }));

    // Si es válido, lo extraemos y lo mandamos a la Estantería de Datos
    if (token.isValid && token.value !== undefined) {
      onDataFound(token.value);
    }
  };

  return (
    <div className="detective-notebook">
      <h2>Cuaderno del Detective</h2>
      <div className="detective-text">
        {textSegments.map((segment, index) => {
          if (typeof segment === 'string') {
            return <span key={`str-${index}`}>{segment} </span>;
          } else {
            const token = segment as TokenData;
            const statusClass = selectedTokens[token.id] ? `selected-${selectedTokens[token.id]}` : '';
            return (
              <span 
                key={token.id} 
                className={`token-word text-orange-400 font-bold ${statusClass}`}
                onClick={() => handleTokenClick(token)}
              >
                {token.word}{' '}
              </span>
            );
          }
        })}
      </div>
    </div>
  );
};
