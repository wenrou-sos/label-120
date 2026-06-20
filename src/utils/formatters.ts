export const formatGameTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatGold = (gold: number): string => {
  if (gold >= 10000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return gold.toLocaleString();
};

export const formatGoldDiff = (diff: number): string => {
  const prefix = diff > 0 ? '+' : '';
  const abs = Math.abs(diff);
  if (abs >= 10000) {
    return `${prefix}${(diff / 1000).toFixed(1)}k`;
  }
  return `${prefix}${diff.toLocaleString()}`;
};

export const formatKDA = (kills: number, deaths: number, assists: number): string => {
  if (deaths === 0) {
    return (kills + assists).toFixed(1);
  }
  return ((kills + assists) / deaths).toFixed(2);
};

export const formatEventTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `第${mins}分钟`;
};

export const roleToChinese = (role: string): string => {
  const roleMap: Record<string, string> = {
    top: '上单',
    jungle: '打野',
    mid: '中单',
    adc: 'ADC',
    support: '辅助',
  };
  return roleMap[role] || role;
};

export const eventTypeToIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    first_blood: '⚔️',
    kill: '💀',
    tower: '🏰',
    dragon: '🐉',
    baron: '👑',
    herald: '📯',
    teamfight: '⚡',
    inhibitor: '💎',
    surrender: '🏳️',
    aces: '✨',
  };
  return iconMap[type] || '📌';
};

export const eventTypeToColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    first_blood: '#FFD700',
    kill: '#FF3366',
    tower: '#FFA500',
    dragon: '#00D4FF',
    baron: '#A855F7',
    herald: '#00FFA3',
    teamfight: '#FF3366',
    inhibitor: '#FFA500',
    surrender: '#64748B',
    aces: '#FFD700',
  };
  return colorMap[type] || '#94A3B8';
};
