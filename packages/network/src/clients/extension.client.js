const MESSAGE_TIMEOUT = 60000;
/**
 * Browser Extension Network Client implementation.
 *
 * Communicates with Chrome/Firefox extension via window.postMessage.
 * The extension's content script forwards requests to the background
 * service worker, which executes them without CORS restrictions.
 */
export class ExtensionNetworkClient {
    name = 'extension';
    capabilities = {
        bypassCors: true,
        accessLocalhost: true,
        supportsStreaming: false,
    };
    pendingRequests = new Map();
    initialized = false;
    initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
        window.addEventListener('message', this.handleMessage.bind(this));
    }
    async isAvailable() {
        this.initialize();
        return new Promise((resolve) => {
            const checkId = crypto.randomUUID();
            const timeout = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(false);
            }, 1000);
            const handler = (event) => {
                if (event.source === window &&
                    event.data?.type === 'VESSEL_API_PONG' &&
                    event.data?.checkId === checkId) {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    resolve(true);
                }
            };
            window.addEventListener('message', handler);
            window.postMessage({ type: 'VESSEL_API_PING', checkId }, '*');
        });
    }
    async execute(config) {
        this.initialize();
        const requestId = crypto.randomUUID();
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                resolve({
                    ok: false,
                    error: {
                        type: 'timeout',
                        message: 'Extension request timed out',
                    },
                });
            }, config.timeout ?? MESSAGE_TIMEOUT);
            this.pendingRequests.set(requestId, { resolve, timeout });
            window.postMessage({
                type: 'VESSEL_API_REQUEST',
                payload: config,
                requestId,
            }, '*');
        });
    }
    handleMessage(event) {
        if (event.source !== window)
            return;
        const data = event.data;
        if (data?.type !== 'VESSEL_API_RESPONSE')
            return;
        const pending = this.pendingRequests.get(data.requestId);
        if (!pending)
            return;
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(data.requestId);
        if (data.success && data.response) {
            pending.resolve({ ok: true, response: data.response });
        }
        else {
            pending.resolve({
                ok: false,
                error: {
                    type: 'network',
                    message: data.error ?? 'Unknown extension error',
                },
            });
        }
    }
    abort() {
        // Extension requests cannot be aborted from the web app side
    }
}
//# sourceMappingURL=extension.client.js.map