import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Session-owned entry points: a persistent title action and a durable turn card. */
import { useLayoutEffect, useSyncExternalStore } from 'react';
import { AgentTeamsSummary, openActivityPanel } from "./AgentTeamsCard.js";
import { getActivitySnapshotsSnapshot, subscribeActivitySnapshots } from "./activity-monitor.js";
import { teamCardsForTurn } from "./agent-teams-card-definition.js";
import { getHeaderEntryPresenceSnapshot, headerEntryOwnsSession, setHeaderEntryMounted, subscribeHeaderEntryPresence, } from "./entry-presence.js";
import { LEAD_ART } from "./artwork.js";
import css from './AgentTeamsCard.module.css';
/** The team this session captains, live or archived. */
function useCaptainTeam(sessionId) {
    const { teams, archivedTeams } = useSyncExternalStore(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
    return [...teams, ...archivedTeams].find(team => team.captainSessionId === sessionId);
}
function TeamEntryButton({ team, sessionId, t }) {
    return _jsxs("button", { className: css.chatEntry, "data-team-chat-entry": true, type: "button", title: t('workspace.focus'), onClick: () => openActivityPanel({ teamId: team.teamId, captainSessionId: sessionId, teamName: team.name, members: team.members }), children: [_jsx("img", { src: LEAD_ART, alt: "", "aria-hidden": true }), t('workspace.focus')] });
}
export function TeamChatEntry({ sessionId, t }) {
    const team = useCaptainTeam(sessionId);
    // The host drops this whole seat while the session is blank, so the mount
    // itself is the only reliable signal that the header entry is on screen.
    // Layout timing keeps the composer fallback from flashing for one frame.
    useLayoutEffect(() => {
        setHeaderEntryMounted(sessionId, true);
        return () => { setHeaderEntryMounted(sessionId, false); };
    }, [sessionId]);
    if (!team)
        return null;
    return _jsx(TeamEntryButton, { team: team, sessionId: sessionId, t: t });
}
/**
 * Composer-row entry for hosts that hide the header chrome.
 *
 * Harness 0.2.3 renders `conversation.session.header.actions` only when the
 * session is not blank, so a team created in a blank session had no entry at
 * all. The composer tool row is rendered in every phase, so this seat carries
 * the same entry whenever the header one is not mounted.
 */
export function TeamComposerEntry({ sessionId, t }) {
    const team = useCaptainTeam(sessionId);
    const headerMounted = useSyncExternalStore(subscribeHeaderEntryPresence, getHeaderEntryPresenceSnapshot);
    if (!team || headerEntryOwnsSession(headerMounted, sessionId))
        return null;
    return _jsx(TeamEntryButton, { team: team, sessionId: sessionId, t: t });
}
export function TeamTurnCard({ sessionId, turn, useChat, t, openMember }) {
    const nodes = useChat(snapshot => snapshot.nodes);
    const cards = teamCardsForTurn(nodes.values(), turn.turn);
    if (turn.status !== 'closed' || cards.length === 0)
        return null;
    return _jsx("div", { className: css.turnCards, "data-team-turn-cards": true, children: cards.map(node => _jsx(AgentTeamsSummary, { data: node.data, sessionId: sessionId, t: t, openMember: openMember }, node.key)) });
}
