import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { createNetworkClient } from "@vessel/network";
import { RequestPanel, ResponsePanel, useRequestStore } from "@vessel/ui";
// Initialize default request if empty
const DEFAULT_REQUEST = {
  id: "default",
  name: "New Request",
  method: "GET",
  url: "https://jsonplaceholder.typicode.com/todos/1",
  headers: [],
  queryParams: [],
  body: { type: "none", content: "" },
  auth: { type: "none" },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
function App() {
  const [client, setClient] = useState(null);
  const { setActiveRequest, setClient: setStoreClient } = useRequestStore();
  useEffect(() => {
    async function init() {
      // Auto-detect will try Extension first, then Fetch
      const networkClient = await createNetworkClient("auto");
      setClient(networkClient);
      setStoreClient(networkClient);
      // Set a default request for demonstration
      setActiveRequest(DEFAULT_REQUEST);
    }
    init();
  }, [setActiveRequest, setStoreClient]);
  return _jsxs("div", {
    className:
      "h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden",
    children: [
      _jsx("header", {
        className:
          "h-14 border-b border-border flex items-center px-4 justify-between bg-card",
        children: _jsxs("div", {
          className: "flex items-center gap-2",
          children: [
            _jsx("div", {
              className:
                "h-6 w-6 rounded bg-primary flex items-center justify-center",
              children: _jsx("span", {
                className: "font-bold text-primary-foreground text-xs",
                children: "V",
              }),
            }),
            _jsx("span", { className: "font-bold", children: "Vessel API" }),
            client &&
              _jsxs("span", {
                className:
                  "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground",
                children: [client.name, " mode"],
              }),
          ],
        }),
      }),
      _jsxs("div", {
        className: "flex-1 flex overflow-hidden",
        children: [
          _jsx("div", {
            className: "flex-1 border-r border-border min-w-[300px]",
            children: _jsx(RequestPanel, {}),
          }),
          _jsx("div", {
            className: "flex-1 min-w-[300px]",
            children: _jsx(ResponsePanel, {}),
          }),
        ],
      }),
    ],
  });
}
export default App;
//# sourceMappingURL=App.js.map
