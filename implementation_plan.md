# R&D Integration & Automation

This implementation plan outlines the steps and architecture required to integrate the R&D team's processes with the Ops team's onboarding manager. We will add secure webhook endpoints, an automated credential provisioning service, R&D status update APIs, and a clear guide outlining where API keys and credentials should reside.

## User Review Required

> [!IMPORTANT]
> **Webhook Security & HMAC verification:** We propose implementing signature verification using HMAC-SHA256. R&D webhooks must send a signature in the `X-RD-Signature` header calculated using a shared secret key (`RD_WEBHOOK_SECRET`). Please confirm if R&D uses a different signature scheme.
>
> **Credential Delivery Channels:** When a Healthmate is verified by R&D, credentials will be automatically generated and dispatched via **email** and **WhatsApp** (simulated or real depending on SendGrid/Twilio API keys). Please review the message templates in the guide to see if they fit your brand guidelines.
>
> **Database Schema & Login Storage:** The current `Healthmate` model does not store the generated client credentials (username/password). If clients will log directly into this system, a new model or schema update is required. Currently, the plan assumes these credentials are sent to the client and R&D systems, and simulated locally. Let us know if you want us to update the database schema to store client login credentials.

## Open Questions

- None at the moment. We will proceed with the proposed webhook design and guides.

## Proposed Changes

We will introduce a set of webhook routes, signature verification middleware, and a credential provisioning service.

---

### [Component] Backend Webhooks & APIs

#### [NEW] [verifyRdSignature.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/middleware/verifyRdSignature.js)
- Middleware to verify HMAC signatures for incoming R&D webhooks.
- Uses `crypto` module to compare the computed HMAC against the `X-RD-Signature` header using the `RD_WEBHOOK_SECRET` env variable.

#### [NEW] [webhook.controller.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/controllers/webhook.controller.js)
- Implements controller logic for incoming webhook endpoints:
  - `handleRegistrationSubmission`: Transition Healthmate to `REGISTER` phase.
  - `handleVerificationCompletion` (maps to credential generation & phase logic).
  - `handleProgramSubmission`: Transition Healthmate from `REGISTER` to `REVIEW` phase.
  - `handleProgramStatus`: Push status updates (`Approved` or `Correction Required`) and remarks to database.

#### [NEW] [credential.service.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/services/credential.service.js)
- Automated credential provisioning service.
- Generates a secure random password and username (default: contactEmail).
- Sends email/SMS containing login credentials.

#### [MODIFY] [api.routes.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/routes/api.routes.js)
- Expose the public webhook routes under `/api/webhooks/`:
  - `POST /api/webhooks/registration-submitted`
  - `POST /api/webhooks/verification-completed`
  - `POST /api/webhooks/program-submitted`
  - `POST /api/webhooks/program-status`
- Apply `verifyRdSignature` middleware to secure these endpoints.

#### [MODIFY] [healthmate.controller.js](file:///e:/lifed-1kiro%20-%20Copy/backend/src/controllers/healthmate.controller.js)
- Update `rndVerifyCredentials` logic to trigger the `credential.service.js` provisioning process upon successful verification.

---

### [Component] Documentation & Configuration

#### [NEW] [RD_INTEGRATION_GUIDE.md](file:///e:/lifed-1kiro%20-%20Copy/RD_INTEGRATION_GUIDE.md)
- Markdown file guiding the developer/R&D team on how to set up webhooks, request payloads, response codes, signature headers, and exactly where API keys should be placed.

#### [MODIFY] [.env.example](file:///e:/lifed-1kiro%20-%20Copy/backend/.env.example)
- Document the new environment variables (`RD_WEBHOOK_SECRET`, credential templates, etc.).

## Verification Plan

### Automated Tests
- Postman or Curl tests to trigger each webhook endpoint with:
  1. Valid signature -> Should succeed and update database phase/status.
  2. Invalid signature -> Should return `401 Unauthorized`.
  3. Missing fields -> Should return `400 Bad Request`.

### Manual Verification
1. Call `/api/webhooks/registration-submitted` for a Healthmate in `PREPARE` stage, verify phase changes to `REGISTER`.
2. Call `/api/webhooks/verification-completed` (or `/api/rnd/verify-credentials`) for a Healthmate, verify registration status is updated to `VERIFIED`, and see credential delivery logs in worker/console.
3. Call `/api/webhooks/program-submitted`, verify phase changes to `REVIEW`.
4. Call `/api/webhooks/program-status` with `Approved` or `Correction Required`, verify database update.
