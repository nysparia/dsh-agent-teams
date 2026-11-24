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

let mounted: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()

/** Subscribe to header-entry mount changes (React external-store shape). */
export function subscribeHeaderEntryPresence(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Read the stable set of sessions whose header entry is mounted. */
export function getHeaderEntryPresenceSnapshot(): ReadonlySet<string> {
  return mounted
}

/** Record whether one session's header entry is mounted; idempotent. */
export function setHeaderEntryMounted(sessionId: string, present: boolean): void {
  if (mounted.has(sessionId) === present) return
  const next = new Set(mounted)
  if (present) next.add(sessionId)
  else next.delete(sessionId)
  mounted = next
  for (const listener of listeners) listener()
}

/**
 * Whether the header seat already owns this session's entry.
 *
 * The composer fallback renders only when it does not, so a host that keeps
 * the header chrome never shows two entries for one team.
 * @param mountedSessions - sessions whose header entry is mounted.
 * @param sessionId - the session the composer entry is rendering for.
 * @returns `true` when the header entry is the one to show.
 */
export function headerEntryOwnsSession(
  mountedSessions: ReadonlySet<string>,
  sessionId: string,
): boolean {
  return mountedSessions.has(sessionId)
}
