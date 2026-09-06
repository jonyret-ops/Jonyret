import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { SideQuestDefinition } from '../types';

interface SideQuestCardProps {
  quest: SideQuestDefinition;
  isCompleted: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const SideQuestCard: React.FC<SideQuestCardProps> = ({
  quest,
  isCompleted,
  disabled = false,
  onToggle,
}) => {
  return (
    <motion.div
      layout
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all select-none ${
        isCompleted
          ? 'bg-amber-50/40 border-amber-200/90 shadow-xs'
          : 'bg-white border-slate-200/70 hover:border-slate-300 shadow-xs'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled) onToggle();
      }}
    >
      <div className="flex items-center gap-3.5 pr-2">
        <button
          type="button"
          disabled={disabled}
          aria-label={`Mark ${quest.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          className={`flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all shrink-0 ${
            isCompleted
              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
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
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <h3
              className={`text-[15px] font-bold tracking-tight transition-colors ${
                isCompleted ? 'text-slate-900' : 'text-slate-800'
              }`}
            >
              {quest.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {quest.description}
          </p>
        </div>
      </div>

      <div className="shrink-0 pl-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold tracking-wide transition-colors ${
            isCompleted
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 group-hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <span>+{quest.xp}</span>
          <span className="text-[10px] font-bold">BONUS</span>
        </span>
      </div>
    </motion.div>
  );
};
