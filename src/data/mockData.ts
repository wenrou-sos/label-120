import type { MatchData, Player, GoldPoint, MatchEvent, Item } from '../types/match';

const CHAMPIONS = [
  { name: '亚索', icon: '⚔️' },
  { name: '盲僧', icon: '👊' },
  { name: '辛德拉', icon: '🔮' },
  { name: '卡莎', icon: '🏹' },
  { name: '锤石', icon: '⛓️' },
  { name: '卡蜜尔', icon: '🗡️' },
  { name: '薇古丝', icon: '😈' },
  { name: '芮尔', icon: '🐎' },
  { name: '卢锡安', icon: '🔫' },
  { name: '纳美', icon: '🌊' },
];

const ITEMS: Item[] = [
  { id: 'i1', name: '无尽之刃', icon: '🗡️', price: 3400 },
  { id: 'i2', name: '破败', icon: '⚔️', price: 3200 },
  { id: 'i3', name: '狂战士胫甲', icon: '👟', price: 1100 },
  { id: 'i4', name: '饮血剑', icon: '🩸', price: 3400 },
  { id: 'i5', name: '幻影之舞', icon: '💃', price: 2600 },
  { id: 'i6', name: '守护天使', icon: '🛡️', price: 2800 },
  { id: 'i7', name: '中娅沙漏', icon: '⏳', price: 2600 },
  { id: 'i8', name: '灭世者的死亡之帽', icon: '🎩', price: 3600 },
];

const AVATAR_EMOJIS = ['🦊', '🐯', '🦁', '🐺', '🦅', '🐲', '🦈', '🐙', '🦂', '👑', '⚡', '🔥', '💎', '🌟', '🎯'];

