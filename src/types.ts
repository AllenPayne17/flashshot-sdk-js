// ---- Configuration ----

export interface FlashShotConfig {
  apiKey: string;
  baseUrl?: string;
  /** Maximum number of retries for 5xx errors (default: 2) */
  maxRetries?: number;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
}

// ---- Screenshot Options ----

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export type DevicePreset =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'iphone-14'
  | 'iphone-14-pro'
  | 'pixel-7'
  | 'ipad'
  | 'ipad-pro';

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  expires?: number;
}

export interface BasicAuth {
  username: string;
  password: string;
}

export interface ScreenshotOptions {
  /** Image format (default: 'png') */
  format?: ImageFormat;
  /** Capture the full scrollable page */
  full_page?: boolean;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** Device scale factor (1-3) */
  device_scale_factor?: number;
  /** Device preset to emulate */
  device?: DevicePreset;
  /** Image quality for jpeg/webp (1-100) */
  quality?: number;
  /** CSS selector or time in ms to wait before capture */
  wait_for?: string | number;
  /** Include AI analysis of the screenshot */
  include_analysis?: boolean;
  /** Cookies to set before navigation */
  cookies?: Cookie[];
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  /** Basic authentication credentials */
  basic_auth?: BasicAuth;
  /** CSS to inject into the page */
  custom_css?: string;
  /** JavaScript to execute before capture */
  custom_js?: string;
  /** Block all cookies */
  block_cookies?: boolean;
  /** Block ads and trackers */
  block_ads?: boolean;
  /** Cache TTL in seconds */
  cache_ttl?: number;
  /** Use stealth mode to avoid bot detection */
  stealth?: boolean;
  /** Webhook URL to receive results */
  webhook_url?: string;
}

// ---- API Requests ----

export interface ScreenshotRequest {
  url: string;
  options?: ScreenshotOptions;
}

export interface BatchScreenshotRequest {
  urls: string[];
  options?: ScreenshotOptions;
}

// ---- API Responses ----

export interface ScreenshotData {
  image_url: string;
  overview: string;
  description: string;
  render_time_ms: number;
  format: ImageFormat;
  width: number;
  height: number;
  file_size: number;
  [key: string]: unknown;
}

export interface ScreenshotResponse {
  success: boolean;
  data: ScreenshotData;
  usage: UsageInfo;
}

export interface BatchScreenshotResponse {
  success: boolean;
  data: ScreenshotData[];
  usage: UsageInfo;
}

export interface UsageInfo {
  credits_used: number;
  credits_remaining: number;
  [key: string]: unknown;
}

export interface BalanceResponse {
  success: boolean;
  plan: string;
  usage: {
    used: number;
    quota: number;
    period: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UsageHistoryEntry {
  timestamp: string;
  endpoint: string;
  credits: number;
  url?: string;
  [key: string]: unknown;
}

export interface UsageHistoryResponse {
  success: boolean;
  data: UsageHistoryEntry[];
  [key: string]: unknown;
}

// ---- Errors ----

export interface FlashShotErrorBody {
  code: string;
  message: string;
  status: number;
}
