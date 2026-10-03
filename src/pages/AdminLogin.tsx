import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Lock,
  ArrowLeft,
  ShieldAlert,
  Info,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLogin: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    user,
    isAuthReady,
    isAdmin,
    navigate,
    loginWithGoogle,
    loginWithEmail,
    logoutAdmin,
    siteSettings,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brandName =
    language === 'bn'
      ? siteSettings.company_name_bn || siteSettings.company_name
      : siteSettings.company_name;

  useEffect(() => {
    if (isAuthReady && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthReady, user, isAdmin, navigate]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(
        language === 'bn'
          ? 'সফলভাবে লগইন হয়েছে!'
          : 'Authenticated successfully.'
      );
    } catch (error) {
      console.error('Google Sign-In error:', error);
      toast.error(
        language === 'bn'
          ? 'Google লগইন সম্পন্ন হয়নি। পপআপ ব্লক করা থাকলে আনব্লক করুন।'
          : 'Google Sign-In could not be completed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast.success(
        language === 'bn'
          ? 'সফলভাবে লগইন হয়েছে!'
          : 'Authenticated successfully.'
      );
    } catch (error: unknown) {
      console.error('Email login error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('operation-not-allowed')) {
        toast.error(
          language === 'bn'
            ? 'Firebase Console থেকে Email/Password অপশনটি চালু করুন অথবা Google দিয়ে লগইন করুন।'
            : 'Please enable Email/Password in Firebase Console or use Google Sign-In.'
        );
      } else {
        toast.error(
          language === 'bn'
            ? 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।'
            : 'Invalid email or password credentials.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Top Bar */}
      <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.admin.login.backToSite}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                language === 'bn'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              বাংলা
            </button>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white pt-1">
              {brandName} · {t.admin.login.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.admin.login.subtitle}
            </p>
          </div>

          {isAuthReady && user && !isAdmin ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{t.admin.login.unauthorizedTitle}</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                {t.admin.login.unauthorizedDesc} ({user.email})
              </p>
              <button
                type="button"
                onClick={logoutAdmin}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.admin.login.switchAccount}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Primary Google OAuth Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmitting ? t.admin.login.signingIn : t.admin.login.googleSignIn}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink-0 mx-3 text-xs text-slate-400">
                  {t.admin.login.orEmailDivider}
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.admin.login.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enrzxpvt@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.admin.login.passwordLabel}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? t.admin.login.signingIn : t.admin.login.signInBtn}
                </button>
              </form>

              {/* Firebase Console Provider Guidance */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                    {t.admin.login.firebaseEmailGuideTitle}
                  </span>
                  {t.admin.login.firebaseEmailGuideDesc}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
