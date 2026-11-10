import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Coins,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
  Shield,
  Trophy,
} from 'lucide-react';
import { StudentProfile, AvatarItem, DailyMission } from '../types';
import { AVATARS, ALL_BADGES, LEAGUES, getDailyMissions } from '../data/gamification';

interface GamificationViewProps {
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => void;
  todaySolvedCount: number;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  student,
  onUpdateStudent,
  todaySolvedCount,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'leagues' | 'badges'>('shop');
  const missions = getDailyMissions(todaySolvedCount, 2);

  // Buy avatar with coins
  const handleBuyAvatar = (avatar: AvatarItem) => {
    if (student.coins < avatar.price) return;
    if (student.unlockedAvatars.includes(avatar.id)) {
      // Just select
      onUpdateStudent({
        ...student,
        avatarId: avatar.id,
        avatarEmoji: avatar.emoji,
      });
      return;
    }

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });

    onUpdateStudent({
      ...student,
      coins: student.coins - avatar.price,
      avatarId: avatar.id,
      avatarEmoji: avatar.emoji,
      unlockedAvatars: [...student.unlockedAvatars, avatar.id],
    });
  };

  // Buy Streak Freeze
  const handleBuyStreakFreeze = () => {
    const cost = 30;
    if (student.coins < cost) return;
    onUpdateStudent({
      ...student,
      coins: student.coins - cost,
      streakFreezeCount: student.streakFreezeCount + 1,
    });
    confetti({
      particleCount: 30,
      spread: 40,
    });
  };

  // Simulated leaderboard peers
  const simulatedLeaderboard = [
    { name: 'Kryštof H.', xp: Math.max(student.xp + 85, 320), avatar: '🚀' },
    { name: `${student.name} (Ty)`, xp: student.xp, avatar: student.avatarEmoji, isMe: true },
    { name: 'Tereza M.', xp: Math.max(student.xp - 30, 160), avatar: '💼' },
    { name: 'Vojta S.', xp: Math.max(student.xp - 75, 120), avatar: '📐' },
    { name: 'Aneta K.', xp: Math.max(student.xp - 110, 80), avatar: '🎓' },
  ].sort((a, b) => b.xp - a.xp);

  // Find user's current league
  const currentLeague =
    [...LEAGUES].reverse().find((l) => student.xp >= l.minXp) || LEAGUES[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Gamification Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-2xl shadow-sm">
            {student.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {student.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                {currentLeague.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Celkem {student.xp} XP bodů · {student.coins} MathCoins v pokladničce
            </p>
          </div>
        </div>

        {/* Navigation tabs for gamification */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'shop'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Obchod s avatary
          </button>
          <button
            onClick={() => setActiveTab('leagues')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'leagues'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Týdenní liga
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Odznaky
          </button>
        </div>
      </div>

      {/* Daily Missions Progress Row */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Denní mise pro extra odměny
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {missions.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 space-y-2"
            >
              <div className="flex items-start justify-between gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                <span>{m.title}</span>
                {m.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  {m.current} / {m.target}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  +{m.rewardCoins} 🪙 | +{m.rewardXp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab: Avatar Shop */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          {/* Streak Freeze Powerup Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500 text-white text-lg">🧊</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ochrana série (Streak Freeze)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Pokud jeden den zapomeneš procvičovat, zmrazení zachrání tvou sérii. Aktuálně máš:{' '}
                  <strong>{student.streakFreezeCount} ks</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleBuyStreakFreeze}
              disabled={student.coins < 30}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Koupit za 30</span>
              <Coins className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Avatars Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Vyber si svého avatara</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVATARS.map((av) => {
                const isUnlocked = student.unlockedAvatars.includes(av.id);
                const isSelected = student.avatarId === av.id;
                const canAfford = student.coins >= av.price;

                return (
                  <div
                    key={av.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{av.emoji}</span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
                          Aktivní
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Odemčeno
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          {av.price} <Coins className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{av.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {av.roleDescription}
                    </p>

                    <button
                      onClick={() => handleBuyAvatar(av)}
                      disabled={!isUnlocked && !canAfford}
                      className={`mt-4 w-full py-2 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white pointer-events-none'
                          : isUnlocked
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? (
                        'Vybráno'
                      ) : isUnlocked ? (
                        'Aktivovat avatara'
                      ) : canAfford ? (
                        <>
                          <span>Odemknout za {av.price}</span>
                          <Coins className="w-3 h-3" />
                        </>
                      ) : (
                        `Chybí ${av.price - student.coins} mincí`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Weekly Leagues */}
      {activeTab === 'leagues' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Žebříček – {currentLeague.name}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              První 3 řešitelé na konci týdne postupují do vyšší ligy a získávají bonusové odznaky.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {simulatedLeaderboard.map((item, idx) => (
              <div
                key={item.name}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 ${
                  item.isMe
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-bold text-xs ${
                      idx === 0
                        ? 'text-yellow-500 text-sm'
                        : idx === 1
                        ? 'text-slate-400'
                        : idx === 2
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="text-xl">{item.avatar}</span>
                  <div>
                    <span className="text-xs sm:text-sm text-slate-900 dark:text-white block">
                      {item.name}
                    </span>
                    {idx < 3 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Postupová zóna
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {item.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Badges */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_BADGES.map((b) => {
              const isUnlocked = student.unlockedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{b.icon}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Získáno
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {b.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
