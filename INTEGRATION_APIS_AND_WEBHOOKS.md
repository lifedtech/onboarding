# Lifed Operations — Webhooks & APIs Integration Specification

This document details all **Webhooks** and **REST APIs** required between the **Lifed Health Main Website (Laravel)**, the **Healthmate Dashboard (R&D Portal)**, and the **Lifed Operations Management Server**.

---

## 🌐 1. LifedHealth Website (Laravel Platform)

### Webhooks (Laravel Site ➔ Ops Server)

| Webhook Endpoint | Trigger Event | Payload Parameters |
| :--- | :--- | :--- |
| `POST /api/webhooks/traffic/ping` | Every page view / user session on `lifedhealth.com` | `path`, `sessionId`, `referrer`, `userAgent`, `ip`, `device` |
| `POST /api/webhooks/enquiries/created` | Public lead form or contact inquiry submitted | `name`, `contact`, `email`, `clientType`, `platformFound`, `city` |
| `POST /api/webhooks/payment/success` | Customer completes program booking payment | `bookingId`, `userId`, `amount`, `serviceName`, `transactionId` |
| `POST /api/webhooks/whatsapp/event` | Visitor starts a chat via WhatsApp widget | `phone`, `sourcePage`, `startedAt`, `sessionId` |
| `POST /api/webhooks/reviews/submitted` | User submits program review or rating | `programId`, `rating`, `reviewText`, `authorName` |

### REST APIs (Ops Server ↔ Laravel Site)

| HTTP Method | API Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/traffic` | Fetches live website traffic, top paths, and traffic sources for God View. |
| `GET` | `/api/analytics/funnel` | Fetches funnel conversion metrics (Visitors ➔ Bookings ➔ Reviews). |
| `GET` | `/api/analytics/user-growth` | Fetches app downloads, user registrations, and Monthly Active Users (MAU). |

---

## 🏥 2. Healthmate Dashboard (R&D / Partner Portal)

> **Security Note:** All incoming webhooks from the R&D / Healthmate portal require HMAC-SHA256 signature verification via the `X-RD-Signature` header using the shared `RD_WEBHOOK_SECRET`.

### Webhooks (Healthmate Portal ➔ Ops Server)

| Webhook Endpoint | Trigger Event | Payload Parameters |
| :--- | :--- | :--- |
| `POST /api/webhooks/registration-submitted` | Prospective partner submits onboarding form | `healthmateId`, `type`, `category`, `contactName`, `contactPhone` |
| `POST /api/webhooks/verification-completed` | R&D team verifies partner documents & credentials | `healthmateId`, `remark`, `verifiedAt` |
| `POST /api/webhooks/program-submitted` | Healthmate submits new program for review | `healthmateId`, `programTitle`, `programStartDate`, `programEndDate` |
| `POST /api/webhooks/program-status` | R&D approves or requests program correction | `healthmateId`, `status` (`APPROVED`/`CORRECTION_REQUIRED`), `approvedMessage` |

### REST APIs (Ops Server ↔ Healthmate Dashboard)

| HTTP Method | API Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/healthmates` | Retrieves all active healthmate partners and current onboarding phases. |
| `POST` | `/api/rnd/verify-credentials` | Admin endpoint to trigger/verify credentials and provision dashboard login. |
| `PATCH` | `/api/healthmates/:id/phase` | Manually transitions a healthmate between phases (`PRE_QUALIFY`, `REGISTER`, `PREPARE`, `REVIEW`, `LIVE`). |
| `GET` | `/api/healthmates/:id/tasks` | Retrieves mandatory onboarding task checklists for a healthmate. |
