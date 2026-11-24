import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type AgentTeamsCardInjected } from './AgentTeamsCard.tsx';
export declare function TeamChatEntry({ sessionId, t }: PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'agentTeams'>): import("react").JSX.Element | null;
/**
 * Composer-row entry for hosts that hide the header chrome.
 *
 * Harness 0.2.3 renders `conversation.session.header.actions` only when the
 * session is not blank, so a team created in a blank session had no entry at
 * all. The composer tool row is rendered in every phase, so this seat carries
 * the same entry whenever the header one is not mounted.
 */
export declare function TeamComposerEntry({ sessionId, t }: PropsRuntime<'conversation.input.left'> & PropsLocale<'agentTeams'>): import("react").JSX.Element | null;
export declare function TeamTurnCard({ sessionId, turn, useChat, t, openMember }: PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<'agentTeams'> & AgentTeamsCardInjected): import("react").JSX.Element | null;
