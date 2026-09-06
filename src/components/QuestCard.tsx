import React from 'react';
import { motion } from 'motion/react';
import { Check, Flame } from 'lucide-react';
import { QuestDefinition } from '../types';

interface QuestCardProps {
  quest: QuestDefinition;
  isCompleted: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  isCompleted,
  disabled = false,
  onToggle,
}) => {
  const isZeroXp = quest.baseXp === 0;

  return (
    <motion.div
      layout
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all select-none ${
        isCompleted
          ? 'bg-sky-50/40 border-sky-200/90 shadow-xs'
          : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled) onToggle();
      }}
    >
      <div className="flex items-center gap-3.5 pr-2">
        {/* Custom rounded checkbox button */}
        <button
          type="button"
          disabled={disabled}
          aria-label={`Mark ${quest.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          className={`flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all shrink-0 ${
            isCompleted
              ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
              : 'border-slate-200 bg-slate-50/80 group-hover:border-slate-300 text-transparent'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onToggle();
          }}
        >
          <motion.div
            initial={false}
            animate={{ scale: isCompleted ? 1 : 0.6, opacity: isCompleted ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </motion.div>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              #{quest.order}
            </span>
            <h3
              className={`text-[15px] font-bold tracking-tight transition-colors ${
                isCompleted ? 'text-slate-900' : 'text-slate-800'
              }`}
            >
              {quest.title}
            </h3>
          </div>
          {quest.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {quest.description}
            </p>
          )}
        </div>
      </div>

      {/* XP Tag */}
      <div className="shrink-0 pl-2">
        {isZeroXp ? (
          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500">
            0 XP
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold tracking-wide transition-colors ${
              isCompleted
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-700'
            }`}
          >
            <span>+{quest.baseXp}</span>
            <span className="text-[10px] font-bold">XP</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};
