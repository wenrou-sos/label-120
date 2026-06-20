import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatch } from '../../context/MatchContext';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { formatGold, formatGoldDiff, formatKDA, roleToChinese } from '../../utils/formatters';
import type { Player, PlayerRole } from '../../types/match';

interface PlayerCardProps {
  player: Player;
  side: 'blue' | 'red';
  isLeading: boolean;
  index: number;
}

const AnimatedStat: React.FC<{ value: number; className?: string; format?: (v: number) => string; decimals?: number }> = memo(
  ({ value, className = '', format, decimals = 0 }) => {
    const animated = useAnimatedNumber(value, 400, decimals);
    return (
      <span className={`number-display ${className}`}>
        {format ? format(animated) : Math.round(animated)}
      </span>
    );
  }
);

AnimatedStat.displayName = 'AnimatedStat';

const PlayerCard: React.FC<PlayerCardProps> = memo(({ player, side, isLeading, index }) => {
  const [expanded, setExpanded] = useState(false);
  const isBlue = side === 'blue';
  const borderColor = isBlue ? 'rgba(0, 212, 255, ' : 'rgba(255, 51, 102, ';
  const textColor = isBlue ? 'text-esports-blue' : 'text-esports-red';
  const bgGlow = isBlue ? 'from-esports-blue/10' : 'from-esports-red/10';

  const kda = parseFloat(formatKDA(player.kills, player.deaths, player.assists));

  const staggerDelay = index * 0.03;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + staggerDelay }}
      className="relative w-full"
    >
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
          isLeading ? 'animate-pulse-glow' : ''
        }`}
        style={{
          color: isLeading ? '#00FFA3' : 'transparent',
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className={`relative bg-gradient-to-br ${bgGlow} to-white/[0.02] border backdrop-blur-sm p-3 md:p-4 transition-all duration-300 ${
            isLeading
              ? 'border-esports-green/40 bg-esports-green/5'
              : `border-[${borderColor}0.15)] hover:border-[${borderColor}0.35)]`
          }`}
          style={{
            borderColor: isLeading ? 'rgba(0, 255, 163, 0.4)' : `${borderColor}0.15)`,
          }}
        >
          {isLeading && (
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-esports-green text-esports-bg text-[9px] font-black font-display rounded-bl-lg">
              💰 领先
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 ${
                  isBlue ? 'border-esports-blue/60' : 'border-esports-red/60'
                }`}
                style={{
                  boxShadow: `0 0 12px ${isBlue ? 'rgba(0,212,255,0.3)' : 'rgba(255,51,102,0.3)'}`,
                }}
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-full h-full object-cover bg-esports-bg"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-lg bg-esports-card flex items-center justify-center border border-white/10 text-sm">
                {player.championIcon}
              </div>
              <div
                className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-display text-esports-bg ${
                  isBlue ? 'bg-esports-blue' : 'bg-esports-red'
                }`}
              >
                {player.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className={`font-display font-bold text-sm md:text-base truncate ${textColor}`}>
                    {player.name}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-esports-text-muted flex items-center gap-1">
                    <span className="opacity-70">{player.champion}</span>
                    <span className="text-esports-gray">·</span>
                    <span className="text-esports-gray">{roleToChinese(player.role)}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className={`font-display font-black text-sm md:text-base number-display ${textColor}`}>
                    {isLeading ? '+' : ''}
                    <AnimatedStat value={Math.abs(player.goldDiff)} format={formatGold} />
                  </div>
                  <div className="text-[10px] md:text-[11px] text-esports-text-muted font-display">
                    <AnimatedStat value={player.gold} format={formatGold} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-esports-green/20 text-esports-green text-[10px] md:text-xs font-bold font-display">
                    <AnimatedStat value={player.kills} />
                  </span>
                  <span className="text-esports-gray text-xs">/</span>
                  <span className="px-1.5 py-0.5 rounded bg-esports-red/20 text-esports-red text-[10px] md:text-xs font-bold font-display">
                    <AnimatedStat value={player.deaths} />
                  </span>
                  <span className="text-esports-gray text-xs">/</span>
                  <span className="px-1.5 py-0.5 rounded bg-esports-blue/20 text-esports-blue text-[10px] md:text-xs font-bold font-display">
                    <AnimatedStat value={player.assists} />
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-esports-text-muted">KDA</span>
                  <span
                    className={`font-display font-bold text-xs md:text-sm number-display ${
                      kda >= 5
                        ? 'text-esports-gold'
                        : kda >= 3
                        ? 'text-esports-green'
                        : 'text-esports-text-secondary'
                    }`}
                  >
                    <AnimatedStat value={kda} format={(v) => v.toFixed(2)} decimals={2} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {player.items.map((item, idx) => (
              <motion.div
                key={item.id + idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="relative group"
              >
                <div
                  className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm md:text-base hover:border-white/25 transition-colors"
                  title={`${item.name} - ${formatGold(item.price)}`}
                >
                  {item.icon}
                </div>
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, 6 - player.items.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center"
              >
                <span className="text-white/10 text-xs">+</span>
              </div>
            ))}

            <div className="ml-auto flex items-center gap-3 text-[10px] md:text-xs text-esports-text-muted">
              <div className="flex items-center gap-1">
                <span>🔪</span>
                <span className="font-display number-display text-esports-text-secondary">
                  <AnimatedStat value={player.cs} />
                </span>
                <span>CS</span>
              </div>
              <div className="text-esports-gray/50">
                {expanded ? '▲ 收起' : '▼ 详情'}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3 border-t border-white/5 grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[9px] text-esports-text-muted uppercase tracking-wider mb-1">输出</div>
                    <div className="font-display font-bold text-xs md:text-sm text-esports-gold number-display">
                      <AnimatedStat value={player.damage} format={(v) => formatGold(v)} />
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[9px] text-esports-text-muted uppercase tracking-wider mb-1">承伤</div>
                    <div className="font-display font-bold text-xs md:text-sm text-esports-red number-display">
                      <AnimatedStat value={player.damageTaken} format={(v) => formatGold(v)} />
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[9px] text-esports-text-muted uppercase tracking-wider mb-1">视野</div>
                    <div className="font-display font-bold text-xs md:text-sm text-esports-blue number-display">
                      <AnimatedStat value={player.visionScore} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
});

PlayerCard.displayName = 'PlayerCard';

const ROLE_ORDER: PlayerRole[] = ['top', 'jungle', 'mid', 'adc', 'support'];

export const PlayerCards: React.FC = () => {
  const { data } = useMatch();

  const { blueTeam, redTeam, players } = data;

  const { bluePlayers, redPlayers, leadingTeam } = useMemo(() => {
    const blue = players
      .filter((p) => p.teamId === blueTeam.id)
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

    const red = players
      .filter((p) => p.teamId === redTeam.id)
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

    const lead = blueTeam.totalGold > redTeam.totalGold ? 'blue' : redTeam.totalGold > blueTeam.totalGold ? 'red' : null;

    return { bluePlayers: blue, redPlayers: red, leadingTeam: lead };
  }, [players, blueTeam.id, redTeam.id, blueTeam.totalGold, redTeam.totalGold]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-3 md:mx-6 mt-4"
    >
      <div className="glass-card overflow-hidden">
        <div className="team-gradient-blue px-4 py-3 border-b border-esports-blue/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{blueTeam.logo}</span>
              <span className="font-display font-bold text-sm md:text-base text-esports-blue tracking-wider">
                {blueTeam.name}
              </span>
              {leadingTeam === 'blue' && (
                <span className="px-2 py-0.5 rounded-full bg-esports-green/20 text-esports-green text-[10px] font-bold font-display">
                  💎 经济领先 {formatGoldDiff(blueTeam.totalGold - redTeam.totalGold)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-esports-text-secondary">
              <span className="font-display number-display">塔 {blueTeam.towers}</span>
              <span className="text-esports-gray/50">|</span>
              <span className="font-display number-display">击杀 {blueTeam.kills}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 p-2 md:p-3">
          {bluePlayers.map((player, idx) => (
            <PlayerCard
              key={player.id}
              player={player}
              side="blue"
              isLeading={leadingTeam === 'blue' && player.goldDiff >= 0}
              index={idx}
            />
          ))}
        </div>

        <div className="divider-glow" />

        <div className="team-gradient-red px-4 py-3 border-b border-esports-red/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{redTeam.logo}</span>
              <span className="font-display font-bold text-sm md:text-base text-esports-red tracking-wider">
                {redTeam.name}
              </span>
              {leadingTeam === 'red' && (
                <span className="px-2 py-0.5 rounded-full bg-esports-green/20 text-esports-green text-[10px] font-bold font-display">
                  💎 经济领先 {formatGoldDiff(redTeam.totalGold - blueTeam.totalGold)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-esports-text-secondary">
              <span className="font-display number-display">塔 {redTeam.towers}</span>
              <span className="text-esports-gray/50">|</span>
              <span className="font-display number-display">击杀 {redTeam.kills}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 p-2 md:p-3">
          {redPlayers.map((player, idx) => (
            <PlayerCard
              key={player.id}
              player={player}
              side="red"
              isLeading={leadingTeam === 'red' && player.goldDiff >= 0}
              index={idx}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
