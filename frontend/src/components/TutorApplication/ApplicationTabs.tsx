import { Button } from '../ui/button';

interface ApplicationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string }[];
}

export default function ApplicationTabs({ activeTab, onTabChange, tabs }: ApplicationTabsProps) {
  return (
    <div className="overflow-x-auto mb-6">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            className={`px-3 py-2 text-sm whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
