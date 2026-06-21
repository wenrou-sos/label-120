import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatch } from '../../context/MatchContext';
import { roleToChinese } from '../../utils/formatters';
import { getChampionById } from '../../data/mockData';
import type { Champion, PlayerRole } from '../../types/match';

const ROLE_ORDER: PlayerRole[] = ['top', 'jungle', 'mid', 'adc', 'support'];

const BAN_SLOTS_PHASE1 = [0, 1, 2, 3, 4, 5];
const PICK_SLOTS_PHASE1 = [6, 7, 8, 9, 10, 11];
const BAN_SLOTS_PHASE2 = [12, 13, 14, 15];
const PICK_SLOTS_PHASE2 = [16, 17, 18, 19];

export const BanPick: React.FC = () => {
  const { data, advanceBPStep } = useMatch();
  const { blueTeam, redTeam, banPick, format, currentGame, totalGames, title } = data;

  if (!banPick) return null;

  const currentSlot = banPick.slots[banPick.currentSlotIndex];
  const currentTeam = currentSlot?.team;
  const currentAction = currentSlot?.action;

  const bannedIds = useMemo(() => [...banPick.blueBans, ...banPick.redBans], [banPick.blueBans, banPick.redBans]);
  const pickedIds = useMemo(
    () => [...banPick.bluePicks.map((p) => p.championId), ...banPick.redPicks.map((p) => p.championId)],
    [banPick.bluePicks, banPick.redPicks]
  );

  const bluePicksByRole = useMemo(() => {
    const map: Record<string, { championId: string; role: PlayerRole } | undefined> = {};
    ROLE_ORDER.forEach((r) => {
      map[r] = banPick.bluePicks.find((p) => p.role === r);
    });
    return map;
  }, [banPick.bluePicks]);

  const redPicksByRole = useMemo(() => {
    const map: Record<string, { championId: string; role: PlayerRole } | undefined> = {};
    ROLE_ORDER.forEach((r) => {
      map[r] = banPick.redPicks.find((p) => p.role === r);
    });
    return map;
  }, [banPick.redPicks]);

  const getChampionStatus = (champion: Champion): 'available' | 'banned-blue' | 'banned-red' | 'picked-blue' | 'picked-red' => {
    if (banPick.blueBans.includes(champion.id)) return 'banned-blue';
    if (banPick.redBans.includes(champion.id)) return 'banned-red';
    if (banPick.bluePicks.some((p) => p.championId === champion.id)) return 'picked-blue';
    if (banPick.redPicks.some((p) => p.championId === champion.id)) return 'picked-red';
    return 'available';
  };

  const renderBanSlots = (team: 'blue' | 'red') => {
    const slots = banPick.slots.filter((s) => s.team === team && s.action === 'ban');
    return (
      <div className="flex gap-1.5 md:gap-2 justify-center">
        {slots.map((slot) => {
          const champion = slot.championId ? getChampionById(slot.championId) : null;
          const isCurrent = slot.order === banPick.currentSlotIndex;
          const borderColor = team === 'blue' ? 'border-esports-blue' : 'border-esports-red';
          const glowClass = team === 'blue' ? 'glow-border-blue' : 'glow-border-red';

          return (
            <motion.div
              key={slot.id}
              layout
              className={`relative w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 flex items-center justify-center ${
                slot.completed ? `${borderColor} ${glowClass}` : 'border-white/10'
              } ${isCurrent ? 'ring-2 ring-esports-purple ring-offset-1 ring-offset-esports-bg animate-pulse-glow' : ''} bg-white/[0.02]`}
            >
              {champion ? (
                <>
                  <span className="text-xl md:text-2xl grayscale opacity-60">{champion.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-esports-red text-lg md:text-xl font-black">✕</span>
                  </div>
                </>
              ) : (
                <span className="text-white/20 text-xs md:text-sm">B{slot.phase === 1 ? '1' : '2'}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPickRow = (team: 'blue' | 'red', picksByRole: Record<string, any>) => {
    const textColor = team === 'blue' ? 'text-esports-blue' : 'text-esports-red';
    const borderColor = team === 'blue' ? 'border-esports-blue' : 'border-esports-red';
    const glowClass = team === 'blue' ? 'glow-border-blue' : 'glow-border-red';

    return ROLE_ORDER.map((role) => {
      const pick = picksByRole[role];
      const champion = pick ? getChampionById(pick.championId) : null;

      return (
        <motion.div
          key={role}
          layout
          className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-white/[0.02] border ${
            champion ? `${borderColor}/30` : 'border-white/5'
          } ${team === 'blue' ? 'flex-row' : 'flex-row-reverse'}`}
        >
          <div
            className={`relative w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center border-2 ${
              champion ? `${borderColor} ${glowClass}` : 'border-white/10 border-dashed'
            } bg-gradient-to-br ${champion ? (team === 'blue' ? 'from-esports-blue/10 to-transparent' : 'from-esports-red/10 to-transparent') : 'from-transparent to-transparent'}`}
          >
            {champion ? (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-xl md:text-2xl"
              >
                {champion.icon}
              </motion.span>
            ) : (
              <span className="text-white/20 text-[9px] md:text-[10px] font-display uppercase">{role}</span>
            )}
          </div>
          <div className={`flex-1 min-w-0 ${team === 'blue' ? 'text-left' : 'text-right'}`}>
            <div className={`font-display text-[10px] md:text-xs uppercase tracking-wider ${textColor}/70`}>
              {roleToChinese(role)}
            </div>
            <div className={`font-display font-bold text-xs md:text-sm truncate ${champion ? 'text-white' : 'text-white/30'}`}>
              {champion?.name || '待定'}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  const renderPhaseIndicator = () => {
    const phases = [
      { label: '禁用 1', slots: BAN_SLOTS_PHASE1, type: 'ban' },
      { label: '选人 1', slots: PICK_SLOTS_PHASE1, type: 'pick' },
      { label: '禁用 2', slots: BAN_SLOTS_PHASE2, type: 'ban' },
      { label: '选人 2', slots: PICK_SLOTS_PHASE2, type: 'pick' },
    ];

    return (
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
        {phases.map((phase, idx) => {
          const phaseStart = phase.slots[0];
          const phaseEnd = phase.slots[phase.slots.length - 1];
          const isActive = banPick.currentSlotIndex >= phaseStart && banPick.currentSlotIndex <= phaseEnd;
          const isDone = banPick.currentSlotIndex > phaseEnd;

          return (
            <React.Fragment key={phase.label}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-display tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-esports-purple/30 text-esports-purple border border-esports-purple/50'
                    : isDone
                    ? 'bg-esports-green/15 text-esports-green/80 border border-esports-green/30'
                    : 'bg-white/[0.03] text-white/40 border border-white/5'
                }`}
              >
                <span>{phase.type === 'ban' ? '🚫' : '✓'}</span>
                <span>{phase.label}</span>
                {isDone && <span className="text-esports-green">✓</span>}
              </div>
              {idx < phases.length - 1 && <div className={`w-6 md:w-10 h-px ${isDone ? 'bg-esports-green/30' : 'bg-white/10'}`} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const timerColor = banPick.timeLeft <= 5 ? 'text-esports-red' : banPick.timeLeft <= 10 ? 'text-esports-gold' : 'text-white';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-4 pb-8 px-3 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 md:mb-6">
          <div className="font-display text-[10px] md:text-xs uppercase tracking-[0.3em] text-esports-text-muted mb-1">
            {title}
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="font-display font-black text-2xl md:text-3xl text-esports-blue">{blueTeam.name}</div>
            <div className="flex flex-col items-center">
              <div className="font-display text-[9px] md:text-[10px] text-esports-purple uppercase tracking-wider">
                {format} · 第 {currentGame}/{totalGames} 局
              </div>
              <div className="flex items-center gap-2 my-1">
                <div className={`text-2xl md:text-3xl font-black number-display ${blueTeam.score >= redTeam.score ? 'text-esports-blue' : 'text-white/50'}`}>
                  {blueTeam.score}
                </div>
                <div className="text-esports-gray/50 text-lg">:</div>
                <div className={`text-2xl md:text-3xl font-black number-display ${redTeam.score >= blueTeam.score ? 'text-esports-red' : 'text-white/50'}`}>
                  {redTeam.score}
                </div>
              </div>
              <div className="font-display text-[10px] md:text-xs text-esports-gold uppercase tracking-widest animate-pulse">
                ⚔️ BAN / PICK
              </div>
            </div>
            <div className="font-display font-black text-2xl md:text-3xl text-esports-red">{redTeam.name}</div>
          </div>
        </div>

        {renderPhaseIndicator()}

        <div className="text-center mb-4">
          <motion.div
            layout
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border ${
              currentTeam === 'blue'
                ? 'bg-esports-blue/10 border-esports-blue/40'
                : currentTeam === 'red'
                ? 'bg-esports-red/10 border-esports-red/40'
                : 'bg-esports-green/10 border-esports-green/40'
            }`}
          >
            <span className={`text-base md:text-lg ${currentTeam === 'blue' ? 'text-esports-blue' : currentTeam === 'red' ? 'text-esports-red' : 'text-esports-green'}`}>
              {currentTeam === 'blue' ? blueTeam.logo : currentTeam === 'red' ? redTeam.logo : '✅'}
            </span>
            <span className={`font-display font-bold text-sm md:text-base ${currentTeam === 'blue' ? 'text-esports-blue' : currentTeam === 'red' ? 'text-esports-red' : 'text-esports-green'}`}>
              {banPick.isComplete
                ? 'BP 完成，比赛即将开始'
                : `${currentTeam === 'blue' ? blueTeam.name : redTeam.name} ${currentAction === 'ban' ? '禁用英雄' : '选择英雄'}`}
            </span>
            <AnimatePresence mode="wait">
              {!banPick.isComplete && (
                <motion.div
                  key={banPick.timeLeft}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`font-black font-display text-lg md:text-xl number-display tabular-nums ${timerColor} ${banPick.timeLeft <= 5 ? 'animate-pulse' : ''}`}
                >
                  {banPick.timeLeft}s
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-2 md:gap-4 mb-4">
          <div className="col-span-3 space-y-2">
            <div className="glass-card p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{blueTeam.logo}</span>
                <span className="font-display font-bold text-sm md:text-base text-esports-blue">{blueTeam.name}</span>
                <span className="ml-auto text-[9px] md:text-[10px] text-esports-text-muted uppercase tracking-wider">禁用</span>
              </div>
              {renderBanSlots('blue')}
            </div>
          </div>

          <div className="col-span-6">
            <div className="glass-card p-3 md:p-4">
              <div className="text-center text-[10px] md:text-xs text-esports-text-muted uppercase tracking-widest font-display mb-3">
                英雄池 ({bannedIds.length + pickedIds.length}/{banPick.champions.length} 已使用)
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 md:gap-2">
                {banPick.champions.map((champion) => {
                  const status = getChampionStatus(champion);
                  const isAvailable = status === 'available';

                  let borderClass = 'border-white/10';
                  let bgClass = 'bg-white/[0.03] hover:bg-white/[0.08]';
                  let overlay: React.ReactNode = null;

                  if (status === 'banned-blue') {
                    borderClass = 'border-esports-blue/50';
                    bgClass = 'bg-esports-blue/10';
                    overlay = <div className="absolute inset-0 flex items-center justify-center"><span className="text-esports-blue text-xl md:text-2xl font-black">✕</span></div>;
                  } else if (status === 'banned-red') {
                    borderClass = 'border-esports-red/50';
                    bgClass = 'bg-esports-red/10';
                    overlay = <div className="absolute inset-0 flex items-center justify-center"><span className="text-esports-red text-xl md:text-2xl font-black">✕</span></div>;
                  } else if (status === 'picked-blue') {
                    borderClass = 'border-esports-blue/70 glow-border-blue';
                    bgClass = 'bg-esports-blue/15';
                  } else if (status === 'picked-red') {
                    borderClass = 'border-esports-red/70 glow-border-red';
                    bgClass = 'bg-esports-red/15';
                  }

                  return (
                    <motion.div
                      key={champion.id}
                      whileHover={isAvailable ? { scale: 1.05, y: -2 } : {}}
                      className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${borderClass} ${bgClass} ${!isAvailable ? 'opacity-50 grayscale' : ''}`}
                      onClick={() => {
                        if (isAvailable) advanceBPStep();
                      }}
                    >
                      <span className={`text-lg md:text-2xl ${!isAvailable ? 'grayscale' : ''}`}>{champion.icon}</span>
                      <span className="text-[8px] md:text-[9px] text-esports-text-muted mt-0.5 truncate w-full text-center">{champion.name}</span>
                      {overlay}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-center gap-3 text-[9px] md:text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-white/[0.03] border border-white/10" />
                  <span className="text-esports-text-muted">可选</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-esports-blue/10 border border-esports-blue/50" />
                  <span className="text-esports-blue">蓝方禁用</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-esports-red/10 border border-esports-red/50" />
                  <span className="text-esports-red">红方禁用</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-esports-blue/15 border border-esports-blue/70" />
                  <span className="text-esports-blue">蓝方选择</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-esports-red/15 border border-esports-red/70" />
                  <span className="text-esports-red">红方选择</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3 space-y-2">
            <div className="glass-card p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="ml-auto text-[9px] md:text-[10px] text-esports-text-muted uppercase tracking-wider">禁用</span>
                <span className="font-display font-bold text-sm md:text-base text-esports-red">{redTeam.name}</span>
                <span className="text-lg">{redTeam.logo}</span>
              </div>
              {renderBanSlots('red')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 md:gap-4">
          <div className="col-span-5">
            <div className="glass-card p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{blueTeam.logo}</span>
                <span className="font-display font-bold text-sm md:text-base text-esports-blue">{blueTeam.name}</span>
                <span className="ml-auto text-[9px] md:text-[10px] text-esports-text-muted uppercase tracking-wider">
                  阵容 {banPick.bluePicks.length}/5
                </span>
              </div>
              <div className="space-y-2">{renderPickRow('blue', bluePicksByRole)}</div>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-esports-purple/30 to-esports-gold/20 flex items-center justify-center border-2 border-esports-purple/40">
                <span className="font-display font-black text-esports-gold text-lg md:text-2xl">VS</span>
              </div>
              <div className="mt-2 text-[9px] md:text-[10px] text-esports-text-muted uppercase tracking-widest font-display">
                {banPick.isComplete ? '阵容锁定' : '进行中'}
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <div className="glass-card p-3 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="ml-auto text-[9px] md:text-[10px] text-esports-text-muted uppercase tracking-wider">
                  阵容 {banPick.redPicks.length}/5
                </span>
                <span className="font-display font-bold text-sm md:text-base text-esports-red">{redTeam.name}</span>
                <span className="text-lg">{redTeam.logo}</span>
              </div>
              <div className="space-y-2">{renderPickRow('red', redPicksByRole)}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={advanceBPStep}
            disabled={banPick.isComplete}
            className="px-4 py-2 rounded-lg bg-esports-purple/20 hover:bg-esports-purple/30 text-esports-purple border border-esports-purple/40 disabled:opacity-40 disabled:cursor-not-allowed font-display text-xs md:text-sm transition-colors"
          >
            ⏭ 跳过当前步骤
          </button>
        </div>
      </div>
    </motion.div>
  );
};
