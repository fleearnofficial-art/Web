import { z } from 'zod';
import blueprint from '../../firebase-blueprint.json';

const entities = blueprint.entities;

export const ID_PATTERN = new RegExp(
  entities.ServiceItem.properties.id.pattern || '^[a-zA-Z0-9_\\-]+$'
);
export const EMAIL_PATTERN = new RegExp(
  entities.SiteSettings.properties.contact_email.pattern || '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
);

export const LIMITS = {
  siteSettings: {
    company_name: entities.SiteSettings.properties.company_name.maxLength,
    company_name_bn: entities.SiteSettings.properties.company_name_bn.maxLength,
    logo_url: entities.SiteSettings.properties.logo_url.maxLength,
    hero_title_en: entities.SiteSettings.properties.hero_title_en.maxLength,
    hero_title_bn: entities.SiteSettings.properties.hero_title_bn.maxLength,
    hero_desc_en: entities.SiteSettings.properties.hero_desc_en.maxLength,
    hero_desc_bn: entities.SiteSettings.properties.hero_desc_bn.maxLength,
    hero_video_url: entities.SiteSettings.properties.hero_video_url.maxLength,
    promo_video_url: entities.SiteSettings.properties.promo_video_url.maxLength,
    about_title_en: entities.SiteSettings.properties.about_title_en.maxLength,
    about_title_bn: entities.SiteSettings.properties.about_title_bn.maxLength,
    about_desc_en: entities.SiteSettings.properties.about_desc_en.maxLength,
    about_desc_bn: entities.SiteSettings.properties.about_desc_bn.maxLength,
    about_image_url: entities.SiteSettings.properties.about_image_url.maxLength,
    contact_email: entities.SiteSettings.properties.contact_email.maxLength,
    contact_phone: entities.SiteSettings.properties.contact_phone.maxLength,
    address_en: entities.SiteSettings.properties.address_en.maxLength,
    address_bn: entities.SiteSettings.properties.address_bn.maxLength,
    facebook_link: entities.SiteSettings.properties.facebook_link.maxLength,
    youtube_link: entities.SiteSettings.properties.youtube_link.maxLength,
  },
  serviceItem: {
    id: entities.ServiceItem.properties.id.maxLength,
    icon_name: entities.ServiceItem.properties.icon_name.maxLength,
    title_en: entities.ServiceItem.properties.title_en.maxLength,
    title_bn: entities.ServiceItem.properties.title_bn.maxLength,
    description_en: entities.ServiceItem.properties.description_en.maxLength,
    description_bn: entities.ServiceItem.properties.description_bn.maxLength,
  },
  contactMessage: {
    id: entities.ContactMessage.properties.id.maxLength,
    name: entities.ContactMessage.properties.name.maxLength,
    email: entities.ContactMessage.properties.email.maxLength,
    message: entities.ContactMessage.properties.message.maxLength,
  },
  mediaAsset: {
    id: entities.MediaAsset.properties.id.maxLength,
    name: entities.MediaAsset.properties.name.maxLength,
    url: entities.MediaAsset.properties.url.maxLength,
    mimeType: entities.MediaAsset.properties.mimeType.maxLength,
  },
  adminUser: {
    uid: entities.AdminUser.properties.uid.maxLength,
    email: entities.AdminUser.properties.email.maxLength,
  },
} as const;

export const siteSettingsSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, 'Company name (English) is required')
    .max(LIMITS.siteSettings.company_name),
  company_name_bn: z
    .string()
    .trim()
    .min(1, 'Company name (Bangla) is required')
    .max(LIMITS.siteSettings.company_name_bn),
  logo_url: z.string().max(LIMITS.siteSettings.logo_url),
  hero_title_en: z
    .string()
    .trim()
    .min(1, 'Hero title (EN) is required')
    .max(LIMITS.siteSettings.hero_title_en),
  hero_title_bn: z
    .string()
    .trim()
    .min(1, 'Hero title (BN) is required')
    .max(LIMITS.siteSettings.hero_title_bn),
  hero_desc_en: z
    .string()
    .trim()
    .min(1, 'Hero description (EN) is required')
    .max(LIMITS.siteSettings.hero_desc_en),
  hero_desc_bn: z
    .string()
    .trim()
    .min(1, 'Hero description (BN) is required')
    .max(LIMITS.siteSettings.hero_desc_bn),
  hero_video_url: z.string().trim().max(LIMITS.siteSettings.hero_video_url),
  promo_video_url: z.string().trim().max(LIMITS.siteSettings.promo_video_url),
  about_title_en: z
    .string()
    .trim()
    .min(1, 'About title (EN) is required')
    .max(LIMITS.siteSettings.about_title_en),
  about_title_bn: z
    .string()
    .trim()
    .min(1, 'About title (BN) is required')
    .max(LIMITS.siteSettings.about_title_bn),
  about_desc_en: z
    .string()
    .trim()
    .min(1, 'About description (EN) is required')
    .max(LIMITS.siteSettings.about_desc_en),
  about_desc_bn: z
    .string()
    .trim()
    .min(1, 'About description (BN) is required')
    .max(LIMITS.siteSettings.about_desc_bn),
  about_image_url: z.string().max(LIMITS.siteSettings.about_image_url),
  contact_email: z
    .string()
    .trim()
    .min(3)
    .max(LIMITS.siteSettings.contact_email)
    .regex(EMAIL_PATTERN, 'Enter a valid email address'),
  contact_phone: z
    .string()
    .trim()
    .min(3, 'Phone number is required')
    .max(LIMITS.siteSettings.contact_phone),
  address_en: z
    .string()
    .trim()
    .min(1, 'Address (EN) is required')
    .max(LIMITS.siteSettings.address_en),
  address_bn: z
    .string()
    .trim()
    .min(1, 'Address (BN) is required')
    .max(LIMITS.siteSettings.address_bn),
  facebook_link: z.string().trim().max(LIMITS.siteSettings.facebook_link),
  youtube_link: z.string().trim().max(LIMITS.siteSettings.youtube_link),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export const serviceItemSchema = z.object({
  icon_name: z
    .string()
    .trim()
    .min(1, 'Select an icon')
    .max(LIMITS.serviceItem.icon_name),
  title_en: z
    .string()
    .trim()
    .min(1, 'English title is required')
    .max(LIMITS.serviceItem.title_en),
  title_bn: z
    .string()
    .trim()
    .min(1, 'Bangla title is required')
    .max(LIMITS.serviceItem.title_bn),
  description_en: z
    .string()
    .trim()
    .min(1, 'English description is required')
    .max(LIMITS.serviceItem.description_en),
  description_bn: z
    .string()
    .trim()
    .min(1, 'Bangla description is required')
    .max(LIMITS.serviceItem.description_bn),
  order_number: z.number().int().min(0).max(10000),
  is_active: z.boolean(),
});

export type ServiceItemFormValues = z.infer<typeof serviceItemSchema>;

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name')
    .max(LIMITS.contactMessage.name),
  email: z
    .string()
    .trim()
    .min(3)
    .max(LIMITS.contactMessage.email)
    .regex(EMAIL_PATTERN, 'Please enter a valid email address'),
  message: z
    .string()
    .trim()
    .min(5, 'Please write a brief message (min 5 characters)')
    .max(LIMITS.contactMessage.message),
});

export type ContactMessageFormValues = z.infer<typeof contactMessageSchema>;

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}
