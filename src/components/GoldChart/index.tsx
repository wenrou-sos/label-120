import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMatch } from '../../context/MatchContext';
import { formatGold, formatGameTime } from '../../utils/formatters';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

interface Props {
  className?: string;
}

export const GoldChart: React.FC<Props> = memo(({ className = '' }) => {
  const { data, isReplayMode, replayEvent } = useMatch();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const { blueTeam, redTeam, goldHistory, gameTime } = data;

  const goldDiff = blueTeam.totalGold - redTeam.totalGold;
  const leadingTeam = goldDiff > 0 ? 'blue' : goldDiff < 0 ? 'red' : null;

  const initChart = useCallback(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    chartInstanceRef.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
    });

    return chartInstanceRef.current;
  }, []);

  const chartOption = useMemo(() => {
    const bluePoints = goldHistory.map((p) => [p.time, p.blueGold]);
    const redPoints = goldHistory.map((p) => [p.time, p.redGold]);
    const maxTime = Math.max(...goldHistory.map((p) => p.time), gameTime);

    const timeLabels = Array.from({ length: Math.ceil(maxTime / 180) + 1 }, (_, i) => i * 180);

    const replayMarker = isReplayMode && replayEvent
      ? {
          xAxis: replayEvent.time,
          label: {
            show: true,
            formatter: '⏪ 回放',
            position: 'top',
            color: '#FFD700',
            fontSize: 12,
            fontWeight: 'bold',
          },
          lineStyle: {
            color: '#FFD700',
            width: 2,
            type: 'dashed',
          },
        }
      : undefined;

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 30,
        right: 16,
        bottom: 40,
        left: 56,
      },
      legend: {
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 14, 26, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {
          color: '#F1F5F9',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const time = params[0]?.axisValue || 0;
          const timeStr = formatGameTime(time);
          let html = `<div style="font-family: 'Orbitron', sans-serif; font-weight: bold; margin-bottom: 8px; color: #94A3B8; font-size: 11px;">⏱ ${timeStr}</div>`;
          params.forEach((item: any) => {
            const isBlue = item.seriesName === 'blue';
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 2px 0;">
                <span style="color: ${isBlue ? '#00D4FF' : '#FF3366'}; font-weight: 600;">
                  ${isBlue ? blueTeam.name : redTeam.name}
                </span>
                <span style="color: #F1F5F9; font-weight: bold; font-family: 'Orbitron', sans-serif; font-variant-numeric: tabular-nums;">
                  ${formatGold(item.value[1])}
                </span>
              </div>
            `;
          });
          if (params.length === 2) {
            const diff = params[0].value[1] - params[1].value[1];
            const diffColor = diff >= 0 ? '#00FFA3' : '#FF3366';
            const sign = diff >= 0 ? '+' : '';
            html += `
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">
                <span style="color: ${diffColor}; font-weight: bold; font-family: 'Orbitron', sans-serif;">
                  经济差 ${sign}${formatGold(Math.abs(diff))}
                </span>
              </div>
            `;
          }
          return html;
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(168, 85, 247, 0.4)',
            width: 1,
            type: 'dashed',
          },
          label: {
            backgroundColor: '#A855F7',
            color: '#fff',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            formatter: (params: any) => formatGameTime(params.value),
          },
        },
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: maxTime,
        interval: 180,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748B',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 10,
          padding: [8, 0, 0, 0],
          formatter: (value: number) => {
            if (timeLabels.includes(value) || value === maxTime) {
              return formatGameTime(value);
            }
            return '';
          },
        },
        splitLine: {
          show: true,
          interval: 2,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.03)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748B',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 10,
          padding: [0, 8, 0, 0],
          formatter: (value: number) => formatGold(value),
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.04)',
            type: 'dashed',
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          startValue: Math.max(0, maxTime - 1200),
          endValue: maxTime,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          bottom: 6,
          height: 20,
          startValue: 0,
          endValue: maxTime,
          show: true,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'transparent',
          fillerColor: 'rgba(168, 85, 247, 0.1)',
          handleStyle: {
            color: '#A855F7',
            borderColor: '#A855F7',
          },
          moveHandleStyle: {
            color: '#A855F7',
            opacity: 0.7,
          },
          selectedDataBackground: {
            lineStyle: {
              color: '#A855F7',
            },
            areaStyle: {
              color: 'rgba(168, 85, 247, 0.1)',
            },
          },
          dataBackground: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)',
            },
            areaStyle: {
              color: 'rgba(255,255,255,0.02)',
            },
          },
          textStyle: {
            color: 'transparent',
          },
        },
      ],
      series: [
        {
          name: 'blue',
          type: 'line',
          data: bluePoints,
          smooth: 0.2,
          symbol: 'none',
          sampling: 'lttb',
          lineStyle: {
            width: 2.5,
            color: '#00D4FF',
            shadowColor: 'rgba(0, 212, 255, 0.5)',
            shadowBlur: 8,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 212, 255, 0.25)' },
              { offset: 0.5, color: 'rgba(0, 212, 255, 0.08)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.01)' },
            ]),
          },
          markLine: replayMarker ? { silent: true, symbol: 'none', data: [replayMarker] } : undefined,
          emphasis: { disabled: true },
        },
        {
          name: 'red',
          type: 'line',
          data: redPoints,
          smooth: 0.2,
          symbol: 'none',
          sampling: 'lttb',
          lineStyle: {
            width: 2.5,
            color: '#FF3366',
            shadowColor: 'rgba(255, 51, 102, 0.5)',
            shadowBlur: 8,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 51, 102, 0.25)' },
              { offset: 0.5, color: 'rgba(255, 51, 102, 0.08)' },
              { offset: 1, color: 'rgba(255, 51, 102, 0.01)' },
            ]),
          },
          emphasis: { disabled: true },
        },
      ],
    };
  }, [goldHistory, gameTime, isReplayMode, replayEvent, blueTeam.name, redTeam.name]);

  useEffect(() => {
    const chart = initChart();
    if (!chart) return;

    chart.setOption(chartOption);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(chartOption, { notMerge: false, lazyUpdate: true });
    }
  }, [chartOption]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`glass-card mx-3 md:mx-6 mt-4 overflow-hidden ${className}`}
    >
      <div className="p-4 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <h3 className="font-display font-bold text-sm md:text-base text-white">经济曲线对比</h3>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-esports-blue shadow-glow-blue" />
                <span className="text-[11px] md:text-xs font-bold text-esports-blue font-display">
                  {blueTeam.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-esports-red shadow-glow-red" />
                <span className="text-[11px] md:text-xs font-bold text-esports-red font-display">
                  {redTeam.name}
                </span>
              </div>
            </div>

            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                leadingTeam === 'blue'
                  ? 'bg-esports-blue/10 border border-esports-blue/30'
                  : leadingTeam === 'red'
                  ? 'bg-esports-red/10 border border-esports-red/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <span className="text-[11px] text-esports-text-secondary">经济差</span>
              <span
                className={`font-display font-bold text-sm ${
                  leadingTeam === 'blue'
                    ? 'text-esports-blue'
                    : leadingTeam === 'red'
                    ? 'text-esports-red'
                    : 'text-white'
                }`}
              >
                {goldDiff >= 0 ? '+' : ''}
                {formatGold(goldDiff)}
              </span>
              {leadingTeam && <span className="text-xs">💎</span>}
            </div>
          </div>
        </div>

        <div className="md:hidden mt-3 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center gap-4 py-1.5 rounded-lg bg-esports-blue/5 border border-esports-blue/20">
            <span className="text-[10px] text-esports-text-secondary">蓝方经济</span>
            <span className="font-display font-bold text-esports-blue text-sm">{formatGold(blueTeam.totalGold)}</span>
          </div>
          <div className="w-8" />
          <div className="flex-1 flex items-center justify-center gap-4 py-1.5 rounded-lg bg-esports-red/5 border border-esports-red/20">
            <span className="text-[10px] text-esports-text-secondary">红方经济</span>
            <span className="font-display font-bold text-esports-red text-sm">{formatGold(redTeam.totalGold)}</span>
          </div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%', height: '280px' }} />
    </motion.div>
  );
});

GoldChart.displayName = 'GoldChart';
