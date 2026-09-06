import React, { useState, useEffect } from 'react';
import { Footprints, Moon, Plus, Check } from 'lucide-react';
import { calculateStepXp, calculateSleepXp } from '../lib/calculations';
import { XpProgressBar } from './XpProgressBar';

interface StepsCardProps {
  currentSteps: number;
  disabled?: boolean;
  onSave: (steps: number) => void;
}

export const StepsCard: React.FC<StepsCardProps> = ({
  currentSteps,
  disabled = false,
  onSave,
}) => {
  const [inputValue, setInputValue] = useState<string>(currentSteps > 0 ? String(currentSteps) : '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(currentSteps > 0 ? String(currentSteps) : '');
  }, [currentSteps]);

  const earnedXp = calculateStepXp(currentSteps);
  const target = 10000;

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseInt(inputValue.replace(/,/g, ''), 10);
    if (!isNaN(num)) {
      onSave(num);
    } else if (inputValue === '') {
      onSave(0);
    }
  };

  const handleQuickAdd = (amount: number) => {
    const updated = currentSteps + amount;
    setInputValue(String(updated));
    onSave(updated);
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      earnedXp > 0
        ? 'bg-sky-50/40 border-sky-200/90 shadow-xs'
        : 'bg-white border-slate-200/80 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">#18</span>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Steps</h3>
            </div>
            <p className="text-xs text-slate-400">10,000 step daily goal</p>
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

      <div className="flex items-center gap-3 my-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            value={inputValue}
            placeholder="Enter steps (e.g. 9,482)"
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Quick add pill buttons */}
        {!disabled && (
          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickAdd(1000)}
              className="h-11 px-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-xs font-bold transition-all border border-slate-200/60"
              title="Add 1,000 steps"
            >
              +1k
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(2500)}
              className="h-11 px-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-xs font-bold transition-all border border-slate-200/60"
              title="Add 2,500 steps"
            >
              +2.5k
            </button>
          </div>
        )}
      </div>

      {/* Progress towards 10k */}
      <div className="mt-3 pt-2 border-t border-slate-100">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>{currentSteps.toLocaleString()} / 10,000</span>
          <span>{Math.min(100, Math.round((currentSteps / target) * 100))}%</span>
        </div>
        <XpProgressBar current={currentSteps} total={target} heightClass="h-2" />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
          <span>4k (+2) • 6k (+4) • 7.5k (+6)</span>
          <span>9k (+8) • 10k+ (+10 XP)</span>
        </div>
      </div>
    </div>
  );
};

interface SleepCardProps {
  currentHours: number;
  disabled?: boolean;
  onSave: (hours: number) => void;
}

export const SleepCard: React.FC<SleepCardProps> = ({
  currentHours,
  disabled = false,
  onSave,
}) => {
  const [inputValue, setInputValue] = useState<string>(currentHours > 0 ? String(currentHours) : '');

  useEffect(() => {
    setInputValue(currentHours > 0 ? String(currentHours) : '');
  }, [currentHours]);

  const earnedXp = calculateSleepXp(currentHours);
  const target = 8.0;

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      onSave(num);
    } else if (inputValue === '') {
      onSave(0);
    }
  };

  const handleQuickPreset = (hrs: number) => {
    setInputValue(String(hrs));
    onSave(hrs);
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      earnedXp > 0
        ? 'bg-sky-50/40 border-sky-200/90 shadow-xs'
        : 'bg-white border-slate-200/80 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">#19</span>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Sleep</h3>
            </div>
            <p className="text-xs text-slate-400">Actual hours slept last night</p>
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

      <div className="flex items-center gap-3 my-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={inputValue}
            placeholder="Hours (e.g. 7.5)"
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Quick select buttons */}
        {!disabled && (
          <div className="flex gap-1.5 shrink-0">
            {[7.0, 7.5, 8.0].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className={`h-11 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                  currentHours === preset
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border-slate-200/60'
                }`}
              >
                {preset}h
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress towards 8h */}
      <div className="mt-3 pt-2 border-t border-slate-100">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>{currentHours} / 8.0 hours</span>
          <span>{Math.min(100, Math.round((currentHours / target) * 100))}%</span>
        </div>
        <XpProgressBar current={currentHours} total={target} heightClass="h-2" colorClass="bg-indigo-500" />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
          <span>&lt;5 (0) • 5h (+2) • 6h (+4)</span>
          <span>7h (+7) • 8h+ (+10 XP)</span>
        </div>
      </div>
    </div>
  );
};
