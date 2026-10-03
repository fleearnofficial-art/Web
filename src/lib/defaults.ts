import heroWorkspaceImg from '../assets/images/hero_enterprise_workspace_1791054491764.jpg';
import aboutTeamImg from '../assets/images/about_engineering_team_1791054504056.jpg';
import portfolioFintechImg from '../assets/images/portfolio_fintech_platform_1791054516139.jpg';
import portfolioCloudImg from '../assets/images/portfolio_cloud_infrastructure_1791054527041.jpg';

export const GENERATED_IMAGES = {
  heroWorkspace: heroWorkspaceImg,
  aboutTeam: aboutTeamImg,
  portfolioFintech: portfolioFintechImg,
  portfolioCloud: portfolioCloudImg,
};

export interface SiteSettingsRecord {
  id: string;
  company_name: string;
  company_name_bn: string;
  logo_url: string;
  hero_title_en: string;
  hero_title_bn: string;
  hero_desc_en: string;
  hero_desc_bn: string;
  hero_video_url: string;
  promo_video_url: string;
  about_title_en: string;
  about_title_bn: string;
  about_desc_en: string;
  about_desc_bn: string;
  about_image_url: string;
  contact_email: string;
  contact_phone: string;
  address_en: string;
  address_bn: string;
  facebook_link: string;
  youtube_link: string;
  updatedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceRecord {
  id: string;
  icon_name: string;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  order_number: number;
  is_active: boolean;
  authorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  recipientRole: 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAssetRecord {
  id: string;
  name: string;
  url: string;
  category: 'logo' | 'hero' | 'service' | 'general';
  sizeBytes: number;
  mimeType: string;
  isPublic: boolean;
  uploadedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  role: 'admin';
  addedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsRecord = {
  id: 'main',
  company_name: 'Company Pro',
  company_name_bn: 'কোম্পানি প্রো',
  logo_url: '',
  hero_title_en: 'Engineering Digital Systems That Scale Enterprise Revenue',
  hero_title_bn: 'আধুনিক ব্যবসার প্রবৃদ্ধির জন্য বিশ্বমানের ডিজিটাল সফটওয়্যার ও ক্লাউড ইঞ্জিনিয়ারিং',
  hero_desc_en:
    'We design and ship production-grade web platforms, automated cloud infrastructure, and bilingual enterprise systems with measurable operational outcomes.',
  hero_desc_bn:
    'আমরা আপনার প্রতিষ্ঠানের জন্য দ্রুতগতির ওয়েব প্ল্যাটফর্ম, অটোমেটেড ক্লাউড আর্কিটেকচার এবং নিরাপদ এন্টারপ্রাইজ সফটওয়্যার তৈরি করি যা আপনার ব্যবসাকে এগিয়ে রাখে।',
  hero_video_url: '',
  promo_video_url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
  about_title_en: 'Built by Principal Architects & Product Engineers',
  about_title_bn: 'অভিজ্ঞ সফটওয়্যার আর্কিটেক্ট ও প্রোডাক্ট ইঞ্জিনিয়ারদের সমন্বয়ে গঠিত',
  about_desc_en:
    'Founded in Dhaka with engineering hubs serving global enterprises, Company Pro partners with ambitious organizations to modernize legacy workflows, launch resilient SaaS products, and reduce infrastructure latency across every customer touchpoint.',
  about_desc_bn:
    'ঢাকা ও আন্তর্জাতিক বাজারে শীর্ষস্থানীয় প্রতিষ্ঠানগুলোর নির্ভরযোগ্য প্রযুক্তি অংশীদার হিসেবে কোম্পানি প্রো কাজ করছে। আমরা জটিল ব্যবসায়িক প্রক্রিয়াকে সহজ, দ্রুত এবং শতভাগ নিরাপদ ডিজিটাল প্ল্যাটফর্মে রূপান্তর করি।',
  about_image_url: aboutTeamImg,
  contact_email: 'hello@companypro.io',
  contact_phone: '+880 1711-489200',
  address_en: 'Level 14,Ventura Iconia Tower, Banani Road 11, Dhaka 1213, Bangladesh',
  address_bn: 'লেভেল ১৪, ভেঞ্চুরা আইকনিয়া টাওয়ার, বনানী রোড ১১, ঢাকা ১২১৩, বাংলাদেশ',
  facebook_link: 'https://facebook.com',
  youtube_link: 'https://youtube.com',
};

export const DEFAULT_SERVICES: Omit<ServiceRecord, 'authorId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'srv_fullstack_platforms',
    icon_name: 'Layers',
    title_en: 'Full-Stack Web Platforms',
    title_bn: 'ফুল-স্ট্যাক ওয়েব প্ল্যাটফর্ম',
    description_en:
      'Custom Next.js and TypeScript web applications engineered for sub-second page loads, strict SEO compliance, and multi-region availability.',
    description_bn:
      'নেক্সট.জেএস এবং টাইপস্ক্রিপ্ট প্রযুক্তিতে তৈরি দ্রুতগতির, এসইও-বান্ধব এবং আধুনিক ওয়েব অ্যাপ্লিকেশন যা যেকোনো ডিভাইসে নিখুঁতভাবে কাজ করে।',
    order_number: 1,
    is_active: true,
  },
  {
    id: 'srv_cloud_infrastructure',
    icon_name: 'Cpu',
    title_en: 'Cloud & DevOps Automation',
    title_bn: 'ক্লাউড ও ডেভঅপস অটোমেশন',
    description_en:
      'Zero-downtime CI/CD pipelines, containerized microservices, and automated database scaling with 99.98% guaranteed production uptime.',
    description_bn:
      'জিরো-ডাউনটাইম ডিপ্লয়মেন্ট, অটোমেটেড ডাটাবেস স্কেলিং এবং ৯৯.৯৮% আপটাইম নিশ্চয়তাসহ আধুনিক ক্লাউড ইনফ্রাস্ট্রাকচার ব্যবস্থাপনা।',
    order_number: 2,
    is_active: true,
  },
  {
    id: 'srv_enterprise_security',
    icon_name: 'ShieldCheck',
    title_en: 'Zero-Trust Security & RBAC',
    title_bn: 'জিরো-ট্রাস্ট সিকিউরিটি ও অ্যাক্সেস কন্ট্রোল',
    description_en:
      'Attribute-based access control, end-to-end encryption, and automated compliance auditing to protect sensitive customer and financial records.',
    description_bn:
      'প্রতিষ্ঠানের সংবেদনশীল তথ্য ও গ্রাহক ডাটা সুরক্ষিত রাখতে আধুনিক রোল-বেসড অ্যাক্সেস কন্ট্রোল এবং এন্ড-টু-এন্ড সিকিউরিটি অডিট।',
    order_number: 3,
    is_active: true,
  },
  {
    id: 'srv_data_analytics',
    icon_name: 'BarChart3',
    title_en: 'Executive BI & Data Pipelines',
    title_bn: 'বিজনেস ইন্টেলিজেন্স ও ডাটা অ্যানালিটিক্স',
    description_en:
      'Real-time operational telemetry dashboards, financial ledger normalization, and predictive revenue reporting for leadership teams.',
    description_bn:
      'রিয়েল-টাইম বিজনেস ড্যাশবোর্ড, আর্থিক প্রতিবেদন এবং ডাটা অ্যানালিটিক্স সিস্টেম যা দ্রুত ও সঠিক ব্যবসায়িক সিদ্ধান্ত নিতে সহায়তা করে।',
    order_number: 4,
    is_active: true,
  },
  {
    id: 'srv_mobile_commerce',
    icon_name: 'Smartphone',
    title_en: 'Omnichannel E-Commerce Engines',
    title_bn: 'অমনিচ্যানেল ই-কমার্স সলিউশন',
    description_en:
      'High-conversion checkout architectures, real-time inventory synchronization, and localized payment gateway integrations.',
    description_bn:
      'দ্রুতগতির চেকআউট, রিয়েল-টাইম ইনভেন্টরি ট্র্যাকিং এবং লোকাল ও আন্তর্জাতিক পেমেন্ট গেটওয়ে যুক্ত পূর্ণাঙ্গ ই-কমার্স সিস্টেম।',
    order_number: 5,
    is_active: true,
  },
  {
    id: 'srv_api_ecosystems',
    icon_name: 'Workflow',
    title_en: 'Enterprise API & ERP Integration',
    title_bn: 'এন্টারপ্রাইজ এপিআই ও ইআরপি ইন্টিগ্রেশন',
    description_en:
      'Unified GraphQL and REST API gateways connecting CRM, ERP, billing, and logistics workflows into one cohesive operational backbone.',
    description_bn:
      'সিআরএম, ইআরপি, বিলিং এবং লজিস্টিকস সিস্টেমকে একীভূত করার জন্য নিরাপদ ও উচ্চ-ক্ষমতাসম্পন্ন এপিআই গেটওয়ে তৈরি।',
    order_number: 6,
    is_active: true,
  },
];

export const DEFAULT_MEDIA_ASSETS: Omit<MediaAssetRecord, 'uploadedBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'media_hero_workspace',
    name: 'enterprise-engineering-studio.jpg',
    url: heroWorkspaceImg,
    category: 'hero',
    sizeBytes: 184320,
    mimeType: 'image/jpeg',
    isPublic: true,
  },
  {
    id: 'media_about_team',
    name: 'principal-architecture-team.jpg',
    url: aboutTeamImg,
    category: 'general',
    sizeBytes: 162400,
    mimeType: 'image/jpeg',
    isPublic: true,
  },
  {
    id: 'media_portfolio_fintech',
    name: 'fintech-ledger-platform.jpg',
    url: portfolioFintechImg,
    category: 'service',
    sizeBytes: 175100,
    mimeType: 'image/jpeg',
    isPublic: true,
  },
  {
    id: 'media_portfolio_cloud',
    name: 'cloud-orchestration-console.jpg',
    url: portfolioCloudImg,
    category: 'service',
    sizeBytes: 168900,
    mimeType: 'image/jpeg',
    isPublic: true,
  },
];

