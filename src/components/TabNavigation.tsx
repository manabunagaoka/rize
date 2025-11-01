'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type TabType = 'leaderboard' | 'hm7' | 'h2026';

interface TabNavigationProps {
  defaultTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function TabNavigation({ defaultTab = 'leaderboard', onTabChange }: TabNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Sync with URL query params
  useEffect(() => {
    const tabParam = searchParams?.get('tab') as TabType;
    if (tabParam && ['leaderboard', 'hm7', 'h2026'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/?tab=${tab}`);
    onTabChange?.(tab);
  };

  const tabs = [
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: '👑', locked: false },
    { id: 'hm7' as TabType, label: 'HM7', icon: '🎓', locked: false },
    { id: 'h2026' as TabType, label: 'H2026', icon: '🔒', locked: true }
  ];

  return (
    <div className="border-b border-gray-800 mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isLocked = tab.locked;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && handleTabClick(tab.id)}
                disabled={isLocked}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-green-500 text-green-400' 
                    : isLocked
                    ? 'border-transparent text-gray-600 cursor-not-allowed'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                  ${!isLocked && 'cursor-pointer'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isLocked && <span className="text-xs text-gray-500">(+10% to unlock)</span>}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
