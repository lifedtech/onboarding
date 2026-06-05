# Lifed Healthmate Onboarding — R&D Integration & Webhooks Guide

This guide provides details on how to integrate the R&D team's systems and processes with the **Lifed Healthmate Onboarding Manager** (Ops system) via webhooks and APIs. It details the webhook payloads, transitions, security signature verification, automated credential provisioning, and environment configuration.

---

## 1. Environment Configuration & API Keys

All third-party credentials, integration secrets, and system configurations are placed inside the **`backend/.env`** file.

### Backend `.env` Keys

Open your [backend/.env](file:///e:/lifed-1kiro%20-%20Copy/backend/.env) file and configure the following variables:

```env
# ─── System Variables ─────────────────────────────────────────────────────────
PORT=3001
JWT_SECRET="lifed-healthmate-super-secret-jwt-key-2026"
CLIENT_ORIGIN="http://localhost:5173"

# ─── Database & Redis ─────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5433/lifed_healthmate"
REDIS_URL="redis://localhost:6379"

# ─── R&D Webhook Security ─────────────────────────────────────────────────────
# Shared secret key used to compute and verify HMAC-SHA256 signatures
RD_WEBHOOK_SECRET="your_shared_webhook_secret_key_here"

# ─── Email Configuration (SendGrid) ──────────────────────────────────────────
# Create a SendGrid API Key at: https://sendgrid.com
SENDGRID_API_KEY="SG.your_actual_sendgrid_api_key_goes_here"
SENDGRID_FROM_EMAIL="support@lifedhealth.com"

# ─── WhatsApp Configuration (Twilio) ──────────────────────────────────────────
# Find these values on your Twilio Console: https://twilio.com/console
TWILIO_ACCOUNT_SID="AC_your_twilio_account_sid_here"
TWILIO_AUTH_TOKEN="your_twilio_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"  # Your Twilio WhatsApp Sandbox/Approved Number
```

> [!WARNING]
> Keep the `.env` file out of git source control. Ensure it is listed in your `.gitignore`. Use `.env.example` as a template for other developers.

---

## 2. Webhook Security: HMAC Signature Verification

To ensure that only webhooks initiated by the R&D team are accepted, all incoming webhook requests should be signed. 

### How it works:
1. The R&D team's server computes a cryptographic signature of the request payload using **HMAC-SHA256** and the shared `RD_WEBHOOK_SECRET`.
2. The signature is sent in the header: `X-RD-Signature`.
3. The Ops server verifies the signature before processing the request.

### Middleware Implementation Example (`verifyRdSignature.js`)
Create this file as [verifyRdSignature.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/middleware/verifyRdSignature.js):

```javascript
const crypto = require('crypto');

function verifyRdSignature(req, res, next) {
  const signature = req.headers['x-rd-signature'];
  const secret = process.env.RD_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[Webhook Security] ⚠️ RD_WEBHOOK_SECRET is not configured. Signature checks skipped.');
    return next();
  }

  if (!signature) {
    return res.status(401).json({ message: 'Unauthorized: Missing X-RD-Signature header.' });
  }

  // Compute HMAC using SHA256 on the raw request body
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  // Secure constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf-8'),
    Buffer.from(computedSignature, 'utf-8')
  );

  if (!isValid) {
    return res.status(401).json({ message: 'Unauthorized: Invalid webhook signature.' });
  }

  next();
}

module.exports = verifyRdSignature;
```

---

## 3. Webhook Integration Points

All webhook routes are mounted under `/api/webhooks/` (or directly in your routes router) and utilize the `verifyRdSignature` middleware.

```mermaid
sequenceDiagram
    participant Client/R&D
    participant Ops Server
    participant DB (Postgres)
    participant Redis Queue
    participant Worker (BullMQ)

    Client/R&D->>Ops Server: POST /api/webhooks/registration-submitted (payload)
    Note over Ops Server: verify signature with RD_WEBHOOK_SECRET
    Ops Server->>DB (Postgres): Update Phase: REGISTER
    Ops Server-->>Client/R&D: 200 OK (Transitioned)

    Client/R&D->>Ops Server: POST /api/webhooks/verification-completed (payload)
    Note over Ops Server: verify signature
    Ops Server->>DB (Postgres): Update registrationStatus: VERIFIED
    Ops Server->>Redis Queue: Enqueue Credential Job
    Ops Server-->>Client/R&D: 200 OK (Verified)
    Redis Queue->>Worker (BullMQ): Process job
    Worker (BullMQ)->>Client/R&D: Send Credentials Email / WhatsApp (SendGrid/Twilio)
```

### 3.1 Registration Form Submission Webhook
* **Endpoint:** `POST /api/webhooks/registration-submitted`
* **Purpose:** Alerts the Ops system that a partner has submitted their registration, transitioning them to the **`REGISTER`** phase.
* **Headers:**
  * `Content-Type: application/json`
  * `X-RD-Signature: <computed_signature>`
* **Request Payload:**
  ```json
  {
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
* **Database Updates:**
  - Transitions `phase` of the `Healthmate` record to `REGISTER`.
  - Resets `daysInPhase` to `0`.
* **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Healthmate successfully transitioned to REGISTER phase.",
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```

---

### 3.2 Credential Verification & Provisioning Webhook
* **Endpoint:** `POST /api/webhooks/verification-completed`  *(or update the public `/api/rnd/verify-credentials`)*
* **Purpose:** Signals that the R&D team has verified credentials. Triggers the automated generation and delivery of client dashboard credentials.
* **Headers:**
  * `Content-Type: application/json`
  * `X-RD-Signature: <computed_signature>`
* **Request Payload:**
  ```json
  {
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000",
    "remark": "Credentials meet regulatory compliance standards."
  }
  ```
* **System Operations:**
  1. Updates the `registrationStatus` of the Healthmate to `VERIFIED`.
  2. Saves the remark to `registrationRemark`.
  3. Triggers the **Credential Provisioning Service** (see Section 4) to generate a login ID & password, then dispatches them securely to the client's email and WhatsApp.
* **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Credentials verified and dashboard provisioning dispatched.",
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```

---

### 3.3 Dashboard Program Submission Webhook
* **Endpoint:** `POST /api/webhooks/program-submitted`
* **Purpose:** Fires automatically when a client submits program details via their client dashboard, moving their status from **`REGISTER`** to **`REVIEW`**.
* **Headers:**
  * `Content-Type: application/json`
  * `X-RD-Signature: <computed_signature>`
* **Request Payload:**
  ```json
  {
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000",
    "programTitle": "Holistic Healing & Mindful Living",
    "programStartDate": "2026-07-01T09:00:00.000Z",
    "programEndDate": "2026-12-31T18:00:00.000Z"
  }
  ```
* **Database Updates:**
  - Transitions `phase` of the `Healthmate` to `REVIEW`.
  - Resets `daysInPhase` to `0`.
  - Saves `programTitle`, `programStartDate`, `programEndDate`, and sets `programStatus` to `PENDING`.
* **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Program submitted. Healthmate transitioned to REVIEW phase.",
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```

---

### 3.4 Review & Approval Status/Remark API
* **Endpoint:** `POST /api/webhooks/program-status`
* **Purpose:** Enables R&D to push status updates and remarks directly to the Ops software.
* **Headers:**
  * `Content-Type: application/json`
  * `X-RD-Signature: <computed_signature>`
* **Request Payload:**
  ```json
  {
    "healthmateId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "APPROVED", // Or "CORRECTION_REQUIRED"
    "approvedMessage": "Approved. Excellent program framework layout."
  }
  ```
* **Database Updates:**
  - Saves the program status (`programStatus`) to the database model.
  - Updates the `programApprovedMsg` field.
  - If status is `"APPROVED"`, optionally seeds live calendar preparation tasks or alerts the Ops coordinator.
* **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Program status successfully updated.",
    "status": "APPROVED"
  }
  ```

---

## 4. Credential Provisioning Service Implementation

When verification is completed, credentials must be generated immediately and dispatched asynchronously to prevent network delays from stalling the webhook thread.

### 4.1 Service Definition (`credential.service.js`)
Create this service as [credential.service.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/services/credential.service.js):

```javascript
const crypto = require('crypto');
const { enqueueMessage } = require('./queue.service');

