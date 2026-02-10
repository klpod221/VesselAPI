/// <reference types="chrome" />

// This content script acts as a bridge between the Web App (page context)
// and the Extension Background Script (extension context).
// It relays messages because normal web pages cannot directly talk to 
// background scripts unless declared in "externally_connectable".

const allowedOrigins = new Set([
  'http://localhost:5173', // Default Vite dev port
  'http://127.0.0.1:5173',
  'https://vessel.api'     // Production definition
]);

globalThis.addEventListener('message', async (event) => {
  // Security check: only allow messages from trusted origins
  // For loopback/dev, we allow basic origin checks
  if (event.source !== globalThis.window) return;
  
  // Strict origin check for production-like behavior
  if (!allowedOrigins.has(event.origin) && event.origin !== 'null') {
    // Note: 'null' origin might happen on local files, be careful in prod
    return;
  }

  const { data } = event;

  // Handle PING (Availability Check)
  if (data?.type === 'VESSEL_API_PING') {
    // Respond immediately to say "I'm here"
    globalThis.window.postMessage({
      type: 'VESSEL_API_PONG',
      checkId: data.checkId,
    }, event.origin);
    return;
  }

  // Handle REQUEST
  if (data?.type === 'VESSEL_API_REQUEST') {
    try {
      // Forward to background script
      const response = await chrome.runtime.sendMessage(data);
      
      // Send response back to page
      globalThis.window.postMessage({
        type: 'VESSEL_API_RESPONSE',
        requestId: data.requestId,
        ...response
      }, event.origin);
    } catch (err) {
      globalThis.window.postMessage({
        type: 'VESSEL_API_RESPONSE',
        requestId: data.requestId,
        success: false,
        error: String(err)
      }, event.origin);
    }
  }
});
