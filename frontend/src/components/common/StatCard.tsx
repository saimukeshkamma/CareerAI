import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badgeColor?: 'blue' | 'purple' | 'cyan' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badgeColor = 'blue'
}) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  };

  return (
    <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend.isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`p-3 rounded-xl border ${colorMap[badgeColor]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
