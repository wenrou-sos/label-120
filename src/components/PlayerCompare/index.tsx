import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { formatGold, formatKDA, roleToChinese } from '../../utils/formatters';
import type { Player, PlayerRole } from '../../types/match';

interface PlayerCompareProps {
  bluePlayer: Player;
  redPlayer: Player;
  onClose: () => void;
}

const AnimatedStat: React.FC<{ value: number; format?: (v: number) => string; decimals?: number }> = memo(
  ({ value, format, decimals = 0 }) => {
    const animated = useAnimatedNumber(value, 400, decimals);
    return (
      <span className="number-display">
        {format ? format(animated) : Math.round(animated)}
      </span>
    );
  }
);

AnimatedStat.displayName = 'AnimatedStat';

interface CompareBarRowProps {
  label: string;
  blueValue: number;
  redValue: number;
  blueColor: string;
  redColor: string;
  format?: (v: number) => string;
  decimals?: number;
}

const CompareBarRow: React.FC<CompareBarRowProps> = memo(
  ({ label, blueValue, redValue, blueColor, redColor, format, decimals = 0 }) => {
    const maxVal = useMemo(() => Math.max(blueValue, redValue, 1), [blueValue, redValue]);
    const bluePct = (blueValue / maxVal) * 100;
    const redPct = (redValue / maxVal) * 100;
    const blueLeading = blueValue > redValue;
    const redLeading = redValue > blueValue;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] md:text-xs text-esports-text-muted">
          <span className="font-display tracking-wider uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-end">
            <span
              className={`text-xs md:text-sm font-bold font-display number-display mr-2 ${
                blueLeading ? 'text-esports-green' : blueColor
              }`}
            >
              <AnimatedStat value={blueValue} format={format} decimals={decimals} />
              {blueLeading && <span className="ml-1 text-esports-green">▲</span>}
            </span>
            <div className="flex-1 max-w-[120px] h-3 md:h-4 bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bluePct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute right-0 top-0 h-full ${
                  blueLeading
                    ? 'bg-gradient-to-l from-esports-green to-esports-green/50'
                    : 'bg-gradient-to-l from-esports-blue/70 to-esports-blue/30'
                }`}
                style={{
                  boxShadow: blueLeading ? '0 0 10px rgba(0, 255, 163, 0.5)' : 'none',
                }}
              />
            </div>
          </div>
          <div className="w-px h-4 bg-esports-gray/30" />
          <div className="flex-1 flex items-center">
            <div className="flex-1 max-w-[120px] h-3 md:h-4 bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${redPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute left-0 top-0 h-full ${
                  redLeading
                    ? 'bg-gradient-to-r from-esports-green to-esports-green/50'
                    : 'bg-gradient-to-r from-esports-red/70 to-esports-red/30'
                }`}
                style={{
                  boxShadow: redLeading ? '0 0 10px rgba(0, 255, 163, 0.5)' : 'none',
                }}
              />
            </div>
            <span
              className={`text-xs md:text-sm font-bold font-display number-display ml-2 ${
                redLeading ? 'text-esports-green' : redColor
              }`}
            >
              {redLeading && <span className="mr-1 text-esports-green">▲</span>}
              <AnimatedStat value={redValue} format={format} decimals={decimals} />
            </span>
          </div>
        </div>
      </div>
    );
  }
);

CompareBarRow.displayName = 'CompareBarRow';

