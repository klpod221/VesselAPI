/// <reference types="chrome" />

interface RequestPayload {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
}

// Listen for messages from content script or external web pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VESSEL_API_REQUEST') {
    handleRequest(message.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({
        success: false,
        error: String(err),
      }));
    return true; // Keep channel open for async response
  }
});

// Also listen for external messages (from the web app directly if configured)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'VESSEL_API_PING') {
    sendResponse({ type: 'VESSEL_API_PONG', checkId: message.checkId });
    return false;
  }
  
  if (message.type === 'VESSEL_API_REQUEST') {
    handleRequest(message.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({
        success: false,
        error: String(err),
      }));
    return true;
  }
});

async function handleRequest(
  config: RequestPayload
): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? 30000
    );

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const firstByteTime = performance.now() - startTime;
    const body = await response.text();
    const totalTime = performance.now() - startTime;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      success: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
        timing: {
          firstByte: Math.round(firstByteTime),
          total: Math.round(totalTime),
        },
        size: {
          headers: JSON.stringify(headers).length,
          body: body.length,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
