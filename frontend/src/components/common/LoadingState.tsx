import React from 'react';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  steps?: string[];
  activeStepIndex?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "CareerAI is processing...",
  steps = [
    "Extracting text and structured sections",
    "Identifying technical competencies & keywords",
    "Calculating ATS compatibility score",
    "Synthesizing actionable recommendations"
  ],
  activeStepIndex = 1
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      {/* Animated Brain Visual */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 animate-pulse-subtle shadow-xl shadow-blue-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <h4 className="text-base font-bold text-white mb-2">{title}</h4>
      <p className="text-xs text-slate-400 mb-6">Our neural evaluation engine is reviewing your career profile.</p>

      {/* Steps checklist */}
      <div className="w-full space-y-3 text-left bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        {steps.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className={`text-xs font-medium ${
                isDone ? 'text-slate-300' : isCurrent ? 'text-blue-300 font-semibold' : 'text-slate-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