export const PlayerCompare: React.FC<PlayerCompareProps> = memo(({ bluePlayer, redPlayer, onClose }) => {
  const blueKDA = parseFloat(formatKDA(bluePlayer.kills, bluePlayer.deaths, bluePlayer.assists));
  const redKDA = parseFloat(formatKDA(redPlayer.kills, redPlayer.deaths, redPlayer.assists));

  const compareItems = useMemo(
    () => [
      {
        key: 'kda',
        label: 'KDA',
        blueValue: blueKDA,
        redValue: redKDA,
        format: (v: number) => v.toFixed(2),
        decimals: 2,
      },
      {
        key: 'kills',
        label: '击杀',
        blueValue: bluePlayer.kills,
        redValue: redPlayer.kills,
      },
      {
        key: 'deaths',
        label: '死亡',
        blueValue: bluePlayer.deaths,
        redValue: redPlayer.deaths,
      },
      {
        key: 'assists',
        label: '助攻',
        blueValue: bluePlayer.assists,
        redValue: redPlayer.assists,
      },
      {
        key: 'cs',
        label: '补刀',
        blueValue: bluePlayer.cs,
        redValue: redPlayer.cs,
      },
      {
        key: 'gold',
        label: '经济',
        blueValue: bluePlayer.gold,
        redValue: redPlayer.gold,
        format: formatGold,
      },
      {
        key: 'damage',
        label: '伤害',
        blueValue: bluePlayer.damage,
        redValue: redPlayer.damage,
        format: formatGold,
      },
      {
        key: 'damageTaken',
        label: '承伤',
        blueValue: bluePlayer.damageTaken,
        redValue: redPlayer.damageTaken,
        format: formatGold,
      },
      {
        key: 'vision',
        label: '视野',
        blueValue: bluePlayer.visionScore,
        redValue: redPlayer.visionScore,
      },
    ],
    [blueKDA, redKDA, bluePlayer, redPlayer]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-esports-bg/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative w-full max-w-2xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-card p-4 md:p-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-esports-purple/40 to-transparent" />

          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl">⚔️</span>
              <div>
                <h3 className="font-display font-bold text-white text-sm md:text-base">对位对比</h3>
                <p className="text-[10px] md:text-xs text-esports-text-muted">
                  {roleToChinese(bluePlayer.role as PlayerRole)} · 同位置数据对比
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-esports-text-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-11 gap-2 md:gap-4 items-center mb-6 md:mb-8">
            <div className="col-span-5 text-center">
              <div className="relative inline-block">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-esports-blue/60 glow-border-blue">
                  <img src={bluePlayer.avatar} alt={bluePlayer.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-esports-card flex items-center justify-center border border-white/10 text-base md:text-lg">
                  {bluePlayer.championIcon}
                </div>
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-esports-blue flex items-center justify-center text-[9px] font-black font-display text-esports-bg">
                  {bluePlayer.level}
                </div>
              </div>
              <div className="mt-2 text-esports-blue font-display font-bold text-sm md:text-base">{bluePlayer.name}</div>
              <div className="text-[10px] md:text-xs text-esports-text-muted">{bluePlayer.champion}</div>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-esports-purple/30 to-esports-gold/30 flex items-center justify-center border border-esports-purple/30">
                <span className="font-display font-black text-esports-gold text-base md:text-xl">VS</span>
              </div>
            </div>

            <div className="col-span-5 text-center">
              <div className="relative inline-block">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-esports-red/60 glow-border-red">
                  <img src={redPlayer.avatar} alt={redPlayer.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-esports-card flex items-center justify-center border border-white/10 text-base md:text-lg">
                  {redPlayer.championIcon}
                </div>
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-esports-red flex items-center justify-center text-[9px] font-black font-display text-esports-bg">
                  {redPlayer.level}
                </div>
              </div>
              <div className="mt-2 text-esports-red font-display font-bold text-sm md:text-base">{redPlayer.name}</div>
              <div className="text-[10px] md:text-xs text-esports-text-muted">{redPlayer.champion}</div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-5">
            {compareItems.map((item) => (
              <CompareBarRow
                key={item.key}
                label={item.label}
                blueValue={item.blueValue}
                redValue={item.redValue}
                blueColor="text-esports-blue"
                redColor="text-esports-red"
                format={item.format}
                decimals={item.decimals}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] md:text-xs text-esports-text-muted">
              💡 点击任意空白处关闭对比
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

PlayerCompare.displayName = 'PlayerCompare';
