import { useState, useEffect } from 'react';

const TYPOGRAPHY_SECTIONS = {
  Display: [
    'kol-display-lg',
    'kol-display-section',
    'kol-display-subsection',
  ],
  Heading: [
    'kol-heading-xl',
    'kol-heading-lg',
    'kol-heading-md',
    'kol-heading-sm',
    'kol-heading-xs',
  ],
  Text: [
    'kol-text-lg',
    'kol-text-md',
    'kol-text-sm',
  ],
  Helpers: [
    'kol-helper-xl',
    'kol-helper-lg',
    'kol-helper-md',
    'kol-helper-s',
    'kol-helper-xs',
    'kol-helper-xxs',
    'kol-helper-xxxs',
  ],
};

function getCssProperty(name) {
  if (typeof window === 'undefined') return null;
  const element = document.createElement('div');
  element.className = name;
  element.style.display = 'none';
  document.body.appendChild(element);
  const styles = getComputedStyle(element);
  const fontFamily = styles.fontFamily;
  const fontSize = styles.fontSize;
  const fontWeight = styles.fontWeight;
  const lineHeight = styles.lineHeight;
  const textTransform = styles.textTransform;
  const letterSpacing = styles.letterSpacing;
  document.body.removeChild(element);

  return {
    fontFamily: fontFamily || null,
    fontSize: fontSize || null,
    fontWeight: fontWeight || null,
    lineHeight: lineHeight || null,
    textTransform: textTransform || null,
    letterSpacing: letterSpacing || null,
  };
}

function TypographyToken({ token }) {
  const [styles, setStyles] = useState(null);

  useEffect(() => {
    setStyles(getCssProperty(token));
  }, [token]);

  return (
    <div className="border border-fg-08 rounded-md p-4 bg-surface-secondary">
      <div className={token} style={{ marginBottom: '0.5rem' }}>
        The quick brown fox jumps over the lazy dog
      </div>
      <div className="text-xs text-fg-48 space-y-1">
        <div><code className="text-fg-64">{token}</code></div>
        {styles && (
          <>
            <div>Size: {styles.fontSize}</div>
            <div>Weight: {styles.fontWeight}</div>
            <div>Line Height: {styles.lineHeight}</div>
            {styles.textTransform && styles.textTransform !== 'none' && (
              <div>Transform: {styles.textTransform}</div>
            )}
            {styles.letterSpacing && styles.letterSpacing !== 'normal' && (
              <div>Letter Spacing: {styles.letterSpacing}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TypographyCategory({ name, tokens }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-4 text-fg-80 border-b border-fg-08 pb-2">{name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <TypographyToken key={token} token={token} />
        ))}
      </div>
    </div>
  );
}

export default function Typography() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Typography</h2>
      {Object.entries(TYPOGRAPHY_SECTIONS).map(([category, tokens]) => (
        <TypographyCategory key={category} name={category} tokens={tokens} />
      ))}
    </div>
  );
}
