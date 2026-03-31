interface FlashShotConfig {
    apiKey: string;
    baseUrl?: string;
    /** Maximum number of retries for 5xx errors (default: 2) */
    maxRetries?: number;
    /** Request timeout in milliseconds (default: 60000) */
    timeout?: number;
}
type ImageFormat = 'png' | 'jpeg' | 'webp';
type DevicePreset = 'desktop' | 'mobile' | 'tablet' | 'iphone-14' | 'iphone-14-pro' | 'pixel-7' | 'ipad' | 'ipad-pro';
interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    expires?: number;
}
interface BasicAuth {
    username: string;
    password: string;
}
interface ScreenshotOptions {
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
interface ScreenshotRequest {
    url: string;
    options?: ScreenshotOptions;
}
interface BatchScreenshotRequest {
    urls: string[];
    options?: ScreenshotOptions;
}
interface ScreenshotData {
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
interface ScreenshotResponse {
    success: boolean;
    data: ScreenshotData;
    usage: UsageInfo;
}
interface BatchScreenshotResponse {
    success: boolean;
    data: ScreenshotData[];
    usage: UsageInfo;
}
interface UsageInfo {
    credits_used: number;
    credits_remaining: number;
    [key: string]: unknown;
}
interface BalanceResponse {
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
interface UsageHistoryEntry {
    timestamp: string;
    endpoint: string;
    credits: number;
    url?: string;
    [key: string]: unknown;
}
interface UsageHistoryResponse {
    success: boolean;
    data: UsageHistoryEntry[];
    [key: string]: unknown;
}
interface FlashShotErrorBody {
    code: string;
    message: string;
    status: number;
}

declare class FlashShotError extends Error {
    readonly code: string;
    readonly status: number;
    constructor(message: string, code: string, status: number);
}
declare class FlashShot {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly maxRetries;
    private readonly timeout;
    constructor(config: string | FlashShotConfig);
    /**
     * Capture a screenshot of a single URL.
     */
    screenshot(url: string, options?: ScreenshotOptions): Promise<ScreenshotResponse>;
    /**
     * Capture screenshots of multiple URLs in a single request.
     */
    batch(urls: string[], options?: ScreenshotOptions): Promise<BatchScreenshotResponse>;
    /**
     * Get current account balance, plan info, and quota.
     */
    balance(): Promise<BalanceResponse>;
    /**
     * Get usage history.
     * @param limit Number of entries to return (default: 10)
     */
    usage(limit?: number): Promise<UsageHistoryResponse>;
    private request;
    private fetch;
}

export { type BalanceResponse, type BasicAuth, type BatchScreenshotRequest, type BatchScreenshotResponse, type Cookie, type DevicePreset, FlashShot, type FlashShotConfig, FlashShotError, type FlashShotErrorBody, type ImageFormat, type ScreenshotData, type ScreenshotOptions, type ScreenshotRequest, type ScreenshotResponse, type UsageHistoryEntry, type UsageHistoryResponse, type UsageInfo };
