import { useState, useEffect } from 'react';

const COLOR_CATEGORIES = {
  Brand: [
    'kol-color-brand-sage',
    'kol-color-brand-yellow',
    'kol-color-brand-orange',
    'kol-color-brand-red',
    'kol-color-brand-green',
    'kol-color-brand-teal',
    'kol-color-absolute-white',
    'kol-color-absolute-black',
  ],
  Surface: [
    'kol-surface-primary',
    'kol-surface-on-primary',
    'kol-surface-secondary',
    'kol-surface-on-secondary',
    'kol-surface-tertiary',
    'kol-surface-on-tertiary',
    'kol-surface-inverse',
    'kol-surface-on-inverse',
  ],
  Accent: [
    'kol-accent-primary',
    'kol-accent-on-primary',
    'kol-accent-primary-strong',
  ],
  Status: [
    'kol-status-danger',
    'kol-status-on-danger',
    'kol-status-success',
    'kol-status-on-success',
    'kol-status-warning',
    'kol-status-on-warning',
    'kol-status-info',
    'kol-status-on-info',
  ],
  Border: [
    'kol-border-default',
    'kol-border-focus',
    'kol-focus-ring',
  ],
};

function getCssVariable(name) {
  if (typeof window === 'undefined') return null;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveColor(value) {
  if (!value || value === '') return null;

  // Handle color-mix functions - return a computed version
  if (value.includes('color-mix')) {
    // For preview purposes, we'll use the raw CSS variable
    return `var(${value.replace(/var\(([^)]+)\).*/i, '$1')})`;
  }

  return value;
}

function ColorSwatch({ token }) {
  const [colorValue, setColorValue] = useState(null);

  useEffect(() => {
    const value = getCssVariable(`--${token}`);
    const resolved = resolveColor(value);
    setColorValue(resolved || value);
  }, [token]);

  const displayValue = colorValue || `var(--${token})`;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="w-full h-16 rounded-md border border-fg-08 shadow-sm"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="flex flex-col">
        <code className="text-xs text-fg-64 font-mono">{token}</code>
        <span className="text-xs text-fg-48">{displayValue}</span>
      </div>
    </div>
  );
}

function ColorCategory({ name, tokens }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-fg-80">{name}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tokens.map((token) => (
          <ColorSwatch key={token} token={token} />
        ))}
      </div>
    </div>
  );
}

export default function ColorPalette() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
      {Object.entries(COLOR_CATEGORIES).map(([category, tokens]) => (
        <ColorCategory key={category} name={category} tokens={tokens} />
      ))}
    </div>
  );
}