const generateLocalAvatar = (seed: string, bgColor: string): string => {
  const idx = Math.abs(seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_EMOJIS.length;
  const emoji = AVATAR_EMOJIS[idx];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#g-${seed})" />
      <rect x="5" y="5" width="90" height="90" rx="18" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <text x="50" y="62" text-anchor="middle" font-size="48">${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const generateItems = (count: number): Item[] => {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generatePlayer = (
  id: string,
  teamId: string,
  name: string,
  role: Player['role'],
  championIdx: number,
  baseGold: number
): Player => {
  const champ = CHAMPIONS[championIdx];
  const isBlue = teamId === 'blue';
  const bgColor = isBlue ? '#00D4FF' : '#FF3366';
  return {
    id,
    teamId,
    name,
    avatar: generateLocalAvatar(id, bgColor),
    champion: champ.name,
    championIcon: champ.icon,
    kills: Math.floor(Math.random() * 3),
    deaths: Math.floor(Math.random() * 3),
    assists: Math.floor(Math.random() * 6),
    cs: 60 + Math.floor(Math.random() * 40),
    gold: baseGold + Math.floor(Math.random() * 800),
    goldDiff: Math.floor((Math.random() - 0.5) * 600),
    items: generateItems(4 + Math.floor(Math.random() * 3)),
    role,
    level: 10 + Math.floor(Math.random() * 3),
    damage: 8000 + Math.floor(Math.random() * 12000),
    damageTaken: 5000 + Math.floor(Math.random() * 8000),
    visionScore: 10 + Math.floor(Math.random() * 30),
  };
};

const generateGoldHistory = (minutes: number): GoldPoint[] => {
  const history: GoldPoint[] = [];
  let blueGold = 500 * 5;
  let redGold = 500 * 5;
  const points = minutes * 12;

  for (let i = 0; i <= points; i++) {
    const time = (i / points) * minutes * 60;
    const blueIncrease = 80 + Math.random() * 60;
    const redIncrease = 80 + Math.random() * 60;
    blueGold += blueIncrease;
    redGold += redIncrease;

    if (i % 3 === 0) {
      if (Math.random() > 0.5) {
        blueGold += 200 + Math.random() * 300;
      } else {
        redGold += 200 + Math.random() * 300;
      }
    }

    history.push({
      time,
      blueGold: Math.floor(blueGold),
      redGold: Math.floor(redGold),
      diff: Math.floor(blueGold - redGold),
    });
  }
  return history;
};

export const generateInitialMatchData = (): MatchData => {
  const initialMinutes = 18;

  const blueTeam = {
    id: 'blue',
    name: 'RNG',
    logo: '🔵',
    color: 'blue' as const,
    score: 1,
    totalGold: 56800,
    kills: 12,
    deaths: 8,
    assists: 28,
    towers: 5,
    dragons: 2,
    barons: 0,
    heralds: 1,
  };

  const redTeam = {
    id: 'red',
    name: 'EDG',
    logo: '🔴',
    color: 'red' as const,
    score: 1,
    totalGold: 55200,
    kills: 8,
    deaths: 12,
    assists: 19,
    towers: 3,
    dragons: 1,
    barons: 0,
    heralds: 0,
  };

  const players: Player[] = [
    generatePlayer('p1', 'blue', 'Xiaohu', 'top', 5, 11500),
    generatePlayer('p2', 'blue', 'Wei', 'jungle', 1, 10800),
    generatePlayer('p3', 'blue', 'Yuekai', 'mid', 2, 12200),
    generatePlayer('p4', 'blue', 'GALA', 'adc', 3, 13500),
    generatePlayer('p5', 'blue', 'Ming', 'support', 4, 8800),
    generatePlayer('p6', 'red', 'Ale', 'top', 0, 10200),
    generatePlayer('p7', 'red', 'Jiejie', 'jungle', 6, 9800),
    generatePlayer('p8', 'red', 'Scout', 'mid', 7, 11800),
    generatePlayer('p9', 'red', 'Viper', 'adc', 8, 12900),
    generatePlayer('p10', 'red', 'Meiko', 'support', 9, 9500),
  ];

  const goldHistory = generateGoldHistory(initialMinutes);

  const baseTime = Date.now() - initialMinutes * 60 * 1000;

  const buildFullStats = (
    kills: number,
    deaths: number,
    assists: number,
    towers: number,
    dragons: number,
    barons: number,
    heralds: number
  ) => ({ kills, deaths, assists, towers, dragons, barons, heralds });

  const events: MatchEvent[] = [
    {
      id: 'e1',
      type: 'first_blood',
      time: 480,
      timestamp: baseTime + 480 * 1000,
      title: '一血爆发！',
      description: '上路GANK！Xiaohu卡蜜尔单杀Ale亚索，闪现拉开！',
      teamSide: 'blue',
      playerId: 'p1',
      replayData: {
        blueGold: 15800,
        redGold: 15200,
        blueStats: buildFullStats(1, 0, 2, 0, 0, 0, 0),
        redStats: buildFullStats(0, 1, 0, 0, 0, 0, 0),
      },
    },
    {
      id: 'e2',
      type: 'dragon',
      time: 720,
      timestamp: baseTime + 720 * 1000,
      title: '火龙被RNG拿下！',
      description: '野区视野压制，Wei盲僧精准Q抢下火龙！',
      teamSide: 'blue',
      playerId: 'p2',
      replayData: {
        blueGold: 24500,
        redGold: 23800,
        blueStats: buildFullStats(3, 2, 7, 0, 1, 0, 0),
        redStats: buildFullStats(2, 3, 4, 0, 0, 0, 0),
      },
    },
    {
      id: 'e3',
      type: 'herald',
      time: 960,
      timestamp: baseTime + 960 * 1000,
      title: '峡谷先锋召唤！',
      description: 'RNG利用视野差偷掉先锋，中路放先锋破一塔！',
      teamSide: 'blue',
      replayData: {
        blueGold: 32000,
        redGold: 30500,
        blueStats: buildFullStats(5, 4, 12, 2, 1, 0, 1),
        redStats: buildFullStats(4, 5, 9, 1, 0, 0, 0),
      },
    },
    {
      id: 'e4',
      type: 'tower',
      time: 1080,
      timestamp: baseTime + 1080 * 1000,
      title: '下路一塔告破！',
      description: 'GALA卡莎发育完美，推塔节奏领先！',
      teamSide: 'blue',
      playerId: 'p4',
      replayData: {
        blueGold: 36500,
        redGold: 34800,
        blueStats: buildFullStats(7, 5, 16, 3, 1, 0, 1),
        redStats: buildFullStats(5, 7, 11, 1, 0, 0, 0),
      },
    },
    {
      id: 'e5',
      type: 'teamfight',
      time: 1260,
      timestamp: baseTime + 1260 * 1000,
      title: '小龙团战0换3！',
      description: 'Yuekai辛德拉一套秒掉Viper卢锡安，RNG团战大获全胜！',
      teamSide: 'blue',
      playerId: 'p3',
      replayData: {
        blueGold: 43200,
        redGold: 40800,
        blueStats: buildFullStats(10, 6, 22, 4, 2, 0, 1),
        redStats: buildFullStats(6, 10, 14, 2, 1, 0, 0),
      },
    },
    {
      id: 'e6',
      type: 'kill',
      time: 1500,
      timestamp: baseTime + 1500 * 1000,
      title: '野区遭遇战！',
      description: 'Jiejie薇古丝蹲到Wei盲僧，配合队友反蹲成功！',
      teamSide: 'red',
      playerId: 'p7',
      replayData: {
        blueGold: 49800,
        redGold: 48500,
        blueStats: buildFullStats(11, 7, 25, 5, 2, 0, 1),
        redStats: buildFullStats(8, 11, 17, 3, 1, 0, 0),
      },
    },
    {
      id: 'e7',
      type: 'tower',
      time: 1680,
      timestamp: baseTime + 1680 * 1000,
      title: '中路二塔陷落！',
      description: 'RNG推进中路，辛德拉大招清线后破塔！',
      teamSide: 'blue',
      replayData: {
        blueGold: 55000,
        redGold: 53200,
        blueStats: buildFullStats(12, 8, 28, 5, 2, 0, 1),
        redStats: buildFullStats(8, 12, 19, 3, 1, 0, 0),
      },
    },
  ];

  const totalBlueGold = goldHistory[goldHistory.length - 1]?.blueGold || 56800;
  const totalRedGold = goldHistory[goldHistory.length - 1]?.redGold || 55200;
  blueTeam.totalGold = totalBlueGold;
  redTeam.totalGold = totalRedGold;

  return {
    matchId: 'match-2026-lpl-final',
    title: '2026 LPL春季赛总决赛',
    format: 'BO5',
    currentGame: 3,
    totalGames: 5,
    gameTime: initialMinutes * 60,
    status: 'live',
    blueTeam,
    redTeam,
    players,
    goldHistory,
    events,
  };
};

export const generateIncrementalUpdate = (
  currentData: MatchData
): Partial<MatchData> => {
  const updates: Partial<MatchData> = {};
  updates.gameTime = currentData.gameTime + 1;

  if (updates.gameTime % 5 === 0) {
    const lastPoint = currentData.goldHistory[currentData.goldHistory.length - 1];
    if (lastPoint) {
      const blueIncrease = 80 + Math.random() * 60;
      const redIncrease = 80 + Math.random() * 60;
      const newBlue = lastPoint.blueGold + Math.floor(blueIncrease);
      const newRed = lastPoint.redGold + Math.floor(redIncrease);
      updates.goldHistory = [
        ...currentData.goldHistory,
        {
          time: updates.gameTime,
          blueGold: newBlue,
          redGold: newRed,
          diff: newBlue - newRed,
        },
      ];
      updates.blueTeam = {
        ...currentData.blueTeam,
        totalGold: newBlue,
      };
      updates.redTeam = {
        ...currentData.redTeam,
        totalGold: newRed,
      };
    }
  }

  if (updates.gameTime % 3 === 0) {
    const updatedPlayers = currentData.players.map((p) => ({
      ...p,
      cs: p.cs + Math.floor(Math.random() * 3),
      gold: p.gold + Math.floor(Math.random() * 40),
    }));
    updates.players = updatedPlayers;
  }

  if (Math.random() < 0.02 && updates.gameTime > currentData.gameTime) {
    const eventTypes = ['kill', 'tower', 'dragon'] as const;
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const teamSide = Math.random() > 0.5 ? 'blue' : 'red';

    const eventDescriptions: Record<string, { title: string; desc: string }[]> = {
      kill: [
        { title: '下路对位单杀！', desc: 'ADC在对线中找到机会，一套带走对面！' },
        { title: '野区突袭！', desc: '打野绕后配合队友完成击杀！' },
        { title: '中路精彩对拼！', desc: '双方中单操作拉满，最终残血反杀！' },
      ],
      tower: [
        { title: '外塔被破！', desc: '带线推进成功，外塔告破！' },
      ],
      dragon: [
        { title: '小龙刷新！', desc: '双方围绕小龙展开视野布置！' },
      ],
    };

    const list = eventDescriptions[randomType];
    const chosen = list[Math.floor(Math.random() * list.length)];

    const snapBlue = {
      kills: currentData.blueTeam.kills,
      deaths: currentData.blueTeam.deaths,
      assists: currentData.blueTeam.assists,
      towers: currentData.blueTeam.towers,
      dragons: currentData.blueTeam.dragons,
      barons: currentData.blueTeam.barons,
      heralds: currentData.blueTeam.heralds,
    };
    const snapRed = {
      kills: currentData.redTeam.kills,
      deaths: currentData.redTeam.deaths,
      assists: currentData.redTeam.assists,
      towers: currentData.redTeam.towers,
      dragons: currentData.redTeam.dragons,
      barons: currentData.redTeam.barons,
      heralds: currentData.redTeam.heralds,
    };

    const newEvent: MatchEvent = {
      id: `e-${Date.now()}`,
      type: randomType,
      time: updates.gameTime,
      timestamp: Date.now(),
      title: chosen.title,
      description: chosen.desc,
      teamSide,
      replayData: {
        blueGold: currentData.blueTeam.totalGold,
        redGold: currentData.redTeam.totalGold,
        blueStats: snapBlue,
        redStats: snapRed,
      },
    };

    updates.events = [...currentData.events, newEvent];

    if (randomType === 'kill') {
      if (teamSide === 'blue') {
        updates.blueTeam = {
          ...currentData.blueTeam,
          ...(updates.blueTeam || {}),
          kills: (updates.blueTeam?.kills ?? currentData.blueTeam.kills) + 1,
        };
        updates.redTeam = {
          ...currentData.redTeam,
          ...(updates.redTeam || {}),
          deaths: (updates.redTeam?.deaths ?? currentData.redTeam.deaths) + 1,
        };
      } else {
        updates.redTeam = {
          ...currentData.redTeam,
          ...(updates.redTeam || {}),
          kills: (updates.redTeam?.kills ?? currentData.redTeam.kills) + 1,
        };
        updates.blueTeam = {
          ...currentData.blueTeam,
          ...(updates.blueTeam || {}),
          deaths: (updates.blueTeam?.deaths ?? currentData.blueTeam.deaths) + 1,
        };
      }
    }
  }

  return updates;
};

export const generateGameEndData = (winner: 'blue' | 'red', currentData: MatchData): MatchData => {
  const mvpPlayer = currentData.players
    .filter((p) => p.teamId === winner)
    .reduce((prev, curr) => {
      const prevScore = (prev.kills + prev.assists) / Math.max(1, prev.deaths) + prev.damage / 10000;
      const currScore = (curr.kills + curr.assists) / Math.max(1, curr.deaths) + curr.damage / 10000;
      return currScore > prevScore ? curr : prev;
    });

  const mvpRating = 8.5 + Math.random() * 1.5;

  const highlights = currentData.events
    .filter((e) => e.type === 'teamfight' || e.type === 'first_blood' || e.type === 'baron' || e.type === 'aces')
    .map((e) => ({
      id: `hl-${e.id}`,
      event: e,
      thumbnail: `https://picsum.photos/seed/${e.id}/200/120`,
      duration: 15 + Math.floor(Math.random() * 30),
    }));

  if (highlights.length < 3) {
    currentData.events.slice(-3).forEach((e) => {
      if (!highlights.find((h) => h.id === `hl-${e.id}`)) {
        highlights.push({
          id: `hl-${e.id}`,
          event: e,
          thumbnail: `https://picsum.photos/seed/${e.id}/200/120`,
          duration: 10 + Math.floor(Math.random() * 20),
        });
      }
    });
  }

  return {
    ...currentData,
    status: 'finished',
    winner,
    blueTeam: winner === 'blue'
      ? { ...currentData.blueTeam, score: currentData.blueTeam.score + 1 }
      : currentData.blueTeam,
    redTeam: winner === 'red'
      ? { ...currentData.redTeam, score: currentData.redTeam.score + 1 }
      : currentData.redTeam,
    mvp: {
      player: mvpPlayer,
      rating: Math.round(mvpRating * 10) / 10,
      criteria: {
        kdaContribution: 70 + Math.floor(Math.random() * 30),
        damageContribution: 65 + Math.floor(Math.random() * 35),
        objectiveParticipation: 60 + Math.floor(Math.random() * 40),
        goldEfficiency: 55 + Math.floor(Math.random() * 45),
        teamfightImpact: 70 + Math.floor(Math.random() * 30),
      },
    },
    highlights,
  };
};
