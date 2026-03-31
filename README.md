<div align="center">

# flashshot-sdk

The official JavaScript & TypeScript SDK for the FlashShot Screenshot API.

[![npm version](https://img.shields.io/npm/v/flashshot-sdk.svg)](https://www.npmjs.com/package/flashshot-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Website](https://www.flashshot.dev) &middot; [Documentation](https://www.flashshot.dev/docs) &middot; [Dashboard](https://www.flashshot.dev/dashboard) &middot; [npm](https://www.npmjs.com/package/flashshot-sdk)

</div>

---

## What is FlashShot?

FlashShot is a high-performance screenshot API that captures pixel-perfect images of any web page. It supports full-page captures, device emulation, custom viewports, ad blocking, stealth mode, AI-powered image analysis, and more. This SDK provides a simple, fully-typed client for Node.js and edge runtimes.

## Installation

```bash
# npm
npm install flashshot-sdk

# yarn
yarn add flashshot-sdk

# pnpm
pnpm add flashshot-sdk
```

> **Requires Node.js 20 or later.**

## Quick Start

```typescript
import { FlashShot } from 'flashshot-sdk';

const flashshot = new FlashShot('fs_your_api_key');

const result = await flashshot.screenshot('https://example.com');
console.log(result.data.image_url);
```

## Configuration

Pass a string to use just an API key with defaults, or pass a config object for full control.

```typescript
const flashshot = new FlashShot({
  apiKey: 'fs_your_api_key',
  baseUrl: 'https://api.flashshot.dev', // default
  maxRetries: 2,                        // default, retries on 5xx / network errors
  timeout: 60_000,                      // default, request timeout in ms
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | `string` | **required** | Your FlashShot API key |
| `baseUrl` | `string` | `https://api.flashshot.dev` | API base URL |
| `maxRetries` | `number` | `2` | Maximum retry attempts for 5xx and network errors |
| `timeout` | `number` | `60000` | Request timeout in milliseconds |

## Methods

### `screenshot(url, options?)`

Capture a screenshot of a single URL.

```typescript
const result = await flashshot.screenshot('https://example.com', {
  format: 'webp',
  full_page: true,
  width: 1440,
  quality: 90,
});

console.log(result.data.image_url);      // hosted image URL
console.log(result.data.render_time_ms); // time to capture
console.log(result.usage.credits_used);  // credits consumed
```

**Response shape:**

```typescript
{
  success: boolean;
  data: {
    image_url: string;
    overview: string;
    description: string;
    render_time_ms: number;
    format: 'png' | 'jpeg' | 'webp';
    width: number;
    height: number;
    file_size: number;
  };
  usage: {
    credits_used: number;
    credits_remaining: number;
  };
}
```

### `batch(urls, options?)`

Capture screenshots of multiple URLs in a single request. All URLs share the same options.

```typescript
const result = await flashshot.batch(
  [
    'https://example.com',
    'https://example.com/pricing',
    'https://example.com/about',
  ],
  { format: 'png', width: 1280 },
);

for (const screenshot of result.data) {
  console.log(screenshot.image_url);
}
```

### `balance()`

Check your current plan, quota, and remaining credits.

```typescript
const balance = await flashshot.balance();

console.log(balance.plan);          // e.g. "pro"
console.log(balance.usage.used);    // credits used this period
console.log(balance.usage.quota);   // total credits available
console.log(balance.usage.period);  // billing period
```

### `usage(limit?)`

Retrieve recent usage history. Defaults to 10 entries.

```typescript
const history = await flashshot.usage(25);

for (const entry of history.data) {
  console.log(entry.timestamp, entry.endpoint, entry.credits, entry.url);
}
```

## Screenshot Options

Every option below can be passed to `screenshot()` or `batch()`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `format` | `'png' \| 'jpeg' \| 'webp'` | `'png'` | Output image format |
| `full_page` | `boolean` | `false` | Capture the full scrollable page |
| `width` | `number` | &mdash; | Viewport width in pixels |
| `height` | `number` | &mdash; | Viewport height in pixels |
| `device_scale_factor` | `number` | &mdash; | Device pixel ratio (1&ndash;3) |
| `device` | `DevicePreset` | &mdash; | Emulate a device preset (see below) |
| `quality` | `number` | &mdash; | Image quality for jpeg/webp (1&ndash;100) |
| `wait_for` | `string \| number` | &mdash; | CSS selector or time in ms to wait before capture |
| `include_analysis` | `boolean` | `false` | Include AI-powered analysis of the screenshot |
| `cookies` | `Cookie[]` | &mdash; | Cookies to set before navigation |
| `headers` | `Record<string, string>` | &mdash; | Custom HTTP headers sent with the request |
| `basic_auth` | `{ username, password }` | &mdash; | HTTP Basic Authentication credentials |
| `custom_css` | `string` | &mdash; | CSS to inject into the page |
| `custom_js` | `string` | &mdash; | JavaScript to execute before capture |
| `block_cookies` | `boolean` | `false` | Block all cookies on the page |
| `block_ads` | `boolean` | `false` | Block ads and trackers |
| `cache_ttl` | `number` | &mdash; | Cache time-to-live in seconds |
| `stealth` | `boolean` | `false` | Use stealth mode to avoid bot detection |
| `webhook_url` | `string` | &mdash; | URL to receive results via webhook callback |

### Cookie Object

```typescript
{
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  expires?: number;
}
```

## Error Handling

All API errors throw a `FlashShotError` with structured fields for easy programmatic handling.

```typescript
import { FlashShot, FlashShotError } from 'flashshot-sdk';

const flashshot = new FlashShot('fs_your_api_key');

try {
  const result = await flashshot.screenshot('https://example.com');
} catch (error) {
  if (error instanceof FlashShotError) {
    console.error(error.message); // human-readable message
    console.error(error.code);    // e.g. "rate_limit_exceeded", "missing_api_key"
    console.error(error.status);  // HTTP status code (0 for network errors)
  }
}
```

| Property | Type | Description |
| --- | --- | --- |
| `message` | `string` | Human-readable error description |
| `code` | `string` | Machine-readable error code |
| `status` | `number` | HTTP status code, or `0` for network/timeout errors |

## Auto-Retry

The SDK automatically retries failed requests with exponential backoff and jitter:

- **429 Too Many Requests** &mdash; Waits for the duration specified by the `Retry-After` header, then retries.
- **5xx Server Errors** &mdash; Retries up to `maxRetries` times (default: 2) with exponential backoff.
- **Network / Timeout Errors** &mdash; Retries up to `maxRetries` times with the same backoff strategy.

Client errors (4xx other than 429) are thrown immediately and are never retried. Set `maxRetries: 0` to disable retries entirely.

## TypeScript

The SDK is written in TypeScript and ships with complete type definitions. All responses are fully typed out of the box.

```typescript
import { FlashShot } from 'flashshot-sdk';
import type {
  ScreenshotOptions,
  ScreenshotResponse,
  ScreenshotData,
  BatchScreenshotResponse,
  BalanceResponse,
  UsageHistoryResponse,
  Cookie,
  BasicAuth,
  ImageFormat,
  DevicePreset,
} from 'flashshot-sdk';

const flashshot = new FlashShot('fs_your_api_key');

const options: ScreenshotOptions = {
  format: 'webp',
  full_page: true,
  width: 1440,
};

const result: ScreenshotResponse = await flashshot.screenshot(
  'https://example.com',
  options,
);

const data: ScreenshotData = result.data;
console.log(data.image_url, data.width, data.height, data.file_size);
```

## Device Presets

Use the `device` option to emulate a specific device viewport and user agent.

| Preset | Description |
| --- | --- |
| `desktop` | Standard desktop viewport |
| `mobile` | Generic mobile viewport |
| `tablet` | Generic tablet viewport |
| `iphone-14` | iPhone 14 |
| `iphone-14-pro` | iPhone 14 Pro |
| `pixel-7` | Google Pixel 7 |
| `ipad` | iPad |
| `ipad-pro` | iPad Pro |

```typescript
const result = await flashshot.screenshot('https://example.com', {
  device: 'iphone-14-pro',
});
```

## Examples

### Screenshot with AI Analysis

Receive an AI-generated overview and description alongside the captured image.

```typescript
const result = await flashshot.screenshot('https://example.com', {
  include_analysis: true,
});

console.log(result.data.image_url);
console.log(result.data.overview);     // short AI-generated summary
console.log(result.data.description);  // detailed AI description
```

### Mobile Device Screenshot

```typescript
const result = await flashshot.screenshot('https://example.com', {
  device: 'iphone-14',
  format: 'webp',
  quality: 85,
});
```

### Screenshot with Stealth Mode

Bypass bot detection for pages that block headless browsers.

```typescript
const result = await flashshot.screenshot('https://protected-site.com', {
  stealth: true,
  wait_for: 3000,
});
```

### HTML to Image

Render raw HTML by passing a data URL.

```typescript
const html = `
  <div style="padding: 40px; font-family: sans-serif;">
    <h1>Hello, FlashShot!</h1>
    <p>Rendered from raw HTML.</p>
  </div>
`;

const result = await flashshot.screenshot(
  `data:text/html,${encodeURIComponent(html)}`,
  { width: 800, height: 600 },
);
```

### Webhook Callback

Receive results asynchronously via a webhook instead of waiting for the response.

```typescript
await flashshot.screenshot('https://example.com', {
  webhook_url: 'https://your-server.com/api/webhook/screenshot',
  full_page: true,
});
```

### Disable Ads and Cookie Blocking

Block ads, trackers, and cookies for a clean capture.

```typescript
const result = await flashshot.screenshot('https://news-site.com', {
  block_ads: true,
  block_cookies: true,
  full_page: true,
});
```

### Authenticated Page with Custom Headers

```typescript
const result = await flashshot.screenshot('https://internal-app.com/dashboard', {
  basic_auth: { username: 'admin', password: 'secret' },
  headers: { 'X-Custom-Header': 'value' },
  cookies: [
    { name: 'session', value: 'abc123', domain: 'internal-app.com' },
  ],
});
```

### Custom CSS and JavaScript Injection

```typescript
const result = await flashshot.screenshot('https://example.com', {
  custom_css: 'body { background: #1a1a2e; color: #eee; }',
  custom_js: 'document.querySelector(".banner")?.remove();',
  wait_for: '.main-content',
});
```

## License

MIT

---

<div align="center">

[Website](https://www.flashshot.dev) &middot; [Documentation](https://www.flashshot.dev/docs) &middot; [Dashboard](https://www.flashshot.dev/dashboard) &middot; [npm](https://www.npmjs.com/package/flashshot-sdk)

</div>