/**
 * Service to generate secure login credentials and enqueue dispatch jobs.
 */
async function provisionClientCredentials(healthmate) {
  const loginId = healthmate.contactEmail;
  if (!loginId) {
    throw new Error(`Cannot provision credentials: contact email is missing for Healthmate ${healthmate.id}.`);
  }

  // Generate a random 12-character alphanumeric password
  const tempPassword = crypto.randomBytes(6).toString('hex').toUpperCase();

  console.log(`[Credential Service] Generated credentials for ${healthmate.name}:`);
  console.log(`  Login ID: ${loginId}`);
  console.log(`  Password: ${tempPassword}`);

  // Draft delivery notifications
  const emailSubject = `Welcome to Lifed Healthmate Portal — Access Credentials`;
  const messageBody = `Hello ${healthmate.contactName || healthmate.name},
  
Your practitioner credentials have been verified! Here are your dashboard credentials to access the portal:

  Portal Link:  https://portal.lifedhealth.com
  Login ID:     ${loginId}
  Password:     ${tempPassword}

Please log in and update your password immediately.

Best regards,
Lifed Onboarding Team`;

  // Dispatch email asynchronously via BullMQ message queue
  await enqueueMessage('EMAIL', healthmate.id, {
    to: loginId,
    subject: emailSubject,
    body: messageBody
  });

  // Dispatch WhatsApp notification if phone is available
  if (healthmate.contactPhone) {
    const waBody = `Hello *${healthmate.contactName || healthmate.name}*, your credentials for the Lifed Portal are ready. User: ${loginId} / Pass: ${tempPassword}`;
    await enqueueMessage('WHATSAPP', healthmate.id, {
      phone: healthmate.contactPhone,
      body: waBody
    });
  }

  return { loginId, tempPassword };
}

module.exports = { provisionClientCredentials };
```

---

## 5. Summary Checklist for Developers

1. [ ] Configure all API keys and secrets in the `.env` file.
2. [ ] Add `verifyRdSignature.js` to the middlewares folder.
3. [ ] Register routes in `api.routes.js`.
4. [ ] Implement webhook handlers in a `webhook.controller.js`.
5. [ ] Integrate `credential.service.js` with the verification webhook/API flow.
6. [ ] Share the `RD_WEBHOOK_SECRET` securely with the R&D team portal developers.
