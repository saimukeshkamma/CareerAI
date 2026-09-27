import React from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  colorScheme?: 'auto' | 'blue' | 'purple' | 'emerald';
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 10,
  label,
  subLabel,
  colorScheme = 'auto'
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#3b82f6';
  if (colorScheme === 'auto') {
    if (percentage >= 85) strokeColor = '#10b981'; // emerald
    else if (percentage >= 70) strokeColor = '#3b82f6'; // blue
    else if (percentage >= 50) strokeColor = '#f59e0b'; // amber
    else strokeColor = '#ef4444'; // red
  } else if (colorScheme === 'emerald') {
    strokeColor = '#10b981';
  } else if (colorScheme === 'purple') {
    strokeColor = '#8b5cf6';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight text-white">{score}</span>
          {maxScore !== 100 && (
            <span className="text-[10px] text-slate-400 font-medium">/{maxScore}</span>
          )}
          {maxScore === 100 && (
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">%</span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-200">{label}</span>
      )}
      {subLabel && (
        <span className="text-[11px] text-slate-400">{subLabel}</span>
      )}
    </div>
  );
};
