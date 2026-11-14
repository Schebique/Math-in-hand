import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  X,
  Users,
  User,
  LogOut,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link2,
  KeyRound,
  Unlink,
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { AuthSession, FamilyInvite, FamilyLink } from '../types';
import {
  ensureUserVaultInFirestore,
  normalizeInviteCode,
  setPendingRoleForSignIn,
} from '../utils/firestoreVault';

interface SSOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthSession, isNewUser: boolean) => void;
  currentSession?: AuthSession | null;
  onSignOut?: () => void;
  initialAccountType?: 'individual_student' | 'family_parent';
  initialInviteCode?: string;
  activeParentLink?: FamilyLink | null;
  pendingInvitesForEmail?: FamilyInvite[];
  onAcceptInvite?: (code: string) => Promise<void>;
  onUnlinkParent?: () => Promise<void>;
}

export const SSOAuthModal: React.FC<SSOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentSession,
  onSignOut,
  initialAccountType,
  initialInviteCode,
  activeParentLink,
  pendingInvitesForEmail = [],
  onAcceptInvite,
  onUnlinkParent,
}) => {
  const [accountType, setAccountType] = useState<'individual_student' | 'family_parent'>(
    initialAccountType || currentSession?.accountType || 'family_parent'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  // Parent pairing states (for student accounts)
  const [inviteCodeInput, setInviteCodeInput] = useState(initialInviteCode || '');
  const [isPairing, setIsPairing] = useState(false);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [pairingSuccess, setPairingSuccess] = useState<string | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialAccountType) {
        setAccountType(initialAccountType);
      } else if (currentSession?.accountType) {
        setAccountType(currentSession.accountType);
      }
      if (initialInviteCode) {
        setInviteCodeInput(initialInviteCode);
      }
      setPairingError(null);
      setPairingSuccess(null);
      setConfirmUnlink(false);
    }
  }, [isOpen, initialAccountType, initialInviteCode, currentSession?.accountType]);

  if (!isOpen) return null;

  const handleRealGoogleSignIn = async (selectedRole: 'family_parent' | 'individual_student') => {
    setErrorMessage(null);
    setIsLoading(true);
    setPendingRoleForSignIn(selectedRole);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setErrorMessage('Váš Google účet nemá ověřenou e-mailovou adresu.');
        setIsLoading(false);
        return;
      }

      const { accountType: resolvedRole, isNewUser } = await ensureUserVaultInFirestore(
        user,
        selectedRole
      );

      const session: AuthSession = {
        userId: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Uživatel',
        provider: 'google',
        accountType: resolvedRole,
        avatarUrl: user.photoURL || '',
      };

      onSuccess(session, isNewUser);
      setShowRoleSwitch(false);
      // Keep modal open if there is an invite code waiting so student can link right away, otherwise close
      if (!initialInviteCode || resolvedRole !== 'individual_student') {
        onClose();
      }
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMessage('Přihlašovací okno Googlu bylo zavřeno před dokončením.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage(
          'Prohlížeč zablokoval vyskakovací okno Googlu. Povolte prosím pop-up okna pro tento web.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMessage('Tato doména zatím není povolena v Firebase Auth.');
      } else {
        setErrorMessage('Přihlášení přes Google se nezdařilo. Zkuste to prosím znovu.');
      }
      console.error('Google OAuth chyba:', error);
    } finally {
      setPendingRoleForSignIn(null);
      setIsLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      if (onSignOut) onSignOut();
      onClose();
    } catch (error) {
      console.error('Chyba při odhlášení:', error);
      setErrorMessage('Nepodařilo se odhlásit. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCode = async (codeToUse: string) => {
    if (!onAcceptInvite) return;
    const normalized = normalizeInviteCode(codeToUse);
    if (normalized.length < 6) {
      setPairingError('Zadejte platný párovací klíč od rodiče (např. MH-7K4P9Q).');
      return;
    }

    setPairingError(null);
    setPairingSuccess(null);
    setIsPairing(true);
    try {
      await onAcceptInvite(normalized);
      setPairingSuccess('Účet byl úspěšně propojen s vaším rodičem!');
      setInviteCodeInput('');
    } catch (err) {
      setPairingError(
        err instanceof Error ? err.message : 'Nepodařilo se propojit účet. Zkontrolujte klíč.'
      );
    } finally {
      setIsPairing(false);
    }
  };

  const handleUnlinkClick = async () => {
    if (!onUnlinkParent) return;
    setPairingError(null);
    setIsPairing(true);
    try {
      await onUnlinkParent();
      setConfirmUnlink(false);
      setPairingSuccess('Propojení s rodičem bylo ukončeno.');
    } catch (err) {
      setPairingError(
        err instanceof Error ? err.message : 'Nepodařilo se odpojit rodiče.'
      );
    } finally {
      setIsPairing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 pt-16 pb-20 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading || isPairing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto text-2xl font-bold shadow-md shadow-emerald-500/20">
            π
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            {currentSession && !showRoleSwitch ? 'Ověřený účet MathHero' : 'Přihlášení přes Google'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentSession && !showRoleSwitch
              ? 'Vaše profily a výsledky jsou chráněny pod vaším unikátním UID v Cloud Firestore'
              : 'Oficiální ověření Google účtem se striktním oddělením rodinných dat'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CASE 1: Authenticated user overview */}
        {currentSession && !showRoleSwitch ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-3">
                {currentSession.avatarUrl ? (
                  <img
                    src={currentSession.avatarUrl}
                    alt={currentSession.name}
                    className="w-11 h-11 rounded-xl object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {currentSession.name.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentSession.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentSession.email}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                  Google SSO
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Režim účtu:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentSession.accountType === 'family_parent'
                    ? 'Rodinný účet (Rodič)'
                    : 'Samostatný žák'}
                </span>
              </div>
            </div>

            {/* Parent-Child Account Linking Section (primarily for individual_student) */}
            {(currentSession.accountType === 'individual_student' || activeParentLink) && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Propojení s účtem rodiče</span>
                </div>

                {pairingError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{pairingError}</span>
                  </div>
                )}

                {pairingSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{pairingSuccess}</span>
                  </div>
                )}

                {activeParentLink ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>Propojeno s rodičem:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {activeParentLink.parentName}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Denní cíl od rodiče:</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                        {activeParentLink.dailyTimeLimitMinutes} min / den
                      </span>
                    </div>

                    {!confirmUnlink ? (
                      <button
                        type="button"
                        disabled={isPairing}
                        onClick={() => setConfirmUnlink(true)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Odpojit rodiče</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isPairing}
                          onClick={handleUnlinkClick}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[40px]"
                        >
                          {isPairing ? 'Odpojuji...' : 'Potvrdit odpojení'}
                        </button>
                        <button
                          type="button"
                          disabled={isPairing}
                          onClick={() => setConfirmUnlink(false)}
                          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold min-h-[40px]"
                        >
                          Zrušit
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvitesForEmail.length > 0 && (
                      <div className="space-y-2">
                        {pendingInvitesForEmail.map((inv) => (
                          <div
                            key={inv.code}
                            className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2"
                          >
                            <div className="text-xs text-blue-900 dark:text-blue-100">
                              Pozvánka od rodiče <strong>{inv.parentName}</strong> · Klíč{' '}
                              <span className="font-mono tabular-nums font-bold">{inv.code}</span>
                            </div>
                            <button
                              type="button"
                              disabled={isPairing}
                              onClick={() => handleAcceptCode(inv.code)}
                              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors min-h-[40px]"
                            >
                              {isPairing ? 'Propojuji...' : 'Přijmout pozvánku a sdílet pokrok'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="child-invite-code"
                        className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                      >
                        Párovací klíč od rodiče:
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="child-invite-code"
                            type="text"
                            value={inviteCodeInput}
                            onChange={(e) => {
                              setInviteCodeInput(e.target.value.toUpperCase());
                              setPairingError(null);
                            }}
                            placeholder="např. MH-7K4P9Q"
                            className="w-full pl-8 pr-3 py-2 text-xs font-mono tracking-wider uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isPairing || inviteCodeInput.trim().length < 6}
                          onClick={() => handleAcceptCode(inviteCodeInput)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap shrink-0 transition-colors min-h-[40px]"
                        >
                          {isPairing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Připojit'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={isLoading || isPairing}
                onClick={handleSignOutClick}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>Odhlásit se a uzamknout účet</span>
              </button>

              <button
                type="button"
                disabled={isLoading || isPairing}
                onClick={() => setShowRoleSwitch(true)}
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Přepnout Google účet nebo roli</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: Real Google OAuth Sign-In */
          <div className="space-y-4">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setAccountType('family_parent')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                  accountType === 'family_parent'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Rodinný (Rodič)</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setAccountType('individual_student')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                  accountType === 'individual_student'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Samostatný žák</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
              {accountType === 'family_parent' ? (
                <>
                  <strong>Rodinný režim rodiče:</strong> Spravujete své děti v trezoru nebo můžete pozvat dítě s vlastním Gmail účtem přes párovací klíč v menu Rodič.
                </>
              ) : (
                <>
                  <strong>Samostatný žák:</strong> Váš osobní pokrok se ukládá pod váš Google účet. Kdykoli se můžete propojit s rodičem pomocí jeho párovacího klíče.
                </>
              )}
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRealGoogleSignIn(accountType)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ověřuji Google účet...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Pokračovat s reálným Google účtem</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
              Otevře se oficiální přihlašovací okno Googlu s výběrem účtu a zadáním hesla.
            </p>

            {showRoleSwitch && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowRoleSwitch(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ← Zpět na přehled účtu
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
