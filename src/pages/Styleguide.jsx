import { useState } from 'react';
import ColorPalette from '../components/styleguide/ColorPalette';
import Typography from '../components/styleguide/Typography';
import Icons from '../components/styleguide/Icons';
import Components from '../components/styleguide/Components';
import ThemeToggleButton from '../components/molecules/ThemeToggleButton';
import Icon from '../components/icons/Icon';

const TABS = [
  { id: 'components', label: 'Components', icon: 'component' },
  { id: 'colors', label: 'Colors', icon: 'color' },
  { id: 'typography', label: 'Typography', icon: 'type-01' },
  { id: 'icons', label: 'Icons', icon: 'pen' },
];

export default function Styleguide() {
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="flex min-h-screen bg-surface-primary">
      {/* Collapsed Icon Sidebar */}
      <aside className="w-24 border-r border-fg-08 bg-surface-primary sticky top-0 h-screen flex-shrink-0">
        <nav className="flex flex-col items-center justify-between h-full py-8">
          <div className="flex flex-col items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  activeTab === tab.id
                    ? 'bg-fg-08 text-auto'
                    : 'text-fg-48 hover:bg-fg-04 hover:text-auto'
                }`}
                aria-label={tab.label}
                title={tab.label}
              >
                <Icon name={tab.icon} size={20} />
              </button>
            ))}
          </div>

          <ThemeToggleButton />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'colors' && <ColorPalette />}
        {activeTab === 'typography' && <Typography />}
        {activeTab === 'icons' && <Icons />}
        {activeTab === 'components' && <Components />}
      </main>
    </div>
  );
}
