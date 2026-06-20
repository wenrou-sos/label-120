import React, { useRef, useEffect, useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatch } from '../../context/MatchContext';
import { formatEventTime, eventTypeToIcon, eventTypeToColor, formatGameTime } from '../../utils/formatters';
import type { MatchEvent } from '../../types/match';

interface EventItemProps {
  event: MatchEvent;
  isSelected: boolean;
  isNew: boolean;
  onClick: () => void;
  index: number;
}

const EventItem: React.FC<EventItemProps> = memo(({ event, isSelected, isNew, onClick, index }) => {
  const isBlue = event.teamSide === 'blue';
  const isRed = event.teamSide === 'red';
  const sideColor = isBlue ? '#00D4FF' : isRed ? '#FF3366' : '#94A3B8';
  const eventColor = eventTypeToColor(event.type);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: isNew ? 20 : 0, scale: isNew ? 0.8 : 1 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isSelected ? 1.05 : isNew ? [1, 1.03, 1] : 1,
      }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.01, 0.2) }}
      className={`relative flex-shrink-0 w-44 md:w-52 p-3 rounded-xl text-left transition-all duration-300 border ${
        isSelected
          ? 'bg-esports-purple/15 border-esports-purple/50 shadow-glow-gold'
          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
      }`}
      style={{
        boxShadow: isSelected ? `0 0 20px ${eventColor}30` : undefined,
      }}
    >
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 0.6 }}
          className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-esports-red"
          style={{ boxShadow: '0 0 10px #FF3366' }}
        />
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{
              backgroundColor: `${eventColor}20`,
              border: `1px solid ${eventColor}40`,
            }}
          >
            {eventTypeToIcon(event.type)}
          </div>
          <div>
            <div
              className="text-[10px] font-bold font-display tracking-wider"
              style={{ color: eventColor }}
            >
              {event.type.toUpperCase().replace('_', ' ')}
            </div>
            <div
              className="font-display font-bold text-[11px] md:text-xs number-display"
              style={{ color: sideColor }}
            >
              {formatGameTime(event.time)}
            </div>
          </div>
        </div>
      </div>

      <div className="font-bold text-xs md:text-sm text-white leading-tight mb-1.5 line-clamp-2">
        {event.title}
      </div>

      <div className="text-[10px] md:text-[11px] text-esports-text-muted line-clamp-2 leading-snug">
        {event.description}
      </div>

      {(isBlue || isRed) && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
          <span
            className="text-[9px] md:text-[10px] font-bold font-display px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${sideColor}15`,
              color: sideColor,
            }}
          >
            {isBlue ? '🔵 蓝方' : '🔴 红方'}
          </span>
          {isSelected && (
            <span className="text-[10px] font-bold text-esports-gold">⏪ 回放中</span>
          )}
        </div>
      )}
    </motion.button>
  );
});

EventItem.displayName = 'EventItem';

