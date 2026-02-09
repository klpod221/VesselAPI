export interface AppProps {
    /** Platform determines which network client to use */
    readonly platform: 'web' | 'tauri';
    /** Optional app title override */
    readonly title?: string;
}
/**
 * Shared App component for Vessel API.
 * Used by both web and desktop (Tauri) applications.
 */
export declare function App({ platform, title }: AppProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=App.d.ts.map