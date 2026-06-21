import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchProvider, useMatch } from './context/MatchContext';
import { HeaderInfo } from './components/HeaderInfo';
import { GoldChart } from './components/GoldChart';
import { StatsCompare } from './components/StatsCompare';
import { PlayerCards } from './components/PlayerCards';
import { EventTimeline } from './components/EventTimeline';
import { ResultPanel } from './components/ResultPanel';
import { BanPick } from './components/BanPick';

const DashboardContent: React.FC = () => {
  const { data } = useMatch();
  const isFinished = data.status === 'finished';
  const isBanPick = data.status === 'ban_pick';

  useEffect(() => {
    if ('ontouchstart' in window) {
      document.body.style.overscrollBehavior = 'none';
    }
  }, []);

  return (
    <div className="min-h-screen pb-10">
      <AnimatePresence mode="wait">
        {isBanPick ? (
          <motion.div
            key="banpick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <BanPick />
          </motion.div>
        ) : !isFinished ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <HeaderInfo />
            <GoldChart />
            <StatsCompare />
            <PlayerCards />
            <EventTimeline />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeaderInfo />
            <ResultPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mx-3 md:mx-6 mt-8 pt-4 border-t border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] md:text-xs text-esports-text-muted">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-esports-green animate-pulse" />
            <span className="font-display tracking-wider">ESPORTS REAL-TIME DASHBOARD v1.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span>数据每 1s 自动更新</span>
            <span className="hidden sm:inline text-esports-gray/50">·</span>
            <span className="hidden sm:inline">© 2026 LPL Official Stats</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MatchProvider>
      <DashboardContent />
    </MatchProvider>
  );
};

export default App;
