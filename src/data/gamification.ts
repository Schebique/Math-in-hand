import { AvatarItem, Badge, DailyMission } from '../types';

export const AVATARS: AvatarItem[] = [
  {
    id: 'avatar_scholar',
    name: 'Akademický průzkumník',
    emoji: '🎓',
    roleDescription: 'Základní badatel připravený prozkoumat tajemství čísel',
    price: 0,
  },
  {
    id: 'avatar_business',
    name: 'Finanční analytička',
    emoji: '💼',
    roleDescription: 'Ovládá marže, investice a optimalizaci zisků',
    price: 50,
  },
  {
    id: 'avatar_engineer',
    name: 'Mladý stavitel & inženýr',
    emoji: '📐',
    roleDescription: 'Mistr Pythagorovy věty, těles a technických výpočtů',
    price: 80,
  },
  {
    id: 'avatar_astronaut',
    name: 'Vesmírný navigátor',
    emoji: '🚀',
    roleDescription: 'Počítá trajektorie, zrychlení a vesmírné rychlosti',
    price: 150,
  },
  {
    id: 'avatar_wizard',
    name: 'Alchymista rovnic',
    emoji: '🧙‍♂️',
    roleDescription: 'Kouzlí s neznámými a odhaluje skryté vztahy',
    price: 250,
  },
  {
    id: 'avatar_superstar',
    name: 'Diamantový šampion',
    emoji: '👑',
    roleDescription: 'Legendární počtář na vrcholu celostátního žebříčku',
    price: 500,
  },
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge_first_solve',
    name: 'První úspěch',
    description: 'Správně vyřeš svůj první matematický příklad',
    icon: '🎯',
    category: 'accuracy',
  },
  {
    id: 'badge_streak_3',
    name: 'Třídenní jízda',
    description: 'Procvičuj matematiku 3 dny v řadě za sebou',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'badge_streak_7',
    name: 'Týdenní mistr',
    description: 'Udrž denní sérii 7 dní bez přerušení',
    icon: '⚡',
    category: 'streak',
  },
  {
    id: 'badge_no_hint',
    name: 'Samostatný mozek',
    description: 'Vyřeš 5 příkladů v řadě na první pokus bez použití nápovědy',
    icon: '🧠',
    category: 'accuracy',
  },
  {
    id: 'badge_finance_master',
    name: 'Finanční guru',
    description: 'Vyřeš alespoň 5 příkladů z finanční matematiky',
    icon: '📈',
    category: 'topic',
  },
  {
    id: 'badge_cermat_ready',
    name: 'CERMAT bojovník',
    description: 'Úspěšně vyřeš 5 přijímačkových úloh z 9. třídy',
    icon: '🏆',
    category: 'topic',
  },
  {
    id: 'badge_night_owl',
    name: 'Noční sova',
    description: 'Procvičuj v tmavém režimu po 19:00 hodině',
    icon: '🦉',
    category: 'volume',
  },
];

export const LEAGUES = [
  { name: 'Bronzová liga', minXp: 0, color: 'text-amber-700 dark:text-amber-500' },
  { name: 'Stříbrná liga', minXp: 300, color: 'text-slate-400 dark:text-slate-300' },
  { name: 'Zlatá liga', minXp: 800, color: 'text-yellow-500 dark:text-yellow-400' },
  { name: 'Diamantová liga', minXp: 1800, color: 'text-cyan-500 dark:text-cyan-400' },
];

export function getDailyMissions(todaySolvedCount: number, perfectCount: number): DailyMission[] {
  return [
    {
      id: 'mission_solve_3',
      title: 'Vyřeš dnes 3 matematické příklady',
      current: Math.min(todaySolvedCount, 3),
      target: 3,
      rewardCoins: 15,
      rewardXp: 30,
      completed: todaySolvedCount >= 3,
    },
    {
      id: 'mission_perfect_2',
      title: 'Vyřeš 2 úlohy bez použití nápovědy',
      current: Math.min(perfectCount, 2),
      target: 2,
      rewardCoins: 20,
      rewardXp: 40,
      completed: perfectCount >= 2,
    },
    {
      id: 'mission_study_time',
      title: 'Udrž denní studijní sérii aktivní',
      current: 1,
      target: 1,
      rewardCoins: 10,
      rewardXp: 20,
      completed: true,
    },
  ];
}
