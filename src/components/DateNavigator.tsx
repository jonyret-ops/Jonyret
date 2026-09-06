import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addDays, formatDate, parseDate, getDaysDifference } from '../lib/calculations';
import { OFFICIAL_START_DATE } from '../constants';

export const DateNavigator: React.FC = () => {
  const { selectedDate, setSelectedDate, activeTodayDate, isDateFuture } = useApp();

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    setSelectedDate(activeTodayDate);
  };

  // Format date display: e.g. "Sunday, September 6"
  const dateObj = parseDate(selectedDate);
  const formattedDayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const formattedMonthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isToday = selectedDate === activeTodayDate;
  const isFuture = isDateFuture(selectedDate);

  // Day number relative to Arc Day 1 (Sept 6)
  const arcDayDiff = getDaysDifference(OFFICIAL_START_DATE, selectedDate);
  const arcDayLabel = arcDayDiff >= 0 ? `Day ${arcDayDiff + 1}` : 'Pre-Arc';

  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={handlePrevDay}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-sky-600">
            {arcDayLabel}
          </span>
          {isToday && (
            <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-bold">
              TODAY
            </span>
          )}
          {isFuture && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
              FUTURE (LOCKED)
            </span>
          )}
        </div>

        <span className="text-base font-extrabold text-slate-900 tracking-tight">
          {formattedDayOfWeek}, {formattedMonthDay}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {!isToday && (
          <button
            type="button"
            onClick={handleJumpToToday}
            className="h-9 px-2 rounded-xl flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:bg-sky-50 transition-all"
            title="Jump to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleNextDay}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
