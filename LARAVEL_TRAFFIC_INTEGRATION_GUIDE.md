# Lifed Operations — Laravel Website Live Traffic Integration Guide

This guide explains how to connect your main website (**lifedhealth.com**, built on Laravel) to the **Lifed Operations God View Analytics** to report live website traffic, active visitors, page view counts, and acquisition channels in real time.

---

## 🛰️ Ingestion Webhook Specification

- **Endpoint:** `POST https://your-ops-domain.com/api/webhooks/traffic/ping`
- **Content-Type:** `application/json`
- **Payload Schema:**
```json
{
  "path": "/programs/holistic-wellness",
  "sessionId": "sess_894372849",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0 ...",
  "ip": "203.0.113.195",
  "device": "mobile"
}
```

---

## ⚡ Integration Method 1: JavaScript Client Tracker (Recommended)

Add this lightweight script into your master Laravel Blade layout (`resources/views/layouts/app.blade.php`) right before `</head>`:

```html
<!-- Lifed Operations Traffic Telemetry -->
<script>
  (function() {
    const OPS_WEBHOOK_URL = 'http://localhost:3001/api/webhooks/traffic/ping'; // Replace with your live Ops backend domain

    let sessionId = localStorage.getItem('lifed_sess_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('lifed_sess_id', sessionId);
    }

    const payload = {
      path: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer || 'direct',
      sessionId: sessionId,
      userAgent: navigator.userAgent,
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      timestamp: new Date().toISOString()
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(OPS_WEBHOOK_URL, JSON.stringify(payload));
    } else {
      fetch(OPS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(e) { console.warn('Traffic ping failed', e); });
    }
  })();
</script>
```

---

## 🐘 Integration Method 2: Laravel Middleware (Server-Side Ingestion)

If you prefer server-side logging without front-end dependency, create a middleware in your Laravel project:

### 1. Create Middleware in Laravel:
```bash
php artisan make:middleware SendTrafficPingToOps
```

### 2. Implementation (`app/Http/Middleware/SendTrafficPingToOps.php`):
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SendTrafficPingToOps
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only track HTML page requests
        if ($request->isMethod('GET') && !$request->expectsJson() && $response->getStatusCode() === 200) {
            try {
                Http::timeout(1)->async()->post('http://localhost:3001/api/webhooks/traffic/ping', [
                    'path'      => $request->getPathInfo(),
                    'sessionId' => session()->getId(),
                    'referrer'  => $request->header('referer', 'direct'),
                    'userAgent' => $request->header('User-Agent'),
                    'ip'        => $request->ip(),
                    'device'    => $request->header('User-Agent') && preg_match('/mobile/i', $request->header('User-Agent')) ? 'mobile' : 'desktop',
                    'timestamp' => now()->toIso8601String(),
                ]);
            } catch (\Throwable $e) {
                // Silently ignore ping network errors to avoid affecting user experience
            }
        }

        return $response;
    }
}
```

### 3. Register Middleware in `app/Http/Kernel.php`:
```php
protected $middlewareGroups = [
    'web' => [
        // ...
        \App\Http\Middleware\SendTrafficPingToOps::class,
    ],
];
```

---

## 🔍 Verification

1. Trigger a ping using curl:
```bash
curl -X POST http://localhost:3001/api/webhooks/traffic/ping \
  -H "Content-Type: application/json" \
  -d '{"path": "/home", "referrer": "https://facebook.com"}'
```

2. Open **God View Analytics** in the Ops space (`/admin_dashboard`). The **Website Traffic** count and **Top Channels** breakdown will immediately update with live metrics!
