import React from 'react';
import { Home, CheckSquare, BarChart3, Award } from 'lucide-react';

export type TabType = 'home' | 'quests' | 'progress' | 'achievements';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  uncompletedQuestsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  uncompletedQuestsCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    {
      id: 'quests' as TabType,
      label: 'Quests',
      icon: CheckSquare,
      badge: uncompletedQuestsCount > 0 ? uncompletedQuestsCount : undefined,
    },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Award },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100/90 shadow-sm max-w-md md:max-w-xl mx-auto pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[9px] font-black leading-tight shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
