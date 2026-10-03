# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Global Default Deny**: Any path not explicitly matched in `/site_settings/{settingId}`, `/services/{serviceId}`, `/messages/{messageId}`, `/media/{mediaId}`, or `/admins/{adminUid}` is strictly denied (`allow read, write: if false;`).
2. **Admin Verification Invariant**: Administrative privileges (`isAdmin()`) require an authenticated session (`request.auth != null`), a verified email (`request.auth.token.email_verified == true`), and either the bootstrapped super admin email (`enrzxpvt@gmail.com`) or an existing document in `/admins/$(request.auth.uid)`.
3. **Path Variable Hardening (`isValidId`)**: Every single-document operation (`get`, `create`, `update`, `delete`) validates the path parameter against `^[a-zA-Z0-9_\-]+$` with maximum length `128`.
4. **Strict Schema & Key Whitelisting (`hasAll` & `hasOnly`)**: Every `create` and `update` invokes its entity validation blueprint (`isValidSiteSettings`, `isValidServiceItem`, `isValidContactMessage`, `isValidMediaAsset`, `isValidAdminUser`), rejecting any unwhitelisted "shadow" or "ghost" fields.
5. **Temporal Integrity (`request.time`)**: Every `create` requires `createdAt == request.time && updatedAt == request.time`. Every `update` requires `updatedAt == request.time && createdAt == resource.data.createdAt`.
6. **PII Isolation (`/messages` and `/admins`)**: Inbound contact messages and admin records contain email addresses (PII). Reading (`get` or `list`) `/messages` or `/admins` is strictly forbidden to anonymous users or non-admin signed-in users.
7. **Terminal State Locking (`/messages`)**: Once a contact message reaches `status == 'archived'`, non-admin updates are locked; only verified admins can transition message status (`read`, `unread`, `archived`) via action-scoped `affectedKeys().hasOnly(['status', 'updatedAt'])`.
8. **Zero-Cost List Query Enforcement**: No `allow list` block performs `get()` or `exists()` lookups. Every `allow list` block evaluates `resource.data` directly.

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Shadow Field Injection on `site_settings`
Attempts to inject an unwhitelisted `isVerifiedAdmin: true` field into `/site_settings/main`.
```json
{
  "id": "main",
  "company_name": "Apex Corp",
  "company_name_bn": "এপেক্স কর্প",
  "logo_url": "",
  "hero_title_en": "Hero",
  "hero_title_bn": "হিরো",
  "hero_desc_en": "Desc",
  "hero_desc_bn": "বিবরণ",
  "hero_video_url": "",
  "promo_video_url": "",
  "about_title_en": "About",
  "about_title_bn": "সম্পর্কে",
  "about_desc_en": "About desc",
  "about_desc_bn": "সম্পর্কে বিবরণ",
  "about_image_url": "",
  "contact_email": "info@apex.com",
  "contact_phone": "+8801700000000",
  "address_en": "Dhaka",
  "address_bn": "ঢাকা",
  "facebook_link": "",
  "youtube_link": "",
  "updatedBy": "admin_1",
  "isVerifiedAdmin": true
}
```

### Payload 2: Email Spoofing Attack on `/site_settings/main`
Authenticated user with `email: "enrzxpvt@gmail.com"` but `email_verified: false` attempting to update site settings.
```json
{
  "auth": {
    "uid": "spoof_uid",
    "token": {
      "email": "enrzxpvt@gmail.com",
      "email_verified": false
    }
  }
}
```

### Payload 3: Identity Spoofing on `services` Creation
Admin user attempting to create a service document where `authorId` is set to another user's UID (`"victim_uid"` != `request.auth.uid`).
```json
{
  "id": "srv_1",
  "icon_name": "Code",
  "title_en": "Web Dev",
  "title_bn": "ওয়েব ডেভেলপমেন্ট",
  "description_en": "Full stack",
  "description_bn": "ফুল স্ট্যাক",
  "order_number": 1,
  "is_active": true,
  "authorId": "victim_uid"
}
```

### Payload 4: Resource Poisoning (1MB String) on `messages`
Public user attempting to submit a contact message with a 5,000-character `message` body (exceeding `maxLength: 2000`).
```json
{
  "id": "msg_overflow",
  "name": "Attacker",
  "email": "attacker@example.com",
  "message": "A...(5000 chars)...",
  "status": "unread",
  "recipientRole": "admin"
}
```

### Payload 5: State Shortcutting on `messages` Creation
Public user attempting to create a message directly in `"archived"` status instead of `"unread"`.
```json
{
  "id": "msg_shortcut",
  "name": "Attacker",
  "email": "attacker@example.com",
  "message": "Bypassing unread queue",
  "status": "archived",
  "recipientRole": "admin"
}
```

### Payload 6: PII Blanket Read on `/messages/{messageId}`
Signed-in non-admin user attempting to `get` or `list` `/messages` to scrape customer emails and messages.
```json
{
  "auth": {
    "uid": "regular_user_123",
    "token": {
      "email": "user@example.com",
      "email_verified": true
    }
  },
  "operation": "list",
  "path": "/messages"
}
```

### Payload 7: Self-Assigned Admin Privilege Escalation on `/admins/{uid}`
Regular verified user attempting to create `/admins/regular_user_123` with `role: "admin"` to grant themselves super admin rights.
```json
{
  "uid": "regular_user_123",
  "email": "user@example.com",
  "role": "admin",
  "addedBy": "regular_user_123"
}
```

### Payload 8: Immortal Field Mutation (`createdAt` / `authorId`) on `services`
Admin attempting to mutate `createdAt` or `authorId` during a service update.
```json
{
  "id": "srv_1",
  "authorId": "mutated_author_uid",
  "createdAt": "2020-01-01T00:00:00Z"
}
```

### Payload 9: Client-Forged Timestamp on `messages` Creation
User attempting to pass a past or future timestamp instead of `request.time` (`serverTimestamp()`).
```json
{
  "id": "msg_forged_time",
  "name": "Time Forger",
  "email": "forger@example.com",
  "message": "Hello",
  "status": "unread",
  "recipientRole": "admin",
  "createdAt": "2099-01-01T00:00:00Z",
  "updatedAt": "2099-01-01T00:00:00Z"
}
```

### Payload 10: Value Poisoning on Whitelisted Update Key (`order_number`)
Attempting to update `order_number` on a service with a string `"first"` instead of a `number`.
```json
{
  "order_number": "first"
}
```

### Payload 11: Path Variable ID Poisoning
Attempting to create a document at `/services/invalid$id!with*spaces` that violates `^[a-zA-Z0-9_\-]+$`.
```json
{
  "path": "/services/invalid$id!with*spaces"
}
```

### Payload 12: Unauthorized Mutation of `messages` Content During Status Update
Admin attempting to alter the sender's `message` text or `email` when updating a message's status.
```json
{
  "status": "read",
  "message": "Tampered message content"
}
```
