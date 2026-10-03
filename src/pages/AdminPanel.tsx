import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Settings,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Upload,
  Copy,
  Check,
  MailOpen,
  Mail,
  Archive,
  RefreshCw,
  Sun,
  Moon,
  Search,
  X,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  siteSettingsSchema,
  SiteSettingsFormValues,
  serviceItemSchema,
  ServiceItemFormValues,
} from '../lib/validation';
import { ServiceRecord } from '../lib/defaults';
import { formatBytes } from '../lib/imageCompression';
import { DynamicIcon, AVAILABLE_SERVICE_ICONS } from '../components/DynamicIcon';
import { ResilientImage } from '../components/ResilientImage';

type AdminTab = 'dashboard' | 'settings' | 'services' | 'messages' | 'media';

export const AdminPanel: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    currentPath,
    navigate,
    user,
    isAuthReady,
    isAdmin,
    siteSettings,
    services,
    activeServices,
    messages,
    mediaAssets,
    isSeeding,
    logoutAdmin,
    saveSiteSettings,
    createService,
    updateService,
    reorderServices,
    deleteService,
    updateMessageStatus,
    deleteMessage,
    uploadMediaFile,
    deleteMediaAsset,
    seedDefaultDatabase,
  } = useApp();

  // Derive active tab from URL path
  const getTabFromPath = (path: string): AdminTab => {
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path.startsWith('/admin/services')) return 'services';
    if (path.startsWith('/admin/messages')) return 'messages';
    if (path.startsWith('/admin/media')) return 'media';
    return 'dashboard';
  };

  const activeTab = getTabFromPath(currentPath);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect unauthenticated or non-admin users to /admin/login
  useEffect(() => {
    if (isAuthReady && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [isAuthReady, user, isAdmin, navigate]);

  const switchTab = (tab: AdminTab) => {
    setMobileSidebarOpen(false);
    navigate(`/admin/${tab}`);
  };

  // =========================================================================
  // SITE SETTINGS FORM STATE
  // =========================================================================
  const [settingsSectionTab, setSettingsSectionTab] = useState<
    'branding' | 'about' | 'contact'
  >('branding');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);

  const settingsForm = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      company_name: siteSettings.company_name,
      company_name_bn: siteSettings.company_name_bn,
      logo_url: siteSettings.logo_url,
      hero_title_en: siteSettings.hero_title_en,
      hero_title_bn: siteSettings.hero_title_bn,
      hero_desc_en: siteSettings.hero_desc_en,
      hero_desc_bn: siteSettings.hero_desc_bn,
      hero_video_url: siteSettings.hero_video_url,
      promo_video_url: siteSettings.promo_video_url,
      about_title_en: siteSettings.about_title_en,
      about_title_bn: siteSettings.about_title_bn,
      about_desc_en: siteSettings.about_desc_en,
      about_desc_bn: siteSettings.about_desc_bn,
      about_image_url: siteSettings.about_image_url,
      contact_email: siteSettings.contact_email,
      contact_phone: siteSettings.contact_phone,
      address_en: siteSettings.address_en,
      address_bn: siteSettings.address_bn,
      facebook_link: siteSettings.facebook_link,
      youtube_link: siteSettings.youtube_link,
    },
  });

  useEffect(() => {
    settingsForm.reset({
      company_name: siteSettings.company_name,
      company_name_bn: siteSettings.company_name_bn,
      logo_url: siteSettings.logo_url,
      hero_title_en: siteSettings.hero_title_en,
      hero_title_bn: siteSettings.hero_title_bn,
      hero_desc_en: siteSettings.hero_desc_en,
      hero_desc_bn: siteSettings.hero_desc_bn,
      hero_video_url: siteSettings.hero_video_url,
      promo_video_url: siteSettings.promo_video_url,
      about_title_en: siteSettings.about_title_en,
      about_title_bn: siteSettings.about_title_bn,
      about_desc_en: siteSettings.about_desc_en,
      about_desc_bn: siteSettings.about_desc_bn,
      about_image_url: siteSettings.about_image_url,
      contact_email: siteSettings.contact_email,
      contact_phone: siteSettings.contact_phone,
      address_en: siteSettings.address_en,
      address_bn: siteSettings.address_bn,
      facebook_link: siteSettings.facebook_link,
      youtube_link: siteSettings.youtube_link,
    });
  }, [siteSettings, settingsForm]);

  const onSaveSettings = async (values: SiteSettingsFormValues) => {
    try {
      await saveSiteSettings(values);
      toast.success(
        language === 'bn'
          ? 'সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
          : 'Site settings saved and published in real time.'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(
        language === 'bn'
          ? 'সেটিংস সেভ করতে সমস্যা হয়েছে।'
          : 'Failed to save site settings.'
      );
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await uploadMediaFile(file, 'logo');
      settingsForm.setValue('logo_url', res.url, { shouldDirty: true });
      toast.success(
        `Logo compressed (${formatBytes(res.originalBytes)} → ${formatBytes(
          res.compressedBytes
        )})`
      );
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error('Failed to compress and upload logo.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAboutImg(true);
    try {
      const res = await uploadMediaFile(file, 'general');
      settingsForm.setValue('about_image_url', res.url, { shouldDirty: true });
      toast.success(
        `Image compressed (${formatBytes(res.originalBytes)} → ${formatBytes(
          res.compressedBytes
        )})`
      );
    } catch (error) {
      console.error('About image upload failed:', error);
      toast.error('Failed to compress and upload image.');
    } finally {
      setIsUploadingAboutImg(false);
      e.target.value = '';
    }
  };

  // =========================================================================
  // SERVICES CRUD & DRAG REORDER STATE
  // =========================================================================
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);

  const serviceForm = useForm<ServiceItemFormValues>({
    resolver: zodResolver(serviceItemSchema),
    defaultValues: {
      icon_name: 'Layers',
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      order_number: services.length + 1,
      is_active: true,
    },
  });

  const openNewServiceModal = () => {
    setEditingService(null);
    serviceForm.reset({
      icon_name: 'Layers',
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      order_number: services.length + 1,
      is_active: true,
    });
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: ServiceRecord) => {
    setEditingService(srv);
    serviceForm.reset({
      icon_name: srv.icon_name,
      title_en: srv.title_en,
      title_bn: srv.title_bn,
      description_en: srv.description_en,
      description_bn: srv.description_bn,
      order_number: srv.order_number,
      is_active: srv.is_active,
    });
    setServiceModalOpen(true);
  };

  const onSaveService = async (values: ServiceItemFormValues) => {
    try {
      if (editingService) {
        await updateService(editingService.id, values);
        toast.success(
          language === 'bn' ? 'সেবাটি আপডেট করা হয়েছে!' : 'Service updated successfully.'
        );
      } else {
        await createService(values);
        toast.success(
          language === 'bn' ? 'নতুন সেবা যুক্ত করা হয়েছে!' : 'New service created.'
        );
      }
      setServiceModalOpen(false);
    } catch (error) {
      console.error('Save service error:', error);
      toast.error('Could not save service.');
    }
  };

  const handleToggleServiceActive = async (srv: ServiceRecord) => {
    try {
      await updateService(srv.id, {
        order_number: srv.order_number,
        is_active: !srv.is_active,
      });
      toast.success(
        !srv.is_active ? 'Service enabled on website.' : 'Service hidden from website.'
      );
    } catch {
      toast.error('Failed to update service visibility.');
    }
  };

  const handleMoveServiceOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    const ids = services.map((s) => s.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIndex, 0, moved);
    await reorderServices(ids);
    toast.success('Service order updated.');
  };

  const handleDropServiceRow = async (targetId: string) => {
    if (!draggedServiceId || draggedServiceId === targetId) {
      setDraggedServiceId(null);
      return;
    }
    const ids = services.map((s) => s.id);
    const fromIdx = ids.indexOf(draggedServiceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedServiceId(null);
      return;
    }
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, draggedServiceId);
    setDraggedServiceId(null);
    await reorderServices(ids);
    toast.success('Service order updated.');
  };

  // =========================================================================
  // MESSAGES INBOX STATE
  // =========================================================================
  const [msgFilter, setMsgFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [msgSearch, setMsgSearch] = useState('');

  const filteredMessages = messages.filter((m) => {
    if (msgFilter !== 'all' && m.status !== msgFilter) return false;
    if (msgSearch.trim()) {
      const q = msgSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // =========================================================================
  // MEDIA LIBRARY STATE
  // =========================================================================
  const [uploadCategory, setUploadCategory] = useState<
    'logo' | 'hero' | 'service' | 'general'
  >('general');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);

  const handleMediaLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const res = await uploadMediaFile(file, uploadCategory);
      toast.success(
        `Uploaded & compressed (${formatBytes(res.originalBytes)} → ${formatBytes(
          res.compressedBytes
        )})`
      );
    } catch (error) {
      console.error('Media upload failed:', error);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleCopyMediaUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    toast.success(t.admin.media.copied);
    setTimeout(() => setCopiedMediaId(null), 2000);
  };

  const handleApplyMediaToSettings = async (
    field: 'logo_url' | 'about_image_url',
    url: string
  ) => {
    try {
      await saveSiteSettings({
        ...siteSettings,
        [field]: url,
      });
      toast.success(
        field === 'logo_url'
          ? 'Updated site logo in site_settings!'
          : 'Updated About section image in site_settings!'
      );
    } catch {
      toast.error('Failed to update site_settings.');
    }
  };

  // Metrics Calculation
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;
  const totalStorageBytes = mediaAssets.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);
  const brandName =
    language === 'bn'
      ? siteSettings.company_name_bn || siteSettings.company_name
      : siteSettings.company_name;

  if (!isAuthReady || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
        Verifying Super Admin session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* =====================================================================
          LEFT SIDEBAR (260px Workspace Navigation)
          ===================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              {siteSettings.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt={brandName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                />
              ) : null}
              <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white truncate">
                {brandName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => switchTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.admin.nav.dashboard}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>{t.admin.nav.settings}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('services')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0" />
                <span>{t.admin.nav.services}</span>
              </span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                {services.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('messages')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>{t.admin.nav.messages}</span>
              </span>
              {unreadMessagesCount > 0 && (
                <span
                  className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                    activeTab === 'messages'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchTab('media')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>{t.admin.nav.media}</span>
              </span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                {mediaAssets.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>{t.admin.nav.viewWebsite}</span>
          </button>

          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t.admin.nav.logout}</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN WORKSPACE VIEWPORT
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on Left, Admin Profile & Controls on Right */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              <span>{t.admin.consoleTitle}</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-block text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {user.email}
            </span>

            {/* Language Switcher */}
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

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* =================================================================
              TAB 1: DASHBOARD (/admin/dashboard)
              ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.admin.dashboard.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.admin.dashboard.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSeeding}
                  onClick={async () => {
                    await seedDefaultDatabase();
                    toast.success('Default bilingual website data synced to Firestore.');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-60 self-start"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>
                    {isSeeding ? t.admin.dashboard.seedingBtn : t.admin.dashboard.seedDataBtn}
                  </span>
                </button>
              </div>

              {/* 4 Metric Cards (Single-Elevation, Tabular Numerals) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.admin.dashboard.totalServices}
                  </p>
                  <p className="font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
                    {services.length}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {activeServices.length} {t.admin.dashboard.activeServices}
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.admin.dashboard.totalMessages}
                  </p>
                  <p className="font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
                    {messages.length}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                    {unreadMessagesCount} {t.admin.dashboard.unreadMessages}
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.admin.dashboard.storageUsed}
                  </p>
                  <p className="font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
                    {formatBytes(totalStorageBytes)}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {mediaAssets.length} files in site-assets
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Bilingual Status
                  </p>
                  <p className="font-mono tabular-nums text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    EN · BN
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {siteSettings.contact_email}
                  </p>
                </div>
              </div>

              {/* Quick Edit Buttons */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.admin.dashboard.quickActions}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => switchTab('settings')}
                    className="px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.admin.dashboard.editSettingsBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab('services')}
                    className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.admin.dashboard.manageServicesBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab('messages')}
                    className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.admin.dashboard.viewMessagesBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab('media')}
                    className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.admin.dashboard.uploadMediaBtn}
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Table */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.admin.dashboard.recentMessagesTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => switchTab('messages')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t.admin.dashboard.viewMessagesBtn}
                  </button>
                </div>

                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    {t.admin.dashboard.noRecentMessages}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {messages.slice(0, 5).map((msg) => (
                      <div
                        key={msg.id}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {msg.name}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-500">{msg.email}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-medium ${
                                msg.status === 'unread'
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                            {msg.message}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => switchTab('messages')}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 shrink-0 cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: SITE SETTINGS (/admin/settings)
              ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.admin.settings.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.admin.settings.subtitle}
                  </p>
                </div>

                {/* Segmented Section Filter */}
                <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-xl self-start">
                  <button
                    type="button"
                    onClick={() => setSettingsSectionTab('branding')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settingsSectionTab === 'branding'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.admin.settings.tabBranding}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSectionTab('about')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settingsSectionTab === 'about'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.admin.settings.tabAboutVideo}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSectionTab('contact')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settingsSectionTab === 'contact'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.admin.settings.tabContactSocial}
                  </button>
                </div>
              </div>

              <form
                onSubmit={settingsForm.handleSubmit(onSaveSettings)}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6"
              >
                {settingsSectionTab === 'branding' && (
                  <div className="space-y-6">
                    {/* Company Name EN & BN side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.companyNameEn}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('company_name')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                        {settingsForm.formState.errors.company_name && (
                          <p className="text-xs text-red-600 mt-1">
                            {settingsForm.formState.errors.company_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.companyNameBn}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('company_name_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                        {settingsForm.formState.errors.company_name_bn && (
                          <p className="text-xs text-red-600 mt-1">
                            {settingsForm.formState.errors.company_name_bn.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload & URL */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {settingsForm.watch('logo_url') ? (
                          <img
                            src={settingsForm.watch('logo_url')}
                            alt="Logo preview"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            LOGO
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {t.admin.settings.logoLabel}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Compressed automatically via browser-image-compression
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {isUploadingLogo
                              ? t.admin.media.compressing
                              : t.admin.settings.uploadLogoBtn}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploadingLogo}
                            className="hidden"
                          />
                        </label>
                        {settingsForm.watch('logo_url') && (
                          <button
                            type="button"
                            onClick={() =>
                              settingsForm.setValue('logo_url', '', { shouldDirty: true })
                            }
                            className="px-3 py-2 rounded-full text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hero Titles EN & BN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.heroTitleEn}
                        </label>
                        <textarea
                          rows={2}
                          {...settingsForm.register('hero_title_en')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.heroTitleBn}
                        </label>
                        <textarea
                          rows={2}
                          {...settingsForm.register('hero_title_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Hero Descriptions EN & BN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.heroDescEn}
                        </label>
                        <textarea
                          rows={4}
                          {...settingsForm.register('hero_desc_en')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.heroDescBn}
                        </label>
                        <textarea
                          rows={4}
                          {...settingsForm.register('hero_desc_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {settingsSectionTab === 'about' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.aboutTitleEn}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('about_title_en')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.aboutTitleBn}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('about_title_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.aboutDescEn}
                        </label>
                        <textarea
                          rows={4}
                          {...settingsForm.register('about_desc_en')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.aboutDescBn}
                        </label>
                        <textarea
                          rows={4}
                          {...settingsForm.register('about_desc_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* About Section Image Upload */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                          <ResilientImage
                            src={settingsForm.watch('about_image_url')}
                            alt="About preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {t.admin.settings.aboutImageLabel}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Displayed in the About Us section on the main website
                          </p>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {isUploadingAboutImg
                            ? t.admin.media.compressing
                            : t.admin.media.uploadBtn}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutImageUpload}
                          disabled={isUploadingAboutImg}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Video & Lottie Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.heroVideoUrl}
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com/animation.json or .mp4"
                          {...settingsForm.register('hero_video_url')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.promoVideoUrl}
                        </label>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/embed/aqz-KE-bpKQ"
                          {...settingsForm.register('promo_video_url')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {settingsSectionTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.contactEmail}
                        </label>
                        <input
                          type="email"
                          {...settingsForm.register('contact_email')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.contactPhone}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('contact_phone')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.addressEn}
                        </label>
                        <textarea
                          rows={2}
                          {...settingsForm.register('address_en')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.addressBn}
                        </label>
                        <textarea
                          rows={2}
                          {...settingsForm.register('address_bn')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.facebookLink}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('facebook_link')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {t.admin.settings.youtubeLink}
                        </label>
                        <input
                          type="text"
                          {...settingsForm.register('youtube_link')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={settingsForm.formState.isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {settingsForm.formState.isSubmitting
                        ? t.admin.settings.savingBtn
                        : t.admin.settings.saveBtn}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================
              TAB 3: SERVICES CRUD & REORDER (/admin/services)
              ================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.admin.services.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.admin.services.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openNewServiceModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.admin.services.addBtn}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.admin.services.dragHint}
              </p>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                        <th className="py-3 px-4 w-24">{t.admin.services.orderCol}</th>
                        <th className="py-3 px-4">{t.admin.services.serviceCol}</th>
                        <th className="py-3 px-4 w-32">{t.admin.services.statusCol}</th>
                        <th className="py-3 px-4 w-32 text-right">
                          {t.admin.services.actionsCol}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      {services.map((srv, idx) => (
                        <tr
                          key={srv.id}
                          draggable
                          onDragStart={() => setDraggedServiceId(srv.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropServiceRow(srv.id)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            draggedServiceId === srv.id ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                              <span className="font-bold text-slate-800 dark:text-slate-200 w-5">
                                {srv.order_number}
                              </span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveServiceOrder(idx, 'up')}
                                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 cursor-pointer"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === services.length - 1}
                                  onClick={() => handleMoveServiceOrder(idx, 'down')}
                                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 cursor-pointer"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                <DynamicIcon name={srv.icon_name} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                  {srv.title_en}{' '}
                                  <span className="text-slate-400 font-normal">·</span>{' '}
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {srv.title_bn}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {language === 'bn'
                                    ? srv.description_bn
                                    : srv.description_en}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleServiceActive(srv)}
                              className={`text-xs font-semibold cursor-pointer ${
                                srv.is_active
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {srv.is_active
                                ? `● ${t.admin.services.activeBadge}`
                                : `○ ${t.admin.services.hiddenBadge}`}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditServiceModal(srv)}
                                aria-label="Edit service"
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteService(srv.id);
                                  toast.success('Service deleted.');
                                }}
                                aria-label="Delete service"
                                className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add / Edit Service Modal */}
              {serviceModalOpen && (
                <div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                  onClick={() => setServiceModalOpen(false)}
                >
                  <div
                    className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        {editingService
                          ? t.admin.services.editService
                          : t.admin.services.newService}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setServiceModalOpen(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={serviceForm.handleSubmit(onSaveService)}
                      className="space-y-5"
                    >
                      {/* Lucide Icon Selector Grid */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Select Lucide Icon ({serviceForm.watch('icon_name')})
                        </label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          {AVAILABLE_SERVICE_ICONS.map((iconName) => {
                            const selected = serviceForm.watch('icon_name') === iconName;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() =>
                                  serviceForm.setValue('icon_name', iconName, {
                                    shouldValidate: true,
                                  })
                                }
                                title={iconName}
                                className={`h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                  selected
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                                }`}
                              >
                                <DynamicIcon name={iconName} className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Service Title (English)
                          </label>
                          <input
                            type="text"
                            {...serviceForm.register('title_en')}
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Service Title (Bangla)
                          </label>
                          <input
                            type="text"
                            {...serviceForm.register('title_bn')}
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Description (English)
                          </label>
                          <textarea
                            rows={3}
                            {...serviceForm.register('description_en')}
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Description (Bangla)
                          </label>
                          <textarea
                            rows={3}
                            {...serviceForm.register('description_bn')}
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Order Number
                          </label>
                          <input
                            type="number"
                            {...serviceForm.register('order_number', {
                              valueAsNumber: true,
                            })}
                            className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                          />
                        </div>

                        <label className="flex items-center gap-2.5 pt-5 cursor-pointer">
                          <input
                            type="checkbox"
                            {...serviceForm.register('is_active')}
                            className="w-4 h-4 rounded text-indigo-600"
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Publish as Active on Website
                          </span>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setServiceModalOpen(false)}
                          className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={serviceForm.formState.isSubmitting}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-semibold shadow-sm cursor-pointer"
                        >
                          {t.admin.services.saveServiceBtn}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 4: MESSAGES (/admin/messages)
              ================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.admin.messages.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.admin.messages.subtitle}
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    placeholder="Search name, email, message..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Segmented Filter Controls */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-xl w-fit">
                {(['all', 'unread', 'read', 'archived'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMsgFilter(st)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
                      msgFilter === st
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {st === 'all'
                      ? t.admin.messages.filterAll
                      : st === 'unread'
                      ? t.admin.messages.filterUnread
                      : st === 'read'
                      ? t.admin.messages.filterRead
                      : t.admin.messages.filterArchived}
                  </button>
                ))}
              </div>

              {filteredMessages.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
                  {t.admin.messages.emptyState}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-2xl bg-white dark:bg-slate-900 border p-6 transition-colors ${
                        msg.status === 'unread'
                          ? 'border-indigo-500/50 dark:border-indigo-500/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {msg.name}
                          </span>
                          <span aria-hidden="true">·</span>
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                          >
                            {msg.email}
                          </a>
                          <span aria-hidden="true">·</span>
                          <span className="uppercase font-mono text-[11px] font-semibold text-slate-500">
                            {msg.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {msg.status !== 'read' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateMessageStatus(msg.id, 'read');
                                toast.success('Marked as read.');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              <MailOpen className="w-3.5 h-3.5" />
                              <span>{t.admin.messages.markRead}</span>
                            </button>
                          )}
                          {msg.status === 'read' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateMessageStatus(msg.id, 'unread');
                                toast.success('Marked as unread.');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{t.admin.messages.markUnread}</span>
                            </button>
                          )}
                          {msg.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateMessageStatus(msg.id, 'archived');
                                toast.success('Message archived.');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>{t.admin.messages.archive}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteMessage(msg.id);
                              toast.success('Message deleted.');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.admin.messages.delete}</span>
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 5: MEDIA LIBRARY (/admin/media)
              ================================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {t.admin.media.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.admin.media.subtitle}
                  </p>
                </div>

                {/* Upload Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={uploadCategory}
                    onChange={(e) =>
                      setUploadCategory(
                        e.target.value as 'logo' | 'hero' | 'service' | 'general'
                      )
                    }
                    className="px-3.5 py-2.5 text-xs font-semibold rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800"
                  >
                    <option value="general">Category: General</option>
                    <option value="logo">Category: Logo</option>
                    <option value="hero">Category: Hero</option>
                    <option value="service">Category: Service</option>
                  </select>

                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>
                      {isUploadingMedia ? t.admin.media.compressing : t.admin.media.uploadBtn}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingMedia}
                      onChange={handleMediaLibraryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {mediaAssets.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
                  {t.admin.media.emptyMedia}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-16/10 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
                          <ResilientImage
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {asset.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="capitalize">{asset.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatBytes(asset.sizeBytes)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{asset.mimeType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyMediaUrl(asset.id, asset.url)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                          >
                            {copiedMediaId === asset.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{t.admin.media.copyUrl}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyMediaToSettings('logo_url', asset.url)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                          >
                            {t.admin.media.useAsLogo}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleApplyMediaToSettings('about_image_url', asset.url)
                            }
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                          >
                            {t.admin.media.useAsAbout}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            await deleteMediaAsset(asset.id);
                            toast.success('Media asset deleted.');
                          }}
                          aria-label={t.admin.media.deleteAsset}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
