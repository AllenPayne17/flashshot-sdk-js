"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  FlashShot: () => FlashShot,
  FlashShotError: () => FlashShotError
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var DEFAULT_BASE_URL = "https://api.flashshot.dev";
var DEFAULT_MAX_RETRIES = 2;
var DEFAULT_TIMEOUT = 6e4;
var FlashShotError = class extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "FlashShotError";
    this.code = code;
    this.status = status;
  }
};
var FlashShot = class {
  constructor(config) {
    if (typeof config === "string") {
      this.apiKey = config;
      this.baseUrl = DEFAULT_BASE_URL;
      this.maxRetries = DEFAULT_MAX_RETRIES;
      this.timeout = DEFAULT_TIMEOUT;
    } else {
      if (!config.apiKey) {
        throw new FlashShotError("API key is required", "missing_api_key", 400);
      }
      this.apiKey = config.apiKey;
      this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
      this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
      this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    }
  }
  /**
   * Capture a screenshot of a single URL.
   */
  async screenshot(url, options) {
    return this.request("POST", "/api/v1/screenshot", {
      url,
      options
    });
  }
  /**
   * Capture screenshots of multiple URLs in a single request.
   */
  async batch(urls, options) {
    return this.request(
      "POST",
      "/api/v1/screenshots/batch",
      { urls, options }
    );
  }
  /**
   * Get current account balance, plan info, and quota.
   */
  async balance() {
    return this.request("GET", "/api/v1/balance");
  }
  /**
   * Get usage history.
   * @param limit Number of entries to return (default: 10)
   */
  async usage(limit) {
    const query = limit != null ? `?limit=${limit}` : "";
    return this.request("GET", `/api/v1/usage${query}`);
  }
  // ---- Internal ----
  async request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetch(method, url, body);
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
          await sleep(retryAfter);
          continue;
        }
        const json = await response.json();
        if (!response.ok) {
          const err = new FlashShotError(
            json.message ?? response.statusText,
            json.code ?? `http_${response.status}`,
            response.status
          );
          if (response.status >= 500 && attempt < this.maxRetries) {
            lastError = err;
            await sleep(getBackoff(attempt));
            continue;
          }
          throw err;
        }
        return json;
      } catch (error) {
        if (error instanceof FlashShotError) {
          throw error;
        }
        const msg = error instanceof Error ? error.message : "Unknown error";
        lastError = new FlashShotError(msg, "network_error", 0);
        if (attempt < this.maxRetries) {
          await sleep(getBackoff(attempt));
          continue;
        }
      }
    }
    throw lastError ?? new FlashShotError("Request failed", "unknown", 0);
  }
  async fetch(method, url, body) {
    const headers = {
      "x-api-key": this.apiKey,
      "Accept": "application/json",
      "User-Agent": "@flashshot/sdk/1.0.0"
    };
    const init = { method, headers };
    if (body !== void 0) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    if (this.timeout > 0) {
      init.signal = AbortSignal.timeout(this.timeout);
    }
    return fetch(url, init);
  }
};
function parseRetryAfter(header) {
  if (!header) return 1e3;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return seconds * 1e3;
  }
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(date - Date.now(), 0);
  }
  return 1e3;
}
function getBackoff(attempt) {
  const base = 500 * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return base + jitter;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FlashShot,
  FlashShotError
});
