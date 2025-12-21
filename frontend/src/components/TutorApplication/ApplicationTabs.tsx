import { Button } from '../ui/button';

interface ApplicationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string }[];
}

export default function ApplicationTabs({ activeTab, onTabChange, tabs }: ApplicationTabsProps) {
  return (
    <div className="flex space-x-4 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          variant={activeTab === tab.key ? 'default' : 'outline'}
          className={`px-4 py-2 ${
            activeTab === tab.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
