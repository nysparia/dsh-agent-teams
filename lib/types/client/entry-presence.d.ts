/**
 * Which sessions currently have the conversation-header entry mounted.
 *
 * The header action is the primary way into a team, but the host drops the
 * whole `conversation.session.header.actions` seat while a session is blank
 * (`hideChrome`), so the entry never mounts there and the team becomes
 * unreachable. Recording the seat's own mount state lets the composer entry
 * stand in exactly when the header one is absent, instead of guessing from
 * session flags the plugin cannot see (the host's blank-chrome rule also
 * depends on the conversation phase).
 *
 * The set is keyed by session id: the shell overlay outlives conversation
 * route changes, so a global boolean would leak one session's seat into
 * another's.
 */
/** Subscribe to header-entry mount changes (React external-store shape). */
export declare function subscribeHeaderEntryPresence(listener: () => void): () => void;
/** Read the stable set of sessions whose header entry is mounted. */
export declare function getHeaderEntryPresenceSnapshot(): ReadonlySet<string>;
/** Record whether one session's header entry is mounted; idempotent. */
export declare function setHeaderEntryMounted(sessionId: string, present: boolean): void;
/**
 * Whether the header seat already owns this session's entry.
 *
 * The composer fallback renders only when it does not, so a host that keeps
 * the header chrome never shows two entries for one team.
 * @param mountedSessions - sessions whose header entry is mounted.
 * @param sessionId - the session the composer entry is rendering for.
 * @returns `true` when the header entry is the one to show.
 */
export declare function headerEntryOwnsSession(mountedSessions: ReadonlySet<string>, sessionId: string): boolean;
