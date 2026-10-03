import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Lottie } from 'lottie-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Play,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sun,
  Moon,
  Menu,
  X,
  ChevronUp,
  Lock,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  GENERATED_IMAGES,
  HERO_LOTTIE_DATA,
} from '../lib/defaults';
import {
  contactMessageSchema,
  ContactMessageFormValues,
} from '../lib/validation';
import { DynamicIcon } from '../components/DynamicIcon';
import { ResilientImage } from '../components/ResilientImage';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayVal, setDisplayVal] = useState<number>(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 1400;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(value * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayVal(value);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}
      {displayVal.toFixed(decimals)}
      {suffix}
    </span>
  );
};

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return 'https://www.youtube.com/embed/aqz-KE-bpKQ';
  try {
    if (url.includes('youtube.com/embed/')) return url;
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    // ignore invalid URL
  }
  return url;
}

export const PublicWebsite: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    navigate,
    siteSettings,
    activeServices,
    submitContactMessage,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [customLottieJson, setCustomLottieJson] = useState<Record<string, unknown> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
      setShowScrollTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load custom Lottie JSON if hero_video_url points to a .json file
  useEffect(() => {
    const url = siteSettings.hero_video_url?.trim();
    if (url && url.endsWith('.json')) {
      fetch(url)
        .then((r) => r.json())
        .then((data) => setCustomLottieJson(data))
        .catch(() => setCustomLottieJson(null));
    } else {
      setCustomLottieJson(null);
    }
  }, [siteSettings.hero_video_url]);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    const prefix =
      language === 'bn'
        ? `আমি "${serviceTitle}" সেবাটি সম্পর্কে বিস্তারিত জানতে আগ্রহী। `
        : `I would like to discuss a project involving ${serviceTitle}. `;
    setValue('message', prefix, { shouldValidate: true });
    scrollToSection('contact');
  };

  const onSubmitContact = async (values: ContactMessageFormValues) => {
    try {
      await submitContactMessage(values);
      toast.success(t.contact.successToast);
      reset();
    } catch (error) {
      console.error('Contact submission failed:', error);
      toast.error(
        language === 'bn'
          ? 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Unable to send message right now. Please try again.'
      );
    }
  };

  const brandName =
    language === 'bn'
      ? siteSettings.company_name_bn || siteSettings.company_name
      : siteSettings.company_name;

  const heroTitle =
    language === 'bn' ? siteSettings.hero_title_bn : siteSettings.hero_title_en;
  const heroDesc =
    language === 'bn' ? siteSettings.hero_desc_bn : siteSettings.hero_desc_en;
  const aboutTitle =
    language === 'bn' ? siteSettings.about_title_bn : siteSettings.about_title_en;
  const aboutDesc =
    language === 'bn' ? siteSettings.about_desc_bn : siteSettings.about_desc_en;
  const officeAddress =
    language === 'bn' ? siteSettings.address_bn : siteSettings.address_en;

  const portfolioImages = [
    GENERATED_IMAGES.portfolioFintech,
    GENERATED_IMAGES.portfolioCloud,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      {/* =====================================================================
          STICKY HEADER (Strict 3-Zone Top Bar Contract)
          ===================================================================== */}
      <header
        className={`sticky top-0 z-40 h-16 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
            : 'bg-transparent border-b border-slate-200/40 dark:border-slate-800/40'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Zone 1: Single Brand Lockup */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-lg"
          >
            {siteSettings.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={brandName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : null}
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
              {brandName}
            </span>
          </a>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-indigo-600"
            >
              {t.nav.home}
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-indigo-600"
            >
              {t.nav.about}
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-indigo-600"
            >
              {t.nav.services}
            </a>
            <a
              href="#portfolio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('portfolio');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-indigo-600"
            >
              {t.nav.portfolio}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-indigo-600"
            >
              {t.nav.contact}
            </a>
          </nav>

          {/* Zone 3: Language Switcher + Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Segmented Interactive Language Switcher */}
            <div
              className="flex items-center p-0.5 bg-slate-200/75 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-full"
              role="group"
              aria-label="Language Switcher"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  language === 'bn'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary CTA Button */}
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-full shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer"
            >
              <span>{t.nav.scheduleCall}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-2 shadow-lg">
            {(['home', 'about', 'services', 'portfolio', 'contact'] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => scrollToSection(sec)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
              >
                {t.nav[sec]}
              </button>
            ))}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-center text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"
              >
                {t.nav.scheduleCall}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className="py-2.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full"
              >
                {t.nav.adminPortal}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ===================================================================
            1. HERO SECTION (#home)
            =================================================================== */}
        <section
          id="home"
          className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/70 dark:border-slate-900"
        >
          {/* Animated Gradient Blobs (Compositor-Only transform & opacity) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.28, 0.4, 0.28],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-indigo-500/20 dark:bg-indigo-500/15 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.2, 0.32, 0.2],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute top-1/4 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/20 dark:bg-blue-500/15 blur-3xl"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Value Proposition & CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 space-y-6"
              >
                {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-indigo-600 dark:text-indigo-400">
                  <span>{t.hero.systemVerified}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t.hero.liveTelemetry}
                  </span>
                </div>

                {/* Dominant Display Headline */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-2xl">
                  {heroTitle}
                </h1>

                {/* Lead Body Prose */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[62ch]">
                  {heroDesc}
                </p>

                {/* Primary & Secondary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transition-all duration-150 whitespace-nowrap cursor-pointer"
                  >
                    <span>{t.hero.getStarted}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
                    <span>{t.hero.watchDemo}</span>
                  </button>
                </div>

                {/* Unboxed Quantitative Trust Bar */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                    {t.hero.latencyMetric}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{t.about.isoMarker}</span>
                </div>
              </motion.div>

              {/* Right Column: Studio Visual + Lottie Animation Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl bg-slate-900 aspect-16/11">
                  {siteSettings.hero_video_url &&
                  (siteSettings.hero_video_url.endsWith('.mp4') ||
                    siteSettings.hero_video_url.endsWith('.webm')) ? (
                    <video
                      src={siteSettings.hero_video_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ResilientImage
                      src={GENERATED_IMAGES.heroWorkspace}
                      alt={brandName}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Measured Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

                  {/* Lottie Architectural Node Pulse Overlay */}
                  <div className="absolute top-3 right-3 w-20 h-20 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/15 flex items-center justify-center p-1.5">
                    <Lottie
                      src={customLottieJson || HERO_LOTTIE_DATA}
                      autoplay
                      loop
                      className="w-full h-full"
                    />
                  </div>

                  {/* Bottom Scrim Caption */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-indigo-300">
                        {brandName}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">
                        {t.hero.latencyMetric}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoModalOpen(true)}
                      aria-label={t.promoVideo.playLabel}
                      className="w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            2. ABOUT US SECTION (#about)
            =================================================================== */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-white dark:bg-slate-900/50 border-b border-slate-200/70 dark:border-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Image from site_settings */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-4/3 bg-slate-100 dark:bg-slate-900">
                  <ResilientImage
                    src={siteSettings.about_image_url || GENERATED_IMAGES.aboutTeam}
                    alt={aboutTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Prose from site_settings */}
              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t.about.sectionKicker}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {aboutTitle}
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {aboutDesc}
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.about.highlight1Title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.about.highlight1Desc}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.about.highlight2Title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.about.highlight2Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===================================================================
            3. SERVICES SECTION (#services)
            =================================================================== */}
        <motion.section
          id="services"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                {t.services.sectionKicker}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.services.heading}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {t.services.subheading}
              </p>
            </div>

            {activeServices.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <p className="text-sm text-slate-500">{t.services.emptyServices}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((srv, index) => {
                  const title = language === 'bn' ? srv.title_bn : srv.title_en;
                  const desc =
                    language === 'bn' ? srv.description_bn : srv.description_en;
                  const numIndex = String(index + 1).padStart(2, '0');

                  return (
                    <div
                      key={srv.id}
                      className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-indigo-500/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-6">
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <DynamicIcon name={srv.icon_name} className="w-5 h-5" />
                          </div>
                          <span className="font-mono tabular-nums text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {numIndex}.
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2.5">
                          {title}
                        </h3>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleSelectServiceForInquiry(title)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors cursor-pointer"
                        >
                          <span>{t.services.exploreAction}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* ===================================================================
            4. WHY CHOOSE US (4 Quantitative Stats with Counting Animation)
            =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-24 bg-slate-900 text-white border-b border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <p className="text-xs font-semibold tracking-wider text-indigo-400">
                {t.whyChooseUs.sectionKicker}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {t.whyChooseUs.heading}
              </h2>
              <p className="text-base text-slate-300">
                {t.whyChooseUs.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-slate-800">
              {t.whyChooseUs.stats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    <AnimatedCounter
                      value={stat.value}
                      decimals={'decimals' in stat ? stat.decimals : 0}
                      prefix={'prefix' in stat ? stat.prefix : ''}
                      suffix={stat.suffix}
                    />
                  </div>
                  <p className="text-sm font-semibold text-indigo-300">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stat.context}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===================================================================
            5. PORTFOLIO / CASE STUDIES (#portfolio)
            =================================================================== */}
        <motion.section
          id="portfolio"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                {t.portfolio.sectionKicker}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.portfolio.heading}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {t.portfolio.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {t.portfolio.items.map((item, idx) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl"
                >
                  <div>
                    <div className="aspect-16/9 overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <ResilientImage
                        src={portfolioImages[idx]}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-7 space-y-4">
                      {/* Unboxed Metadata with Middot Separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.client}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.sector}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.timeframe}</span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-7 py-4 bg-white dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
                    <span className="font-mono tabular-nums text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.metric}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectServiceForInquiry(item.title)}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.services.exploreAction}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===================================================================
            6. PROMOTIONAL VIDEO SECTION (Thumbnail + YouTube Modal)
            =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/70 dark:border-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-12">
              <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                {t.promoVideo.sectionKicker}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.promoVideo.heading}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {t.promoVideo.subheading}
              </p>
            </div>

            <div
              onClick={() => setVideoModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setVideoModalOpen(true);
                }
              }}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl aspect-16/8 bg-slate-900 cursor-pointer"
            >
              <ResilientImage
                src={GENERATED_IMAGES.heroWorkspace}
                alt={t.promoVideo.heading}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Measured Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-200">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="mt-5 font-display text-lg sm:text-xl font-bold">
                  {t.promoVideo.playLabel}
                </p>
                <p className="mt-1 text-xs font-mono tabular-nums text-slate-300">
                  {t.promoVideo.durationLabel}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===================================================================
            7. TESTIMONIALS / CLIENTS SECTION
            =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-white dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-14">
              <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                {t.testimonials.sectionKicker}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.testimonials.heading}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {t.testimonials.items.map((item, index) => (
                <blockquote
                  key={index}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="space-y-4">
                    <p className="text-xs font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.outcome}
                    </p>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                      “{item.quote}”
                    </p>
                  </div>

                  <footer className="pt-6 mt-6 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {item.author}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{item.role}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.org}</span>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===================================================================
            8. CONTACT SECTION (#contact)
            =================================================================== */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Contact Info & Architectural Map Card */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                    {t.contact.sectionKicker}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t.contact.heading}
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.contact.subheading}
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t.contact.officeLabel}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                        {officeAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t.contact.directContactLabel}
                      </p>
                      <a
                        href={`mailto:${siteSettings.contact_email}`}
                        className="block text-sm font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 mt-0.5"
                      >
                        {siteSettings.contact_email}
                      </a>
                      <a
                        href={`tel:${siteSettings.contact_phone}`}
                        className="block font-mono tabular-nums text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 mt-0.5"
                      >
                        {siteSettings.contact_phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t.contact.hoursLabel}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                        {t.contact.hoursValue}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Map / Location Embed */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <iframe
                    title={brandName}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=90.3980%2C23.7880%2C90.4150%2C23.7980&layer=mapnik`}
                    className="w-full h-44 border-0 grayscale contrast-125 opacity-90"
                    loading="lazy"
                  />
                  <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    <span className="truncate">{officeAddress}</span>
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Right Column: Validated Lead Capture Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit(onSubmitContact)}
                  noValidate
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 sm:p-10 shadow-sm space-y-6"
                >
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                      {t.contact.nameLabel}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder={t.contact.namePlaceholder}
                      {...register('name')}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                      {t.contact.emailLabel}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder={t.contact.emailPlaceholder}
                      {...register('email')}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                      {t.contact.messageLabel}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder={t.contact.messagePlaceholder}
                      {...register('message')}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-y"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting ? t.contact.submittingBtn : t.contact.submitBtn}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* =====================================================================
          8. QUIET 4-COLUMN FOOTER
          ===================================================================== */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
            {/* Col 1: Brand + Desc + Socials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                {siteSettings.logo_url ? (
                  <img
                    src={siteSettings.logo_url}
                    alt={brandName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : null}
                <span className="font-display text-lg font-bold text-white">
                  {brandName}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {heroDesc.slice(0, 160)}
              </p>
              <div className="flex items-center gap-3 pt-1">
                {siteSettings.facebook_link && (
                  <a
                    href={siteSettings.facebook_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {siteSettings.youtube_link && (
                  <a
                    href={siteSettings.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white tracking-wider">
                {t.footer.quickLinks}
              </h3>
              <ul className="space-y-2 text-xs">
                {(['home', 'about', 'services', 'portfolio', 'contact'] as const).map(
                  (sec) => (
                    <li key={sec}>
                      <a
                        href={`#${sec}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(sec);
                        }}
                        className="hover:text-white transition-colors"
                      >
                        {t.nav[sec]}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Col 3: Services */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white tracking-wider">
                {t.footer.capabilities}
              </h3>
              <ul className="space-y-2 text-xs">
                {activeServices.slice(0, 5).map((srv) => (
                  <li key={srv.id}>
                    <a
                      href="#services"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('services');
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {language === 'bn' ? srv.title_bn : srv.title_en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact + Admin Console Link */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white tracking-wider">
                {t.footer.contactInfo}
              </h3>
              <p className="text-xs leading-relaxed">{officeAddress}</p>
              <p className="text-xs text-slate-300">{siteSettings.contact_email}</p>
              <p className="text-xs font-mono tabular-nums text-slate-300">
                {siteSettings.contact_phone}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.footer.adminLink}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} {brandName}. {t.footer.rights}
            </p>
            <p>{t.footer.privacy}</p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          PROMOTIONAL YOUTUBE VIDEO MODAL
          ===================================================================== */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">
                {brandName} · {t.promoVideo.playLabel}
              </span>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.promoVideo.closeModal}</span>
              </button>
            </div>
            <div className="aspect-16/9 w-full bg-black">
              <iframe
                src={getYouTubeEmbedUrl(siteSettings.promo_video_url)}
                title={t.promoVideo.playLabel}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SCROLL TO TOP BUTTON
          ===================================================================== */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-slate-900 dark:bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
