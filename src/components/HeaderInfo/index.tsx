import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatch } from '../../context/MatchContext';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

const ScoreNumber: React.FC<{ value: number; color: string }> = memo(({ value, color }) => {
  const animated = useAnimatedNumber(value, 400, 0);
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`font-display font-black text-5xl md:text-7xl number-display ${color}`}
    >
      {animated}
    </motion.span>
  );
});

ScoreNumber.displayName = 'ScoreNumber';

const GameTime: React.FC<{ seconds: number; isPaused: boolean }> = memo(({ seconds, isPaused }) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const animatedMins = useAnimatedNumber(mins, 300, 0);
  const animatedSecs = useAnimatedNumber(secs, 300, 0);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        animate={isPaused ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="font-display font-bold text-2xl md:text-3xl tracking-wider number-display text-white">
          {`${animatedMins.toString().padStart(2, '0')}:${animatedSecs.toString().padStart(2, '0')}`}
        </div>
        {isPaused && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs text-esports-gold font-bold animate-breathing">
              ⏸ 暂停中
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
});

GameTime.displayName = 'GameTime';

export const HeaderInfo: React.FC = () => {
  const { data, togglePause } = useMatch();
  const { blueTeam, redTeam, status, currentGame, totalGames, format, gameTime, title } = data;
  const isPaused = status === 'paused';
  const isDecisive = currentGame === totalGames;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-esports-blue/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative glass-card mx-3 md:mx-6 mt-4 p-4 md:p-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-esports-blue/40 to-transparent" />

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-esports-red animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-esports-red tracking-wider font-display">
            LIVE
          </span>
          <span className="text-xs md:text-sm text-esports-gray mx-2">|</span>
          <span className="text-xs md:text-sm text-esports-text-secondary">{title}</span>
        </div>

        <div className="flex items-center justify-between md:justify-around">
          <motion.div
            className="flex flex-col items-center gap-2 md:gap-3 flex-1 max-w-[200px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-esports-blue/20 to-transparent flex items-center justify-center glow-border-blue">
              <span className="text-3xl md:text-5xl">{blueTeam.logo}</span>
            </div>
            <div className="text-center">
              <div className="text-esports-blue font-bold text-base md:text-xl font-display tracking-wider">
                {blueTeam.name}
              </div>
              <div className="text-[10px] md:text-xs text-esports-text-muted mt-0.5">
                蓝色方
              </div>
            </div>
            <ScoreNumber value={blueTeam.score} color="text-esports-blue" />
          </motion.div>

          <div className="flex flex-col items-center gap-2 md:gap-4 px-2">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-esports-red/20 to-esports-blue/20 flex items-center justify-center">
                <span className="font-display font-black text-sm md:text-xl text-gradient-gold">
                  VS
                </span>
              </div>
            </div>

            <GameTime seconds={gameTime} isPaused={isPaused} />

            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-esports-purple/15 border border-esports-purple/30 text-esports-purple text-[10px] md:text-xs font-bold font-display">
                  {format}
                </span>
                <AnimatePresence>
                  {isDecisive && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-esports-gold/15 border border-esports-gold/30 text-esports-gold text-[10px] md:text-xs font-bold font-display"
                    >
                      🔥 决胜局
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-[10px] md:text-xs text-esports-text-secondary font-display">
                当前比分 <span className="text-white font-bold">{blueTeam.score}</span>
                <span className="text-esports-gray mx-1">:</span>
                <span className="text-white font-bold">{redTeam.score}</span>
                <span className="text-esports-gray mx-1">·</span>
                第{currentGame}局
              </div>
            </div>

            <motion.button
              onClick={togglePause}
              className={`mt-1 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold font-display transition-all duration-300 ${
                isPaused
                  ? 'bg-esports-green/20 text-esports-green border border-esports-green/40 hover:bg-esports-green/30'
                  : 'bg-esports-gold/20 text-esports-gold border border-esports-gold/40 hover:bg-esports-gold/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? '▶ 继续比赛' : '⏸ 暂停比赛'}
            </motion.button>
          </div>

          <motion.div
            className="flex flex-col items-center gap-2 md:gap-3 flex-1 max-w-[200px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-esports-red/20 to-transparent flex items-center justify-center glow-border-red">
              <span className="text-3xl md:text-5xl">{redTeam.logo}</span>
            </div>
            <div className="text-center">
              <div className="text-esports-red font-bold text-base md:text-xl font-display tracking-wider">
                {redTeam.name}
              </div>
              <div className="text-[10px] md:text-xs text-esports-text-muted mt-0.5">
                红色方
              </div>
            </div>
            <ScoreNumber value={redTeam.score} color="text-esports-red" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-esports-bg/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="font-display text-4xl md:text-6xl font-black text-esports-gold mb-2"
              >
                ⏸
              </motion.div>
              <div className="font-display text-xl md:text-3xl font-bold text-white animate-breathing">
                比赛暂停中
              </div>
              <div className="text-esports-text-secondary text-sm mt-2">
                等待裁判恢复比赛...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