export const EventTimeline: React.FC = () => {
  const { data, startReplay, exitReplay, isReplayMode, replayEvent, lastEventId } = useMatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    return [...data.events].sort((a, b) => a.time - b.time);
  }, [data.events]);

  const handleEventClick = (event: MatchEvent) => {
    if (selectedEventId === event.id) {
      setSelectedEventId(null);
      exitReplay();
    } else {
      setSelectedEventId(event.id);
      startReplay(event);
    }
  };

  useEffect(() => {
    if (scrollRef.current && lastEventId) {
      const lastEventElement = scrollRef.current.querySelector(`[data-event-id="${lastEventId}"]`);
      if (lastEventElement) {
        scrollRef.current.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }
  }, [lastEventId, sortedEvents.length]);

  useEffect(() => {
    if (sortedEvents.length > 5) {
      const timer = setTimeout(() => setShowScrollHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [sortedEvents.length]);

  const latestEvent = sortedEvents[sortedEvents.length - 1];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mx-3 md:mx-6 mt-4 mb-6"
    >
      <div className="glass-card overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h3 className="font-display font-bold text-sm md:text-base text-white">
              关键事件时间线
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-esports-purple/15 text-esports-purple text-[10px] md:text-xs font-bold font-display">
              {sortedEvents.length} 事件
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isReplayMode && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => {
                  setSelectedEventId(null);
                  exitReplay();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-esports-gold/20 border border-esports-gold/40 text-esports-gold text-[10px] md:text-xs font-bold font-display hover:bg-esports-gold/30 transition-colors"
              >
                <span>✕</span>
                退出回放
              </motion.button>
            )}
          </div>
        </div>

        {latestEvent && (
          <AnimatePresence>
            {!isReplayMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`px-4 py-3 border-b ${
                  latestEvent.teamSide === 'blue'
                    ? 'team-gradient-blue border-esports-blue/15'
                    : latestEvent.teamSide === 'red'
                    ? 'team-gradient-red border-esports-red/15'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 animate-event-pulse"
                    style={{
                      backgroundColor: `${eventTypeToColor(latestEvent.type)}20`,
                      border: `1px solid ${eventTypeToColor(latestEvent.type)}40`,
                      boxShadow: `0 0 15px ${eventTypeToColor(latestEvent.type)}30`,
                    }}
                  >
                    {eventTypeToIcon(latestEvent.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold font-display text-esports-gold tracking-wider">
                        🔥 LATEST
                      </span>
                      <span className="text-[10px] md:text-[11px] font-display text-esports-text-muted number-display">
                        {formatEventTime(latestEvent.time)} · {formatGameTime(latestEvent.time)}
                      </span>
                    </div>
                    <div className="font-bold text-sm md:text-base text-white mb-0.5">
                      {latestEvent.title}
                    </div>
                    <div className="text-xs md:text-sm text-esports-text-secondary line-clamp-1">
                      {latestEvent.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
            style={{
              scrollSnapType: 'x proximity',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {sortedEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-esports-text-muted">
                <span className="text-4xl mb-2 opacity-50">⚔️</span>
                <p className="text-sm">等待关键事件发生...</p>
              </div>
            ) : (
              sortedEvents.map((event, index) => (
                <div
                  key={event.id}
                  data-event-id={event.id}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <EventItem
                    event={event}
                    isSelected={isReplayMode && replayEvent?.id === event.id}
                    isNew={event.id === lastEventId && index === sortedEvents.length - 1}
                    onClick={() => handleEventClick(event)}
                    index={index}
                  />
                </div>
              ))
            )}

            {sortedEvents.length > 0 && (
              <div className="flex-shrink-0 w-4" />
            )}
          </div>

          <AnimatePresence>
            {showScrollHint && sortedEvents.length > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-esports-bg/80 backdrop-blur-sm border border-white/10 pointer-events-none"
              >
                <span className="text-[10px] text-esports-text-secondary">← 滑动查看</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-esports-text-secondary"
                >
                  →
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 pb-4">
          <div className="relative h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 flex">
              {sortedEvents.map((event, idx) => {
                const position = data.gameTime > 0 ? (event.time / data.gameTime) * 100 : (idx / Math.max(sortedEvents.length - 1, 1)) * 100;
                const isBlue = event.teamSide === 'blue';
                const isRed = event.teamSide === 'red';
                const color = isBlue ? '#00D4FF' : isRed ? '#FF3366' : eventTypeToColor(event.type);
                const isReplayPoint = replayEvent?.id === event.id;
                return (
                  <motion.div
                    key={event.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full cursor-pointer transition-all"
                    style={{
                      left: `${Math.max(2, Math.min(98, position))}%`,
                      backgroundColor: color,
                      boxShadow: isReplayPoint ? `0 0 8px ${color}, 0 0 16px ${color}` : `0 0 4px ${color}80`,
                      scale: isReplayPoint ? 1.8 : 1,
                    }}
                    whileHover={{ scale: 1.8 }}
                    onClick={() => handleEventClick(event)}
                    title={`${formatGameTime(event.time)} - ${event.title}`}
                  />
                );
              })}
            </div>
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-esports-blue/60 via-esports-purple/60 to-esports-red/60 rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: `${Math.min(100, (data.gameTime / (35 * 60)) * 100)}%`,
              }}
              transition={{ duration: 1 }}
              style={{ opacity: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-esports-text-muted font-display number-display">
            <span>00:00</span>
            <span>{formatGameTime(data.gameTime)}</span>
            <span>35:00</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
