import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HostConnectionService } from '@deepseek-ai/dsh-client-connection';
/** Public WebServer route surface used by the plugin. */
export interface WebRouteHost {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    }): () => void;
}
/**
 * The browser-request fence this plugin applies to its own raw WebServer routes.
 *
 * Hosts up to 0.2.2 expose `requestRejection` on the Connection service and
 * leave raw routes unfenced, so the plugin applies that fence itself. From
 * 0.2.3 the WebServer admits every route through `webserver/authorize` with a
 * default `required` policy, and Connection no longer exports
 * `requestRejection`; the host fence is then already in force, so the plugin
 * must not re-apply a fence it cannot reach. The method stays optional so one
 * build serves both host generations.
 */
export type BrowserRequestGate = Partial<Pick<HostConnectionService, 'requestRejection'>>;
export declare class RequestBodyError extends Error {
    readonly status: 400 | 413;
    constructor(message: string, status: 400 | 413);
}
/** Bound memory while draining oversized requests so the route can return 413. */
export declare function readJsonRequest(req: IncomingMessage, maxBytes?: number): Promise<Record<string, unknown>>;
/** Revalidate a current JSON representation across both identity and gzip delivery. */
export declare function writeJsonWithEtag(req: IncomingMessage, res: ServerResponse, body: string): void;
/** Raw WebServer routes do not inherit Connection's authentication fence. */
export declare function authenticatedWebRoutes(server: WebRouteHost, connection: () => BrowserRequestGate | undefined): WebRouteHost;
