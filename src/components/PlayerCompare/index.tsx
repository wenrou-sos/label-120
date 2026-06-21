import React, { memo, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { formatGold, formatKDA, roleToChinese } from '../../utils/formatters';
import type { Player, PlayerRole } from '../../types/match';

interface PlayerCompareProps {
  bluePlayer: Player;
  redPlayer: Player;
  anchorRect: DOMRect;
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
  lowerIsBetter?: boolean;
  format?: (v: number) => string;
  decimals?: number;
}

const CompareBarRow: React.FC<CompareBarRowProps> = memo(
  ({ label, blueValue, redValue, blueColor, redColor, lowerIsBetter = false, format, decimals = 0 }) => {
    const maxVal = useMemo(() => Math.max(blueValue, redValue, 1), [blueValue, redValue]);
    const bluePct = (blueValue / maxVal) * 100;
    const redPct = (redValue / maxVal) * 100;

    const blueBetter = lowerIsBetter ? blueValue < redValue : blueValue > redValue;
    const redBetter = lowerIsBetter ? redValue < blueValue : redValue > blueValue;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] md:text-[10px] text-esports-text-muted">
          <span className="font-display tracking-wider uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="flex-1 flex items-center justify-end">
            <span
              className={`text-xs md:text-sm font-bold font-display number-display mr-1.5 md:mr-2 ${
                blueBetter ? 'text-esports-green' : blueColor
              }`}
            >
              <AnimatedStat value={blueValue} format={format} decimals={decimals} />
              {blueBetter && <span className="ml-1 text-esports-green text-[10px]">▲</span>}
            </span>
            <div className="flex-1 max-w-[100px] md:max-w-[120px] h-2.5 md:h-3 bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bluePct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute right-0 top-0 h-full ${
                  blueBetter
                    ? 'bg-gradient-to-l from-esports-green to-esports-green/50'
                    : 'bg-gradient-to-l from-esports-blue/70 to-esports-blue/30'
                }`}
                style={{
                  boxShadow: blueBetter ? '0 0 8px rgba(0, 255, 163, 0.5)' : 'none',
                }}
              />
            </div>
          </div>
          <div className="w-px h-3 bg-esports-gray/30" />
          <div className="flex-1 flex items-center">
            <div className="flex-1 max-w-[100px] md:max-w-[120px] h-2.5 md:h-3 bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${redPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`absolute left-0 top-0 h-full ${
                  redBetter
                    ? 'bg-gradient-to-r from-esports-green to-esports-green/50'
                    : 'bg-gradient-to-r from-esports-red/70 to-esports-red/30'
                }`}
                style={{
                  boxShadow: redBetter ? '0 0 8px rgba(0, 255, 163, 0.5)' : 'none',
                }}
              />
            </div>
            <span
              className={`text-xs md:text-sm font-bold font-display number-display ml-1.5 md:ml-2 ${
                redBetter ? 'text-esports-green' : redColor
              }`}
            >
              {redBetter && <span className="mr-1 text-esports-green text-[10px]">▲</span>}
              <AnimatedStat value={redValue} format={format} decimals={decimals} />
            </span>
          </div>
        </div>
      </div>
    );
  }
);

CompareBarRow.displayName = 'CompareBarRow';

export const PlayerCompare: React.FC<PlayerCompareProps> = memo(({ bluePlayer, redPlayer, anchorRect, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, direction: 'right' as 'left' | 'right' });

  useEffect(() => {
    const panelWidth = 340;
    const panelHeight = 480;
    const gap = 12;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = anchorRect.right + gap;
    let direction: 'left' | 'right' = 'right';

    if (left + panelWidth > viewportW - 8) {
      left = anchorRect.left - panelWidth - gap;
      direction = 'left';
      if (left < 8) {
        left = Math.max(8, (viewportW - panelWidth) / 2);
      }
    }

    let top = anchorRect.top;
    if (top + panelHeight > viewportH - 8) {
      top = Math.max(8, viewportH - panelHeight - 8);
    }

    setPosition({ top, left, direction });
  }, [anchorRect]);

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
        lowerIsBetter: true,
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

  const animationVariants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      x: position.direction === 'right' ? -20 : 20,
      transformOrigin: position.direction === 'right' ? 'left center' : 'right center',
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.15 },
    },
  };

  const content = (
    <>
      <div
        className="fixed inset-0 z-40 bg-esports-bg/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed z-50"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-[320px] md:w-[360px]">
          <div
            className={`absolute top-4 w-0 h-0 border-y-8 border-y-transparent ${
              position.direction === 'right'
                ? '-left-2 border-r-8 border-r-white/[0.08]'
                : '-right-2 border-l-8 border-l-white/[0.08]'
            }`}
          />

          <div className="glass-card p-3.5 md:p-5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-esports-purple/40 to-transparent" />

            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-base md:text-lg">⚔️</span>
                <div>
                  <h3 className="font-display font-bold text-white text-xs md:text-sm">对位对比</h3>
                  <p className="text-[9px] md:text-[10px] text-esports-text-muted">
                    {roleToChinese(bluePlayer.role as PlayerRole)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-esports-text-muted hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-11 gap-1.5 md:gap-3 items-center mb-4 md:mb-5">
              <div className="col-span-5 text-center">
                <div className="relative inline-block">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-esports-blue/60 glow-border-blue">
                    <img src={bluePlayer.avatar} alt={bluePlayer.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 md:w-6 md:h-6 rounded-md bg-esports-card flex items-center justify-center border border-white/10 text-xs">
                    {bluePlayer.championIcon}
                  </div>
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-esports-blue flex items-center justify-center text-[8px] font-black font-display text-esports-bg">
                    {bluePlayer.level}
                  </div>
                </div>
                <div className="mt-1.5 text-esports-blue font-display font-bold text-xs md:text-sm">{bluePlayer.name}</div>
                <div className="text-[9px] md:text-[10px] text-esports-text-muted">{bluePlayer.champion}</div>
              </div>

              <div className="col-span-1 flex items-center justify-center">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-esports-purple/30 to-esports-gold/30 flex items-center justify-center border border-esports-purple/30">
                  <span className="font-display font-black text-esports-gold text-[10px] md:text-xs">VS</span>
                </div>
              </div>

              <div className="col-span-5 text-center">
                <div className="relative inline-block">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-esports-red/60 glow-border-red">
                    <img src={redPlayer.avatar} alt={redPlayer.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 md:w-6 md:h-6 rounded-md bg-esports-card flex items-center justify-center border border-white/10 text-xs">
                    {redPlayer.championIcon}
                  </div>
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-esports-red flex items-center justify-center text-[8px] font-black font-display text-esports-bg">
                    {redPlayer.level}
                  </div>
                </div>
                <div className="mt-1.5 text-esports-red font-display font-bold text-xs md:text-sm">{redPlayer.name}</div>
                <div className="text-[9px] md:text-[10px] text-esports-text-muted">{redPlayer.champion}</div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-3.5">
              {compareItems.map((item) => (
                <CompareBarRow
                  key={item.key}
                  label={item.label}
                  blueValue={item.blueValue}
                  redValue={item.redValue}
                  blueColor="text-esports-blue"
                  redColor="text-esports-red"
                  lowerIsBetter={(item as any).lowerIsBetter}
                  format={item.format}
                  decimals={item.decimals}
                />
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className="text-[9px] md:text-[10px] text-esports-text-muted">
                💡 点击空白处关闭
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  return createPortal(content, document.body);
});

PlayerCompare.displayName = 'PlayerCompare';
