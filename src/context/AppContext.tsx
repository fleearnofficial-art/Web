import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SERVICES,
  DEFAULT_MEDIA_ASSETS,
  SiteSettingsRecord,
  ServiceRecord,
  ContactMessageRecord,
  MediaAssetRecord,
} from '../lib/defaults';
import { Language, TRANSLATIONS } from '../lib/i18n';
import {
  SiteSettingsFormValues,
  ServiceItemFormValues,
  ContactMessageFormValues,
  LIMITS,
  sanitizeId,
} from '../lib/validation';
import { compressAndConvertToDataUrl } from '../lib/imageCompression';

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (typeof TRANSLATIONS)['en'] | (typeof TRANSLATIONS)['bn'];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPath: string;
  navigate: (path: string) => void;
  user: User | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  siteSettings: SiteSettingsRecord;
  services: ServiceRecord[];
  activeServices: ServiceRecord[];
  messages: ContactMessageRecord[];
  mediaAssets: MediaAssetRecord[];
  isLoadingData: boolean;
  isSeeding: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  saveSiteSettings: (values: SiteSettingsFormValues) => Promise<void>;
  createService: (values: ServiceItemFormValues) => Promise<void>;
  updateService: (id: string, values: Partial<ServiceItemFormValues>) => Promise<void>;
  reorderServices: (orderedIds: string[]) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  submitContactMessage: (values: ContactMessageFormValues) => Promise<void>;
  updateMessageStatus: (id: string, status: 'unread' | 'read' | 'archived') => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  uploadMediaFile: (
    file: File,
    category: 'logo' | 'hero' | 'service' | 'general'
  ) => Promise<{ url: string; compressedBytes: number; originalBytes: number }>;
  deleteMediaAsset: (id: string) => Promise<void>;
  seedDefaultDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function resolveRouteFromLocation(): string {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    return hash.slice(1);
  }
  const pathname = window.location.pathname || '/';
  const adminIndex = pathname.indexOf('/admin');
  if (adminIndex !== -1) {
    return pathname.slice(adminIndex);
  }
  return '/';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('company_pro_lang');
      return saved === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('company_pro_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currentPath, setCurrentPath] = useState<string>(() => resolveRouteFromLocation());

  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord>(DEFAULT_SITE_SETTINGS);
  const [hasRemoteSettings, setHasRemoteSettings] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceRecord[]>(() =>
    DEFAULT_SERVICES.map((s) => ({ ...s, authorId: 'system' }))
  );
  const [hasRemoteServices, setHasRemoteServices] = useState<boolean>(false);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>(() =>
    DEFAULT_MEDIA_ASSETS.map((m) => ({ ...m, uploadedBy: 'system' }))
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const autoSeededRef = useRef<boolean>(false);

  // Sync language with <html lang> and localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('company_pro_lang', lang);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync theme with <html class="dark">
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('company_pro_theme', next);
      } catch {
        // ignore
      }
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Dynamic document title based on site_settings and language
  useEffect(() => {
    const brandName =
      language === 'bn'
        ? siteSettings.company_name_bn || siteSettings.company_name
        : siteSettings.company_name;
    const heroHeadline =
      language === 'bn' ? siteSettings.hero_title_bn : siteSettings.hero_title_en;
    if (brandName) {
      document.title = `${brandName} – ${heroHeadline.slice(0, 55)}`;
    }
  }, [siteSettings, language]);

  // History & Hash API routing (supports GitHub Pages subpaths & standard root hosts)
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(resolveRouteFromLocation());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    const isGitHubPages =
      window.location.hostname.endsWith('github.io') ||
      (window.location.pathname !== '/' && !window.location.pathname.startsWith('/admin'));

    if (isGitHubPages) {
      window.location.hash = path === '/' ? '' : `#${path}`;
    } else if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auth state listener & Admin verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setIsAuthReady(true);
        return;
      }

      const isBootstrapped =
        currentUser.emailVerified && currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;
      if (isBootstrapped) {
        setIsAdmin(true);
        setIsAuthReady(true);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(Boolean(currentUser.emailVerified && adminDoc.exists()));
      } catch {
        setIsAdmin(false);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // 1. Real-time listener for site_settings/main
  useEffect(() => {
    const settingsRef = doc(db, 'site_settings', 'main');
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SiteSettingsRecord;
          setSiteSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...data,
            about_image_url: data.about_image_url || DEFAULT_SITE_SETTINGS.about_image_url,
          });
          setHasRemoteSettings(true);
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
          setHasRemoteSettings(false);
        }
        setIsLoadingData(false);
      },
      (error) => {
        console.warn('Site settings snapshot warning:', error);
        setIsLoadingData(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Real-time listener for services collection
  useEffect(() => {
    const servicesCol = collection(db, 'services');
    const q = isAdmin ? servicesCol : query(servicesCol, where('is_active', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ServiceRecord[] = snapshot.docs.map((d) => d.data() as ServiceRecord);
          items.sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));
          setServices(items);
          setHasRemoteServices(true);
        } else if (!hasRemoteServices) {
          setServices(DEFAULT_SERVICES.map((s) => ({ ...s, authorId: 'system' })));
        }
      },
      (error) => {
        console.warn('Services snapshot warning:', error);
      }
    );
    return () => unsubscribe();
  }, [isAdmin, hasRemoteServices]);

  // 3. Real-time listener for media collection
  useEffect(() => {
    const mediaCol = collection(db, 'media');
    const q = query(mediaCol, where('isPublic', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: MediaAssetRecord[] = snapshot.docs.map((d) => d.data() as MediaAssetRecord);
          setMediaAssets(items);
        } else {
          setMediaAssets(DEFAULT_MEDIA_ASSETS.map((m) => ({ ...m, uploadedBy: 'system' })));
        }
      },
      (error) => {
        console.warn('Media snapshot warning:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // 4. Real-time listener for messages collection (Admin only)
  useEffect(() => {
    if (!isAuthReady || !isAdmin || !user) {
      setMessages([]);
      return;
    }

    const messagesCol = collection(db, 'messages');
    const q = query(messagesCol, where('recipientRole', '==', 'admin'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ContactMessageRecord[] = snapshot.docs.map(
          (d) => d.data() as ContactMessageRecord
        );
        items.sort((a, b) => {
          const getMs = (ts: unknown): number => {
            if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
              return (ts as { toMillis: () => number }).toMillis();
            }
            return 0;
          };
          return getMs(b.createdAt) - getMs(a.createdAt);
        });
        setMessages(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );
    return () => unsubscribe();
  }, [isAuthReady, isAdmin, user]);

  // Seed default database helper (accessible to Admin and auto-triggered if empty on first Admin login)
  const seedDefaultDatabase = useCallback(async () => {
    if (!user || !isAdmin) return;
    setIsSeeding(true);
    try {
      // 1. Seed site_settings/main if missing
      const settingsRef = doc(db, 'site_settings', 'main');
      const existingSettings = await getDoc(settingsRef);
      if (!existingSettings.exists()) {
        await setDoc(settingsRef, {
          id: 'main',
          company_name: DEFAULT_SITE_SETTINGS.company_name.slice(0, LIMITS.siteSettings.company_name),
          company_name_bn: DEFAULT_SITE_SETTINGS.company_name_bn.slice(0, LIMITS.siteSettings.company_name_bn),
          logo_url: DEFAULT_SITE_SETTINGS.logo_url.slice(0, LIMITS.siteSettings.logo_url),
          hero_title_en: DEFAULT_SITE_SETTINGS.hero_title_en.slice(0, LIMITS.siteSettings.hero_title_en),
          hero_title_bn: DEFAULT_SITE_SETTINGS.hero_title_bn.slice(0, LIMITS.siteSettings.hero_title_bn),
          hero_desc_en: DEFAULT_SITE_SETTINGS.hero_desc_en.slice(0, LIMITS.siteSettings.hero_desc_en),
          hero_desc_bn: DEFAULT_SITE_SETTINGS.hero_desc_bn.slice(0, LIMITS.siteSettings.hero_desc_bn),
          hero_video_url: DEFAULT_SITE_SETTINGS.hero_video_url.slice(0, LIMITS.siteSettings.hero_video_url),
          promo_video_url: DEFAULT_SITE_SETTINGS.promo_video_url.slice(0, LIMITS.siteSettings.promo_video_url),
          about_title_en: DEFAULT_SITE_SETTINGS.about_title_en.slice(0, LIMITS.siteSettings.about_title_en),
          about_title_bn: DEFAULT_SITE_SETTINGS.about_title_bn.slice(0, LIMITS.siteSettings.about_title_bn),
          about_desc_en: DEFAULT_SITE_SETTINGS.about_desc_en.slice(0, LIMITS.siteSettings.about_desc_en),
          about_desc_bn: DEFAULT_SITE_SETTINGS.about_desc_bn.slice(0, LIMITS.siteSettings.about_desc_bn),
          about_image_url: DEFAULT_SITE_SETTINGS.about_image_url.slice(0, LIMITS.siteSettings.about_image_url),
          contact_email: DEFAULT_SITE_SETTINGS.contact_email.slice(0, LIMITS.siteSettings.contact_email),
          contact_phone: DEFAULT_SITE_SETTINGS.contact_phone.slice(0, LIMITS.siteSettings.contact_phone),
          address_en: DEFAULT_SITE_SETTINGS.address_en.slice(0, LIMITS.siteSettings.address_en),
          address_bn: DEFAULT_SITE_SETTINGS.address_bn.slice(0, LIMITS.siteSettings.address_bn),
          facebook_link: DEFAULT_SITE_SETTINGS.facebook_link.slice(0, LIMITS.siteSettings.facebook_link),
          youtube_link: DEFAULT_SITE_SETTINGS.youtube_link.slice(0, LIMITS.siteSettings.youtube_link),
          updatedBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 2. Seed default services if missing
      for (const srv of DEFAULT_SERVICES) {
        const srvRef = doc(db, 'services', srv.id);
        const snap = await getDoc(srvRef);
        if (!snap.exists()) {
          await setDoc(srvRef, {
            id: srv.id,
            icon_name: srv.icon_name.slice(0, LIMITS.serviceItem.icon_name),
            title_en: srv.title_en.slice(0, LIMITS.serviceItem.title_en),
            title_bn: srv.title_bn.slice(0, LIMITS.serviceItem.title_bn),
            description_en: srv.description_en.slice(0, LIMITS.serviceItem.description_en),
            description_bn: srv.description_bn.slice(0, LIMITS.serviceItem.description_bn),
            order_number: srv.order_number,
            is_active: srv.is_active,
            authorId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // 3. Seed default media assets if missing
      for (const media of DEFAULT_MEDIA_ASSETS) {
        const mediaRef = doc(db, 'media', media.id);
        const snap = await getDoc(mediaRef);
        if (!snap.exists()) {
          await setDoc(mediaRef, {
            id: media.id,
            name: media.name.slice(0, LIMITS.mediaAsset.name),
            url: media.url.slice(0, LIMITS.mediaAsset.url),
            category: media.category,
            sizeBytes: media.sizeBytes,
            mimeType: media.mimeType,
            isPublic: true,
            uploadedBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seed_default_database');
    } finally {
      setIsSeeding(false);
    }
  }, [user, isAdmin]);

  // Auto-seed once when admin logs in and remote settings don't exist yet
  useEffect(() => {
    if (isAuthReady && isAdmin && user && !isLoadingData && !hasRemoteSettings && !autoSeededRef.current) {
      autoSeededRef.current = true;
      seedDefaultDatabase().catch((err) => console.warn('Auto-seed error:', err));
    }
  }, [isAuthReady, isAdmin, user, isLoadingData, hasRemoteSettings, seedDefaultDatabase]);

  // Auth Actions
  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logoutAdmin = useCallback(async () => {
    await signOut(auth);
    navigate('/admin/login');
  }, [navigate]);

  // CRUD: Save Site Settings
  const saveSiteSettings = useCallback(
    async (values: SiteSettingsFormValues) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      const settingsRef = doc(db, 'site_settings', 'main');
      const sanitized = {
        company_name: values.company_name.trim().slice(0, LIMITS.siteSettings.company_name),
        company_name_bn: values.company_name_bn.trim().slice(0, LIMITS.siteSettings.company_name_bn),
        logo_url: (values.logo_url || '').slice(0, LIMITS.siteSettings.logo_url),
        hero_title_en: values.hero_title_en.trim().slice(0, LIMITS.siteSettings.hero_title_en),
        hero_title_bn: values.hero_title_bn.trim().slice(0, LIMITS.siteSettings.hero_title_bn),
        hero_desc_en: values.hero_desc_en.trim().slice(0, LIMITS.siteSettings.hero_desc_en),
        hero_desc_bn: values.hero_desc_bn.trim().slice(0, LIMITS.siteSettings.hero_desc_bn),
        hero_video_url: (values.hero_video_url || '').trim().slice(0, LIMITS.siteSettings.hero_video_url),
        promo_video_url: (values.promo_video_url || '').trim().slice(0, LIMITS.siteSettings.promo_video_url),
        about_title_en: values.about_title_en.trim().slice(0, LIMITS.siteSettings.about_title_en),
        about_title_bn: values.about_title_bn.trim().slice(0, LIMITS.siteSettings.about_title_bn),
        about_desc_en: values.about_desc_en.trim().slice(0, LIMITS.siteSettings.about_desc_en),
        about_desc_bn: values.about_desc_bn.trim().slice(0, LIMITS.siteSettings.about_desc_bn),
        about_image_url: (values.about_image_url || '').slice(0, LIMITS.siteSettings.about_image_url),
        contact_email: values.contact_email.trim().slice(0, LIMITS.siteSettings.contact_email),
        contact_phone: values.contact_phone.trim().slice(0, LIMITS.siteSettings.contact_phone),
        address_en: values.address_en.trim().slice(0, LIMITS.siteSettings.address_en),
        address_bn: values.address_bn.trim().slice(0, LIMITS.siteSettings.address_bn),
        facebook_link: (values.facebook_link || '').trim().slice(0, LIMITS.siteSettings.facebook_link),
        youtube_link: (values.youtube_link || '').trim().slice(0, LIMITS.siteSettings.youtube_link),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      };

      try {
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          await updateDoc(settingsRef, sanitized);
        } else {
          await setDoc(settingsRef, {
            id: 'main',
            ...sanitized,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
      }
    },
    [user, isAdmin]
  );

  // CRUD: Services
  const createService = useCallback(
    async (values: ServiceItemFormValues) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      const id = sanitizeId(`srv_${Date.now()}`);
      const srvRef = doc(db, 'services', id);
      try {
        await setDoc(srvRef, {
          id,
          icon_name: values.icon_name.trim().slice(0, LIMITS.serviceItem.icon_name),
          title_en: values.title_en.trim().slice(0, LIMITS.serviceItem.title_en),
          title_bn: values.title_bn.trim().slice(0, LIMITS.serviceItem.title_bn),
          description_en: values.description_en.trim().slice(0, LIMITS.serviceItem.description_en),
          description_bn: values.description_bn.trim().slice(0, LIMITS.serviceItem.description_bn),
          order_number: Number(values.order_number) || 0,
          is_active: Boolean(values.is_active),
          authorId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `services/${id}`);
      }
    },
    [user, isAdmin]
  );

  const updateService = useCallback(
    async (id: string, values: Partial<ServiceItemFormValues>) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      const srvRef = doc(db, 'services', id);
      try {
        const snap = await getDoc(srvRef);
        if (!snap.exists()) {
          // If editing a fallback service before seeding, seed it first
          const fallback = services.find((s) => s.id === id);
          if (fallback) {
            await setDoc(srvRef, {
              id,
              icon_name: (values.icon_name ?? fallback.icon_name).slice(0, LIMITS.serviceItem.icon_name),
              title_en: (values.title_en ?? fallback.title_en).slice(0, LIMITS.serviceItem.title_en),
              title_bn: (values.title_bn ?? fallback.title_bn).slice(0, LIMITS.serviceItem.title_bn),
              description_en: (values.description_en ?? fallback.description_en).slice(
                0,
                LIMITS.serviceItem.description_en
              ),
              description_bn: (values.description_bn ?? fallback.description_bn).slice(
                0,
                LIMITS.serviceItem.description_bn
              ),
              order_number: values.order_number ?? fallback.order_number,
              is_active: values.is_active ?? fallback.is_active,
              authorId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            return;
          }
        }

        const payload: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (values.icon_name !== undefined) {
          payload.icon_name = values.icon_name.trim().slice(0, LIMITS.serviceItem.icon_name);
        }
        if (values.title_en !== undefined) {
          payload.title_en = values.title_en.trim().slice(0, LIMITS.serviceItem.title_en);
        }
        if (values.title_bn !== undefined) {
          payload.title_bn = values.title_bn.trim().slice(0, LIMITS.serviceItem.title_bn);
        }
        if (values.description_en !== undefined) {
          payload.description_en = values.description_en
            .trim()
            .slice(0, LIMITS.serviceItem.description_en);
        }
        if (values.description_bn !== undefined) {
          payload.description_bn = values.description_bn
            .trim()
            .slice(0, LIMITS.serviceItem.description_bn);
        }
        if (values.order_number !== undefined) {
          payload.order_number = Number(values.order_number);
        }
        if (values.is_active !== undefined) {
          payload.is_active = Boolean(values.is_active);
        }

        await updateDoc(srvRef, payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
      }
    },
    [user, isAdmin, services]
  );

  const reorderServices = useCallback(
    async (orderedIds: string[]) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      // Optimistically update local order
      setServices((prev) => {
        const map = new Map<string, ServiceRecord>(prev.map((item) => [item.id, item]));
        return orderedIds
          .map((id, idx) => {
            const found = map.get(id);
            return found ? { ...found, order_number: idx + 1 } : null;
          })
          .filter((x): x is ServiceRecord => x !== null);
      });

      try {
        for (let i = 0; i < orderedIds.length; i++) {
          const id = orderedIds[i];
          const srvRef = doc(db, 'services', id);
          const snap = await getDoc(srvRef);
          if (snap.exists()) {
            const existingData = snap.data() as ServiceRecord;
            if (existingData.order_number !== i + 1) {
              await updateDoc(srvRef, {
                order_number: i + 1,
                is_active: existingData.is_active,
                updatedAt: serverTimestamp(),
              });
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'services/reorder');
      }
    },
    [user, isAdmin]
  );

  const deleteService = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
      }
    },
    [user, isAdmin]
  );

  // Public Contact Form Submission
  const submitContactMessage = useCallback(async (values: ContactMessageFormValues) => {
    const id = sanitizeId(`msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const msgRef = doc(db, 'messages', id);
    try {
      await setDoc(msgRef, {
        id,
        name: values.name.trim().slice(0, LIMITS.contactMessage.name),
        email: values.email.trim().slice(0, LIMITS.contactMessage.email),
        message: values.message.trim().slice(0, LIMITS.contactMessage.message),
        status: 'unread',
        recipientRole: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `messages/${id}`);
    }
  }, []);

  const updateMessageStatus = useCallback(
    async (id: string, status: 'unread' | 'read' | 'archived') => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      try {
        await updateDoc(doc(db, 'messages', id), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `messages/${id}`);
      }
    },
    [user, isAdmin]
  );

  const deleteMessage = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      try {
        await deleteDoc(doc(db, 'messages', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
      }
    },
    [user, isAdmin]
  );

  // Media Upload with browser-image-compression
  const uploadMediaFile = useCallback(
    async (file: File, category: 'logo' | 'hero' | 'service' | 'general') => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      const compressed = await compressAndConvertToDataUrl(file);
      const id = sanitizeId(`media_${Date.now()}`);
      const mediaRef = doc(db, 'media', id);

      try {
        await setDoc(mediaRef, {
          id,
          name: compressed.fileName.slice(0, LIMITS.mediaAsset.name),
          url: compressed.dataUrl.slice(0, LIMITS.mediaAsset.url),
          category,
          sizeBytes: compressed.compressedBytes,
          mimeType: compressed.mimeType.slice(0, LIMITS.mediaAsset.mimeType),
          isPublic: true,
          uploadedBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return {
          url: compressed.dataUrl,
          compressedBytes: compressed.compressedBytes,
          originalBytes: compressed.originalBytes,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `media/${id}`);
      }
    },
    [user, isAdmin]
  );

  const deleteMediaAsset = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) throw new Error('Unauthorized');
      try {
        await deleteDoc(doc(db, 'media', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
      }
    },
    [user, isAdmin]
  );

  const activeServices = services.filter((s) => s.is_active);
  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
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
        isLoadingData,
        isSeeding,
        loginWithGoogle,
        loginWithEmail,
        logoutAdmin,
        saveSiteSettings,
        createService,
        updateService,
        reorderServices,
        deleteService,
        submitContactMessage,
        updateMessageStatus,
        deleteMessage,
        uploadMediaFile,
        deleteMediaAsset,
        seedDefaultDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
