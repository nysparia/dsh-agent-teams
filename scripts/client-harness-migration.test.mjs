import assert from 'node:assert/strict'
import test from 'node:test'
import { currentSessionId, openAgentTeamMember } from '../lib/client/session-navigation.js'
import { toolResultFailed, teamCardsForTurn } from '../lib/client/agent-teams-card-definition.js'

test('panel follows mainView ownership including retained subagents outside the list ids', () => {
  assert.equal(currentSessionId({ current: 'old', byId: {} }), 'old')
  assert.equal(currentSessionId({ current: undefined, byId: {} }), undefined)
  const byId = { root: { id: 'root', retainedBy: { background: 1 } }, child: { id: 'child', retainedBy: { mainView: 1 } } }
  assert.equal(currentSessionId({ byId, ids: ['root'] }), 'child')
  assert.equal(currentSessionId({ byId: { root: byId.root } }), undefined)
})

test('new workspace navigation opens an exact durable member address without removed session methods', async () => {
  const targets = []
  assert.equal(await openAgentTeamMember({}, 'captain', 'child', undefined, { openSession: target => targets.push(target) }), 'subagent')
  assert.deepEqual(targets, [{ parentSessionId: 'captain', childSessionId: 'child', mode: 'continuable' }])
  await assert.rejects(openAgentTeamMember({}, 'captain', 'child'), /does not expose session navigation/)
})

test('failed create results never become successful team cards across both message formats', () => {
  assert.equal(toolResultFailed({ content: [{ type: 'text', text: 'rejected' }], isError: true }), true)
  assert.equal(toolResultFailed({ content: [{ type: 'tool-result', isError: true, content: [] }] }), true)
  assert.equal(toolResultFailed({ content: [{ type: 'text', text: 'created' }] }), false)
})

test('legacy sessions keep their old address navigation even when uiWorkspace exists', async () => {
  const calls = []
  await openAgentTeamMember({ open: id => calls.push(id) }, 'parent', 'child', undefined, {
    openSession: () => { throw new Error('old uiWorkspace does not accept a subagent address') },
  })
  assert.deepEqual(calls, ['child'])
})


test('turn tail keeps each team summary on its create turn and supports multiple teams', () => {
  const first = { key: 'a', kind: 'agent-teams', location: { kind: 'step', turn: { turn: 1 } } }
  const second = { key: 'b', kind: 'agent-teams', location: { kind: 'turn', turn: { turn: 1 } } }
  const later = { key: 'c', kind: 'agent-teams', location: { kind: 'step', turn: { turn: 2 } } }
  const prose = { key: 'd', kind: 'assistant-step', location: first.location }
  const unbound = { key: 'e', kind: 'agent-teams', location: { kind: 'session' } }
  const nodes = new Map([first, second, later, prose, unbound].map(node => [node.key, node]))
  assert.deepEqual(teamCardsForTurn(nodes.values(), 1), [first, second])
  assert.deepEqual(teamCardsForTurn(nodes.values(), 2), [later])
  assert.deepEqual(teamCardsForTurn(nodes.values(), 3), [])
})

test('the composer entry stands in only while the header seat is not mounted', async () => {
  const { getHeaderEntryPresenceSnapshot, headerEntryOwnsSession, setHeaderEntryMounted, subscribeHeaderEntryPresence } =
    await import('../lib/client/entry-presence.js')
  const seen = []
  const off = subscribeHeaderEntryPresence(() => seen.push([...getHeaderEntryPresenceSnapshot()]))
  // A blank session never mounts the header seat, so the composer entry owns it.
  assert.equal(headerEntryOwnsSession(getHeaderEntryPresenceSnapshot(), 'blank'), false)
  setHeaderEntryMounted('blank', true)
  assert.equal(headerEntryOwnsSession(getHeaderEntryPresenceSnapshot(), 'blank'), true)
  // Presence is per session: another session's seat must not hide this entry.
  assert.equal(headerEntryOwnsSession(getHeaderEntryPresenceSnapshot(), 'other'), false)
  // Idempotent writes publish nothing, so a re-render cannot loop the store.
  setHeaderEntryMounted('blank', true)
  assert.deepEqual(seen, [['blank']])
  setHeaderEntryMounted('blank', false)
  assert.equal(headerEntryOwnsSession(getHeaderEntryPresenceSnapshot(), 'blank'), false)
  assert.deepEqual(seen, [['blank'], []])
  off()
  setHeaderEntryMounted('blank', true)
  assert.equal(seen.length, 2)
})
