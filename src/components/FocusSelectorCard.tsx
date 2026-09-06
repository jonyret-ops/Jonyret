import React from 'react';
import { Target } from 'lucide-react';
import { FOCUS_XP_MAP } from '../constants';

interface FocusSelectorCardProps {
  currentRating: number; // 0 (unselected) or 1..5
  disabled?: boolean;
  onSelect: (rating: number) => void;
}

export const FocusSelectorCard: React.FC<FocusSelectorCardProps> = ({
  currentRating,
  disabled = false,
  onSelect,
}) => {
  const selectedObj = FOCUS_XP_MAP[currentRating];
  const earnedXp = selectedObj ? selectedObj.xp : 0;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      earnedXp > 0
        ? 'bg-sky-50/40 border-sky-200/90 shadow-xs'
        : 'bg-white border-slate-200/80 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">#14</span>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Daily Focus</h3>
            </div>
            <p className="text-xs text-slate-400">
              {selectedObj ? selectedObj.label : 'Select your focus rating (1–5)'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold tracking-wide ${
              earnedXp > 0
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <span>+{earnedXp}</span>
            <span className="text-[10px] font-bold">XP</span>
          </span>
        </div>
      </div>

      {/* 1–5 Selector Buttons */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const item = FOCUS_XP_MAP[rating];
          const isSelected = currentRating === rating;

          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(rating)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <span className="text-base font-black leading-tight">{rating}</span>
              <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                +{item.xp} XP
              </span>
            </button>
          );
        })}
      </div>

      {/* Active label display */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
        <span>1: Wasted</span>
        <span>2: Below Avg</span>
        <span>3: Solid</span>
        <span>4: Productive</span>
        <span>5: Locked In</span>
      </div>
    </div>
  );
};
