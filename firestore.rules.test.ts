/**
 * Firestore Security Rules Test Suite (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface SimulatedRequest {
  description: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  resourceData?: Record<string, unknown>;
  existingData?: Record<string, unknown>;
  useServerTimestamp?: boolean;
}

export const DIRTY_DOZEN_TESTS: SimulatedRequest[] = [
  {
    description: '1. Shadow Field Injection on site_settings',
    operation: 'create',
    path: '/site_settings/main',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    resourceData: {
      id: 'main',
      company_name: 'Apex Corp',
      company_name_bn: 'এপেক্স কর্প',
      logo_url: '',
      hero_title_en: 'Hero',
      hero_title_bn: 'হিরো',
      hero_desc_en: 'Desc',
      hero_desc_bn: 'বিবরণ',
      hero_video_url: '',
      promo_video_url: '',
      about_title_en: 'About',
      about_title_bn: 'সম্পর্কে',
      about_desc_en: 'About desc',
      about_desc_bn: 'সম্পর্কে বিবরণ',
      about_image_url: '',
      contact_email: 'info@apex.com',
      contact_phone: '+8801700000000',
      address_en: 'Dhaka',
      address_bn: 'ঢাকা',
      facebook_link: '',
      youtube_link: '',
      updatedBy: 'admin_1',
      isVerifiedAdmin: true, // Shadow field!
    },
  },
  {
    description: '2. Email Spoofing Attack (email_verified: false)',
    operation: 'update',
    path: '/site_settings/main',
    auth: { uid: 'spoof_uid', email: 'enrzxpvt@gmail.com', email_verified: false },
    useServerTimestamp: true,
    resourceData: { company_name: 'Hacked' },
  },
  {
    description: '3. Identity Spoofing on services creation (authorId != request.auth.uid)',
    operation: 'create',
    path: '/services/srv_1',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    resourceData: {
      id: 'srv_1',
      icon_name: 'Code',
      title_en: 'Web Dev',
      title_bn: 'ওয়েব ডেভেলপমেন্ট',
      description_en: 'Full stack',
      description_bn: 'ফুল স্ট্যাক',
      order_number: 1,
      is_active: true,
      authorId: 'victim_uid',
    },
  },
  {
    description: '4. Resource Poisoning (Over-length message > 2000 chars)',
    operation: 'create',
    path: '/messages/msg_overflow',
    auth: null,
    useServerTimestamp: true,
    resourceData: {
      id: 'msg_overflow',
      name: 'Attacker',
      email: 'attacker@example.com',
      message: 'A'.repeat(2500),
      status: 'unread',
      recipientRole: 'admin',
    },
  },
  {
    description: '5. State Shortcutting on messages creation (status: archived on create)',
    operation: 'create',
    path: '/messages/msg_shortcut',
    auth: null,
    useServerTimestamp: true,
    resourceData: {
      id: 'msg_shortcut',
      name: 'Attacker',
      email: 'attacker@example.com',
      message: 'Shortcut status',
      status: 'archived',
      recipientRole: 'admin',
    },
  },
  {
    description: '6. PII Blanket Read on /messages by non-admin user',
    operation: 'get',
    path: '/messages/msg_1',
    auth: { uid: 'regular_user', email: 'user@example.com', email_verified: true },
  },
  {
    description: '7. Self-Assigned Admin Privilege Escalation on /admins',
    operation: 'create',
    path: '/admins/regular_user',
    auth: { uid: 'regular_user', email: 'user@example.com', email_verified: true },
    useServerTimestamp: true,
    resourceData: {
      uid: 'regular_user',
      email: 'user@example.com',
      role: 'admin',
      addedBy: 'regular_user',
    },
  },
  {
    description: '8. Immortal Field Mutation (createdAt/authorId) on services',
    operation: 'update',
    path: '/services/srv_1',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    existingData: {
      id: 'srv_1',
      authorId: 'admin_1',
      createdAt: '2026-01-01T00:00:00Z',
    },
    resourceData: {
      id: 'srv_1',
      authorId: 'other_uid',
      createdAt: '2026-02-01T00:00:00Z',
    },
  },
  {
    description: '9. Client-Forged Timestamp on messages creation',
    operation: 'create',
    path: '/messages/msg_forged_time',
    auth: null,
    useServerTimestamp: false,
    resourceData: {
      id: 'msg_forged_time',
      name: 'Time Forger',
      email: 'forger@example.com',
      message: 'Hello',
      status: 'unread',
      recipientRole: 'admin',
    },
  },
  {
    description: '10. Value Poisoning on Whitelisted Update Key (order_number as string)',
    operation: 'update',
    path: '/services/srv_1',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    resourceData: {
      order_number: 'first',
    },
  },
  {
    description: '11. Path Variable ID Poisoning',
    operation: 'create',
    path: '/services/invalid$id!with*spaces',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    resourceData: {
      id: 'invalid$id!with*spaces',
    },
  },
  {
    description: '12. Unauthorized Mutation of messages content during status update',
    operation: 'update',
    path: '/messages/msg_1',
    auth: { uid: 'admin_1', email: 'enrzxpvt@gmail.com', email_verified: true },
    useServerTimestamp: true,
    existingData: {
      id: 'msg_1',
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Original inquiry',
      status: 'unread',
      recipientRole: 'admin',
    },
    resourceData: {
      id: 'msg_1',
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Tampered inquiry',
      status: 'read',
      recipientRole: 'admin',
    },
  },
];
