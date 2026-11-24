/** Session-owned entry points: a persistent title action and a durable turn card. */
import { useLayoutEffect, useSyncExternalStore } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { AgentTeamsSummary, openActivityPanel, type AgentTeamsCardInjected } from './AgentTeamsCard.tsx'
import { getActivitySnapshotsSnapshot, subscribeActivitySnapshots } from './activity-monitor.ts'
import { teamCardsForTurn } from './agent-teams-card-definition.ts'
import {
  getHeaderEntryPresenceSnapshot, headerEntryOwnsSession, setHeaderEntryMounted, subscribeHeaderEntryPresence,
} from './entry-presence.ts'
import { LEAD_ART } from './artwork.ts'
import css from './AgentTeamsCard.module.css'

/** The team this session captains, live or archived. */
function useCaptainTeam(sessionId: string) {
  const { teams, archivedTeams } = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot)
  return [...teams, ...archivedTeams].find(team => team.captainSessionId === sessionId)
}

function TeamEntryButton({ team, sessionId, t }: {
  readonly team: NonNullable<ReturnType<typeof useCaptainTeam>>
  readonly sessionId: string
  readonly t: PropsLocale<'agentTeams'>['t']
}) {
  return <button className={css.chatEntry} data-team-chat-entry type="button" title={t('workspace.focus')}
    onClick={() => openActivityPanel({ teamId: team.teamId, captainSessionId: sessionId, teamName: team.name, members: team.members })}>
    <img src={LEAD_ART} alt="" aria-hidden />{t('workspace.focus')}
  </button>
}

export function TeamChatEntry({ sessionId, t }: PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'agentTeams'>) {
  const team = useCaptainTeam(sessionId)
  // The host drops this whole seat while the session is blank, so the mount
  // itself is the only reliable signal that the header entry is on screen.
  // Layout timing keeps the composer fallback from flashing for one frame.
  useLayoutEffect(() => {
    setHeaderEntryMounted(sessionId, true)
    return () => { setHeaderEntryMounted(sessionId, false) }
  }, [sessionId])
  if (!team) return null
  return <TeamEntryButton team={team} sessionId={sessionId} t={t} />
}

/**
 * Composer-row entry for hosts that hide the header chrome.
 *
 * Harness 0.2.3 renders `conversation.session.header.actions` only when the
 * session is not blank, so a team created in a blank session had no entry at
 * all. The composer tool row is rendered in every phase, so this seat carries
 * the same entry whenever the header one is not mounted.
 */
export function TeamComposerEntry({ sessionId, t }: PropsRuntime<'conversation.input.left'> & PropsLocale<'agentTeams'>) {
  const team = useCaptainTeam(sessionId)
  const headerMounted = useSyncExternalStore(subscribeHeaderEntryPresence, getHeaderEntryPresenceSnapshot)
  if (!team || headerEntryOwnsSession(headerMounted, sessionId)) return null
  return <TeamEntryButton team={team} sessionId={sessionId} t={t} />
}

export function TeamTurnCard({ sessionId, turn, useChat, t, openMember }: PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<'agentTeams'> & AgentTeamsCardInjected) {
  const nodes = useChat(snapshot => snapshot.nodes)
  const cards = teamCardsForTurn(nodes.values(), turn.turn)
  if (turn.status !== 'closed' || cards.length === 0) return null
  return <div className={css.turnCards} data-team-turn-cards>{cards.map(node => <AgentTeamsSummary key={node.key}
    data={node.data as import('./agent-teams-card-definition.ts').AgentTeamsCardData}
    sessionId={sessionId} t={t} openMember={openMember} />)}</div>
}
