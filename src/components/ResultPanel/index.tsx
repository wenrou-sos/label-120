import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMatch } from '../../context/MatchContext';
import { formatKDA, formatGold, formatGameTime, eventTypeToIcon, eventTypeToColor } from '../../utils/formatters';

echarts.use([RadarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const StatRow: React.FC<{
  label: string;
  blue: number | string;
  red: number | string;
  icon?: string;
  blueWinner?: boolean;
  redWinner?: boolean;
  isNumber?: boolean;
}> = memo(({ label, blue, red, icon, blueWinner, redWinner, isNumber = true }) => {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="w-16 md:w-20 text-xs md:text-sm text-esports-text-secondary font-bold flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div
        className={`flex-1 text-right font-display font-bold text-sm md:text-base number-display ${
          blueWinner ? 'text-esports-blue' : 'text-esports-text-secondary'
        }`}
      >
        {blueWinner && <span className="mr-1 text-esports-green">▲</span>}
        {isNumber ? Number(blue).toLocaleString() : blue}
      </div>
      <div className="text-esports-gray text-sm w-6 text-center">—</div>
      <div
        className={`flex-1 text-left font-display font-bold text-sm md:text-base number-display ${
          redWinner ? 'text-esports-red' : 'text-esports-text-secondary'
        }`}
      >
        {isNumber ? Number(red).toLocaleString() : red}
        {redWinner && <span className="ml-1 text-esports-green">▲</span>}
      </div>
    </div>
  );
});

StatRow.displayName = 'StatRow';

export const ResultPanel: React.FC = () => {
  const { data } = useMatch();
  const { blueTeam, redTeam, players, events, mvp, highlights, winner, gameTime } = data;

  const winnerTeam = winner === 'blue' ? blueTeam : winner === 'red' ? redTeam : null;

  const radarOption = useMemo(() => {
    if (!mvp) return null;
    const { criteria } = mvp;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(10, 14, 26, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: {
          color: '#F1F5F9',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 12,
        },
      },
      radar: {
        indicator: [
          { name: 'KDA贡献', max: 100 },
          { name: '输出能力', max: 100 },
          { name: '资源参与', max: 100 },
          { name: '经济效率', max: 100 },
          { name: '团战作用', max: 100 },
        ],
        center: ['50%', '52%'],
        radius: '62%',
        splitNumber: 4,
        axisName: {
          color: '#94A3B8',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(168, 85, 247, 0.15)',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(168, 85, 247, 0.02)', 'rgba(168, 85, 247, 0.04)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(168, 85, 247, 0.2)',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                criteria.kdaContribution,
                criteria.damageContribution,
                criteria.objectiveParticipation,
                criteria.goldEfficiency,
                criteria.teamfightImpact,
              ],
              name: 'MVP评分',
              areaStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: 'rgba(255, 215, 0, 0.4)' },
                  { offset: 1, color: 'rgba(168, 85, 247, 0.1)' },
                ]),
              },
              lineStyle: {
                color: '#FFD700',
                width: 2,
              },
              itemStyle: {
                color: '#FFD700',
                borderColor: '#FFA500',
                borderWidth: 2,
              },
              symbol: 'circle',
              symbolSize: 8,
            },
          ],
        },
      ],
    };
  }, [mvp]);

  const blueKDA = formatKDA(blueTeam.kills, blueTeam.deaths, blueTeam.assists);
  const redKDA = formatKDA(redTeam.kills, redTeam.deaths, redTeam.assists);

  const topPlayersByRole = useMemo(() => {
    return players
      .slice()
      .sort((a, b) => {
        const scoreA = (a.kills + a.assists) / Math.max(1, a.deaths) + a.damage / 10000;
        const scoreB = (b.kills + b.assists) / Math.max(1, b.deaths) + b.damage / 10000;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [players]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-3 md:mx-6 my-4 md:my-6"
    >
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-esports-gold/10 via-esports-purple/5 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-esports-gold/50 to-transparent" />

        <div className="relative glass-card overflow-visible">
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-6 md:py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-block mb-4"
            >
              <div className="text-5xl md:text-7xl mb-2">🏆</div>
            </motion.div>

            {winnerTeam && (
              <>
                <div className="font-display text-2xl md:text-4xl font-black text-gradient-gold mb-2 tracking-wider">
                  {winnerTeam.name} 获胜！
                </div>
                <div className="text-esports-text-secondary text-sm md:text-base mb-1">
                  {winner === 'blue' ? '蓝色方' : '红色方'}取得本场比赛胜利
                </div>
                <div className="text-esports-text-muted text-xs md:text-sm font-display">
                  总比分 {blueTeam.score} : {redTeam.score} · 游戏时长 {formatGameTime(gameTime)}
                </div>
              </>
            )}
          </motion.div>

          <div className="divider-glow mx-4 md:mx-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-8">
            {mvp && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-1 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-esports-gold to-orange-500 text-esports-bg text-xs md:text-sm font-black font-display tracking-widest shadow-glow-gold">
                    ⭐ MVP OF THE GAME
                  </div>
                </div>

                <div className="h-full pt-6 p-4 rounded-2xl border-2 border-esports-gold/40 bg-gradient-to-br from-esports-gold/10 via-transparent to-esports-purple/10 glow-border-gold">
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative">
                      <div
                        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4"
                        style={{
                          borderColor: mvp.player.teamId === 'blue' ? '#00D4FF' : '#FF3366',
                          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        <img
                          src={mvp.player.avatar}
                          alt={mvp.player.name}
                          className="w-full h-full object-cover bg-esports-bg"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-esports-card border-2 border-esports-gold/50 flex items-center justify-center text-2xl shadow-glow-gold">
                        {mvp.player.championIcon}
                      </div>
                      <div
                        className={`absolute -top-2 -left-2 px-2.5 py-0.5 rounded-lg text-xs font-black font-display ${
                          mvp.player.teamId === 'blue'
                            ? 'bg-esports-blue text-esports-bg'
                            : 'bg-esports-red text-white'
                        }`}
                      >
                        Lv.{mvp.player.level}
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`font-display font-black text-xl md:text-2xl mb-0.5 ${
                          mvp.player.teamId === 'blue' ? 'text-esports-blue' : 'text-esports-red'
                        }`}
                      >
                        {mvp.player.name}
                      </div>
                      <div className="text-sm text-esports-text-secondary">
                        使用 {mvp.player.champion}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-esports-gold text-4xl md:text-5xl font-display font-black number-display">
                        {mvp.rating.toFixed(1)}
                      </span>
                      <span className="text-esports-text-muted text-xs">/ 10.0</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-esports-green/20 text-esports-green text-sm font-bold font-display">
                      {mvp.player.kills} 击杀
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-esports-red/20 text-esports-red text-sm font-bold font-display">
                      {mvp.player.deaths} 死亡
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-esports-blue/20 text-esports-blue text-sm font-bold font-display">
                      {mvp.player.assists} 助攻
                    </span>
                  </div>

                  <div className="aspect-square max-w-[260px] mx-auto">
                    {radarOption && <ReactEChartsCore echarts={echarts} option={radarOption} style={{ height: '100%', width: '100%' }} />}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2 flex flex-col gap-4"
            >
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📊</span>
                  <h3 className="font-display font-bold text-base md:text-lg text-white">团队数据对比</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-10">
                  <StatRow
                    label="总击杀"
                    icon="💀"
                    blue={blueTeam.kills}
                    red={redTeam.kills}
                    blueWinner={blueTeam.kills > redTeam.kills}
                    redWinner={redTeam.kills > blueTeam.kills}
                  />
                  <StatRow
                    label="总经济"
                    icon="💰"
                    blue={formatGold(blueTeam.totalGold)}
                    red={formatGold(redTeam.totalGold)}
                    blueWinner={blueTeam.totalGold > redTeam.totalGold}
                    redWinner={redTeam.totalGold > blueTeam.totalGold}
                    isNumber={false}
                  />
                  <StatRow
                    label="KDA"
                    icon="⚔️"
                    blue={blueKDA}
                    red={redKDA}
                    blueWinner={parseFloat(blueKDA) > parseFloat(redKDA)}
                    redWinner={parseFloat(redKDA) > parseFloat(blueKDA)}
                    isNumber={false}
                  />
                  <StatRow
                    label="防御塔"
                    icon="🏰"
                    blue={blueTeam.towers}
                    red={redTeam.towers}
                    blueWinner={blueTeam.towers > redTeam.towers}
                    redWinner={redTeam.towers > blueTeam.towers}
                  />
                  <StatRow
                    label="小龙"
                    icon="🐉"
                    blue={blueTeam.dragons}
                    red={redTeam.dragons}
                    blueWinner={blueTeam.dragons > redTeam.dragons}
                    redWinner={redTeam.dragons > blueTeam.dragons}
                  />
                  <StatRow
                    label="大龙"
                    icon="👑"
                    blue={blueTeam.barons}
                    red={redTeam.barons}
                    blueWinner={blueTeam.barons > redTeam.barons}
                    redWinner={redTeam.barons > blueTeam.barons}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎖️</span>
                    <h3 className="font-display font-bold text-base md:text-lg text-white">最佳选手榜</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {topPlayersByRole.map((player, idx) => {
                    const isBlue = player.teamId === 'blue';
                    const isMVP = mvp?.player.id === player.id;
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          isMVP
                            ? 'bg-esports-gold/10 border border-esports-gold/30'
                            : 'bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm ${
                            idx === 0
                              ? 'bg-gradient-to-br from-esports-gold to-orange-500 text-esports-bg'
                              : idx === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-esports-bg'
                              : idx === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-white/5 text-esports-text-secondary'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0"
                          style={{ borderColor: isBlue ? 'rgba(0,212,255,0.4)' : 'rgba(255,51,102,0.4)' }}
                        >
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover bg-esports-bg"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-display font-bold text-sm truncate ${
                                isBlue ? 'text-esports-blue' : 'text-esports-red'
                              }`}
                            >
                              {player.name}
                            </span>
                            <span className="text-base">{player.championIcon}</span>
                            {isMVP && (
                              <span className="px-1.5 py-0.5 rounded bg-esports-gold/20 text-esports-gold text-[9px] font-black font-display">
                                MVP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-esports-text-muted">
                            KDA {formatKDA(player.kills, player.deaths, player.assists)} · {formatGold(player.gold)}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="font-display font-bold text-sm text-esports-gold number-display">
                            {((player.kills + player.assists) / Math.max(1, player.deaths) + player.damage / 20000).toFixed(1)}
                          </div>
                          <div className="text-[10px] text-esports-text-muted">评分</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="divider-glow mx-4 md:mx-8" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-4 md:p-8"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🎬</span>
              <h3 className="font-display font-bold text-base md:text-lg text-white">高光时刻回放</h3>
              <span className="px-2 py-0.5 rounded-full bg-esports-red/15 text-esports-red text-[10px] md:text-xs font-bold font-display">
                {highlights?.length || 0} 个精彩时刻
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(highlights || events.slice(-6).map((e, i) => ({
                id: `hl-${e.id}`,
                event: e,
                thumbnail: `https://picsum.photos/seed/highlight${i}/400/240`,
                duration: 15 + Math.floor(Math.random() * 20),
              }))).map((hl, idx) => (
                <motion.div
                  key={hl.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + idx * 0.08 }}
                  className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                  whileHover={{ y: -4 }}
                >
                  <div className="aspect-[16/9] relative bg-esports-bg overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${hl.thumbnail})`,
                        filter: 'saturate(1.2)',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-esports-bg via-esports-bg/30 to-transparent" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-base backdrop-blur-md"
                        style={{
                          backgroundColor: `${eventTypeToColor(hl.event.type)}30`,
                          border: `1px solid ${eventTypeToColor(hl.event.type)}50`,
                        }}
                      >
                        {eventTypeToIcon(hl.event.type)}
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold font-display backdrop-blur-md"
                        style={{
                          backgroundColor: `${eventTypeToColor(hl.event.type)}20`,
                          color: eventTypeToColor(hl.event.type),
                        }}
                      >
                        {hl.event.type.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-display font-bold number-display">
                      {formatGameTime(hl.event.time)}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-esports-gold/90 flex items-center justify-center shadow-glow-gold">
                        <span className="text-esports-bg text-2xl ml-1">▶</span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-display number-display">
                      {hl.duration}s
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="font-bold text-sm text-white line-clamp-1 mb-1 group-hover:text-esports-gold transition-colors">
                      {hl.event.title}
                    </div>
                    <div className="text-[11px] text-esports-text-muted line-clamp-2 leading-snug">
                      {hl.event.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
