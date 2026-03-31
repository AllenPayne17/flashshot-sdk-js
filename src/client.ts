import type {
  FlashShotConfig,
  ScreenshotOptions,
  ScreenshotResponse,
  BatchScreenshotResponse,
  BalanceResponse,
  UsageHistoryResponse,
} from './types.js';

const DEFAULT_BASE_URL = 'https://api.flashshot.dev';
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT = 60_000;

export class FlashShotError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'FlashShotError';
    this.code = code;
    this.status = status;
  }
}

export class FlashShot {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;

  constructor(config: string | FlashShotConfig) {
    if (typeof config === 'string') {
      this.apiKey = config;
      this.baseUrl = DEFAULT_BASE_URL;
      this.maxRetries = DEFAULT_MAX_RETRIES;
      this.timeout = DEFAULT_TIMEOUT;
    } else {
      if (!config.apiKey) {
        throw new FlashShotError('API key is required', 'missing_api_key', 400);
      }
      this.apiKey = config.apiKey;
      this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
      this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
      this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    }
  }

  /**
   * Capture a screenshot of a single URL.
   */
  async screenshot(
    url: string,
    options?: ScreenshotOptions,
  ): Promise<ScreenshotResponse> {
    return this.request<ScreenshotResponse>('POST', '/api/v1/screenshot', {
      url,
      options,
    });
  }

  /**
   * Capture screenshots of multiple URLs in a single request.
   */
  async batch(
    urls: string[],
    options?: ScreenshotOptions,
  ): Promise<BatchScreenshotResponse> {
    return this.request<BatchScreenshotResponse>(
      'POST',
      '/api/v1/screenshots/batch',
      { urls, options },
    );
  }

  /**
   * Get current account balance, plan info, and quota.
   */
  async balance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('GET', '/api/v1/balance');
  }

  /**
   * Get usage history.
   * @param limit Number of entries to return (default: 10)
   */
  async usage(limit?: number): Promise<UsageHistoryResponse> {
    const query = limit != null ? `?limit=${limit}` : '';
    return this.request<UsageHistoryResponse>('GET', `/api/v1/usage${query}`);
  }

  // ---- Internal ----

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: FlashShotError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetch(method, url, body);

        // Rate limited — honour Retry-After then retry
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
          await sleep(retryAfter);
          continue;
        }

        const json = (await response.json()) as Record<string, unknown>;

        if (!response.ok) {
          const err = new FlashShotError(
            (json.message as string) ?? response.statusText,
            (json.code as string) ?? `http_${response.status}`,
            response.status,
          );

          // Retry on 5xx
          if (response.status >= 500 && attempt < this.maxRetries) {
            lastError = err;
            await sleep(getBackoff(attempt));
            continue;
          }

          throw err;
        }

        return json as T;
      } catch (error) {
        if (error instanceof FlashShotError) {
          throw error;
        }

        // Network / timeout errors — retry if attempts remain
        const msg =
          error instanceof Error ? error.message : 'Unknown error';
        lastError = new FlashShotError(msg, 'network_error', 0);

        if (attempt < this.maxRetries) {
          await sleep(getBackoff(attempt));
          continue;
        }
      }
    }

    throw lastError ?? new FlashShotError('Request failed', 'unknown', 0);
  }

  private async fetch(
    method: 'GET' | 'POST',
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'Accept': 'application/json',
      'User-Agent': '@flashshot/sdk/1.0.0',
    };

    const init: RequestInit = { method, headers };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    if (this.timeout > 0) {
      init.signal = AbortSignal.timeout(this.timeout);
    }

    return fetch(url, init);
  }
}

// ---- Helpers ----

function parseRetryAfter(header: string | null): number {
  if (!header) return 1000;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  // Header might be an HTTP-date
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(date - Date.now(), 0);
  }
  return 1000;
}

function getBackoff(attempt: number): number {
  // Exponential backoff: 500ms, 1500ms, ...
  const base = 500 * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
