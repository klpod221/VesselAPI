"use strict";
(() => {
  // src/content/bridge.ts
  var allowedOrigins = /* @__PURE__ */ new Set([
    "http://localhost:5173",
    // Default Vite dev port
    "http://127.0.0.1:5173",
    "https://vessel.api"
    // Production definition
  ]);
  globalThis.addEventListener("message", async (event) => {
    if (event.source !== globalThis.window) return;
    if (!allowedOrigins.has(event.origin) && event.origin !== "null") {
      return;
    }
    const { data } = event;
    if (data?.type === "VESSEL_API_PING") {
      globalThis.window.postMessage({
        type: "VESSEL_API_PONG",
        checkId: data.checkId
      }, event.origin);
      return;
    }
    if (data?.type === "VESSEL_API_REQUEST") {
      try {
        const response = await chrome.runtime.sendMessage(data);
        globalThis.window.postMessage({
          type: "VESSEL_API_RESPONSE",
          requestId: data.requestId,
          ...response
        }, event.origin);
      } catch (err) {
        globalThis.window.postMessage({
          type: "VESSEL_API_RESPONSE",
          requestId: data.requestId,
          success: false,
          error: String(err)
        }, event.origin);
      }
    }
  });
})();
//# sourceMappingURL=content.js.map
