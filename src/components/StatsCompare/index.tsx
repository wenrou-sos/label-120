import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useMatch } from '../../context/MatchContext';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { formatKDA } from '../../utils/formatters';

interface StatBarProps {
  label: string;
  icon: string;
  blueValue: number;
  redValue: number;
  formatValue?: (v: number) => string;
  colorBlue?: string;
  colorRed?: string;
}

const StatBar: React.FC<StatBarProps> = memo(
  ({ label, icon, blueValue, redValue, formatValue, colorBlue = '#00D4FF', colorRed = '#FF3366' }) => {
    const animatedBlue = useAnimatedNumber(blueValue, 500, 0);
    const animatedRed = useAnimatedNumber(redValue, 500, 0);
    const displayBlue = formatValue ? formatValue(Math.round(animatedBlue)) : Math.round(animatedBlue);
    const displayRed = formatValue ? formatValue(Math.round(animatedRed)) : Math.round(animatedRed);

    const total = blueValue + redValue;
    const bluePct = total === 0 ? 50 : (blueValue / total) * 100;
    const redPct = total === 0 ? 50 : (redValue / total) * 100;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base md:text-lg">{icon}</span>
            <span className="text-[11px] md:text-xs font-bold text-esports-text-secondary uppercase tracking-wider">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-3 font-display number-display">
            <span
              className="font-bold text-sm md:text-base"
              style={{ color: blueValue > redValue ? colorBlue : blueValue === redValue ? '#94A3B8' : '#64748B' }}
            >
              {displayBlue}
            </span>
            <span className="text-esports-gray text-xs">VS</span>
            <span
              className="font-bold text-sm md:text-base"
              style={{ color: redValue > blueValue ? colorRed : redValue === blueValue ? '#94A3B8' : '#64748B' }}
            >
              {displayRed}
            </span>
          </div>
        </div>

        <div className="relative h-2 md:h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colorBlue}60, ${colorBlue})`,
              boxShadow: `0 0 10px ${colorBlue}40`,
            }}
            initial={{ width: '50%' }}
            animate={{ width: `${bluePct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute top-0 right-0 h-full rounded-full"
            style={{
              background: `linear-gradient(270deg, ${colorRed}60, ${colorRed})`,
              boxShadow: `0 0 10px ${colorRed}40`,
            }}
            initial={{ width: '50%' }}
            animate={{ width: `${redPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-esports-bg/80"
          />
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-display" style={{ color: `${colorBlue}80` }}>
            {blueValue >= redValue && blueValue > 0 ? '▲ 领先' : ''}
          </span>
          <span className="text-[10px] font-display" style={{ color: `${colorRed}80` }}>
            {redValue > blueValue && redValue > 0 ? '领先 ▲' : ''}
          </span>
        </div>
      </div>
    );
  }
);

StatBar.displayName = 'StatBar';

export const StatsCompare: React.FC = () => {
  const { data, isReplayMode, replayEvent } = useMatch();

  const blueStats = isReplayMode && replayEvent
    ? { ...data.blueTeam, ...replayEvent.replayData.blueStats }
    : data.blueTeam;

  const redStats = isReplayMode && replayEvent
    ? { ...data.redTeam, ...replayEvent.replayData.redStats }
    : data.redTeam;

  const blueKDA = formatKDA(blueStats.kills, blueStats.deaths, blueStats.assists);
  const redKDA = formatKDA(redStats.kills, redStats.deaths, redStats.assists);

  const objectives = [
    {
      label: '小龙',
      icon: '🐉',
      blue: blueStats.dragons,
      red: redStats.dragons,
    },
    {
      label: '大龙',
      icon: '👑',
      blue: blueStats.barons,
      red: redStats.barons,
    },
    {
      label: '峡谷',
      icon: '📯',
      blue: blueStats.heralds,
      red: redStats.heralds,
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card mx-3 md:mx-6 mt-4 p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-display font-bold text-sm md:text-base text-white">关键数据对比</h3>
        </div>
        {isReplayMode && (
          <span className="px-2.5 py-1 rounded-full bg-esports-gold/15 border border-esports-gold/30 text-esports-gold text-[10px] md:text-xs font-bold font-display">
            ⏪ 回放模式
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        <StatBar
          label="KDA 比率"
          icon="⚔️"
          blueValue={parseFloat(blueKDA) * 100}
          redValue={parseFloat(redKDA) * 100}
          formatValue={(v) => (v / 100).toFixed(2)}
        />
        <StatBar
          label="防御塔摧毁"
          icon="🏰"
          blueValue={blueStats.towers}
          redValue={redStats.towers}
        />
        <StatBar
          label="团队击杀"
          icon="💀"
          blueValue={blueStats.kills}
          redValue={redStats.kills}
        />
      </div>

      <div className="divider-glow my-5" />

      <div className="grid grid-cols-3 gap-4">
        {objectives.map((obj) => {
          const leading = obj.blue > obj.red ? 'blue' : obj.blue < obj.red ? 'red' : null;
          return (
            <div
              key={obj.label}
              className={`relative p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                leading === 'blue'
                  ? 'bg-esports-blue/5 border-esports-blue/30 glow-border-blue'
                  : leading === 'red'
                  ? 'bg-esports-red/5 border-esports-red/30 glow-border-red'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl md:text-3xl">{obj.icon}</span>
                <span className="text-[10px] md:text-xs font-bold text-esports-text-secondary uppercase tracking-wider">
                  {obj.label}
                </span>
                <div className="flex items-center gap-3 md:gap-4 font-display">
                  <span
                    className={`text-lg md:text-2xl font-black number-display ${
                      leading === 'blue' ? 'text-esports-blue' : 'text-esports-gray'
                    }`}
                  >
                    {obj.blue}
                  </span>
                  <span className="text-esports-gray text-sm font-bold">:</span>
                  <span
                    className={`text-lg md:text-2xl font-black number-display ${
                      leading === 'red' ? 'text-esports-red' : 'text-esports-gray'
                    }`}
                  >
                    {obj.red}
                  </span>
                </div>
              </div>
              {leading && (
                <div
                  className={`absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black font-display ${
                    leading === 'blue'
                      ? 'bg-esports-blue text-esports-bg'
                      : 'bg-esports-red text-white'
                  }`}
                >
                  LEAD
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