// Clean vector Lottie animation data (procedural architectural pulse & data nodes)
export const HERO_LOTTIE_DATA = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 180,
  w: 400,
  h: 400,
  nm: 'Enterprise System Pulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Inner Core Ring',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 180, s: [360] },
          ],
        },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [95, 95, 100], e: [105, 105, 100] },
            { t: 90, s: [105, 105, 100], e: [95, 95, 100] },
            { t: 180, s: [95, 95, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [220, 220] },
              p: { a: 0, k: [0, 0] },
              nm: 'Ellipse',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.31, 0.27, 0.9, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2,
              d: [
                { n: 'd', nm: 'dash', v: { a: 0, k: 40 } },
                { n: 'g', nm: 'gap', v: { a: 0, k: 25 } },
              ],
              nm: 'Stroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Ring Group',
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Outer Pulse',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [70], e: [15] },
            { t: 90, s: [15], e: [70] },
            { t: 180, s: [70] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80, 100], e: [125, 125, 100] },
            { t: 90, s: [125, 125, 100], e: [80, 80, 100] },
            { t: 180, s: [80, 80, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [300, 300] },
              p: { a: 0, k: [0, 0] },
              nm: 'Outer Circle',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.08, 0.72, 0.65, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 },
              lc: 2,
              lj: 2,
              nm: 'Stroke 2',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Outer Group',
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
      bm: 0,
    },
  ],
};
