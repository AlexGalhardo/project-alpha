import { describe, expect, test } from 'bun:test';
import { chooseAutoCommand } from '../../src/core/auto.ts';
import { apply } from '../../src/core/run.ts';
import type { CombatState, Command, RunState } from '../../src/core/types.ts';
import { combat, combatRun, isolate, PARTY, setHand } from './helpers.ts';

/** A combat with one tough enemy (so no fight ends mid-test) and a hand set by the test. */
function ready(party = PARTY, seed = 1): RunState {
	const s = combatRun('A1', party, seed);
	isolate(s, 'ossified_brute', 200);
	return s;
}

/** Plays the auto policy until it ends the turn; returns the card ids it played, in order. */
function playTurn(start: RunState): { played: string[]; end: RunState } {
	let s = start;
	const played: string[] = [];
	for (let i = 0; i < 30; i++) {
		const cmd = chooseAutoCommand(s) as Command;
		if (cmd.type === 'endTurn') return { played, end: s };
		if (cmd.type !== 'playCard') throw new Error(`unexpected ${JSON.stringify(cmd)}`);
		const inst = combat(s).hand.find((c) => c.uid === cmd.cardUid);
		played.push(inst?.cardId ?? '?');
		const r = apply(s, cmd);
		if (r.events.some((e) => e.type === 'invalid'))
			throw new Error(`invalid ${JSON.stringify(cmd)}`);
		s = r.state;
	}
	throw new Error('auto did not end the turn');
}

describe('auto: Channel (energy for next turn)', () => {
	test('is played when it is the only card and the energy is there to pay for it', () => {
		const s = ready(['arcanist', 'shieldbearer', 'confessor']);
		setHand(s, ['arc_channel']);
		combat(s).energy = 1;
		expect(playTurn(s).played).toContain('arc_channel');
	});

	test('is not played without the energy to pay for it', () => {
		const s = ready();
		setHand(s, ['arc_channel']);
		combat(s).energy = 0;
		expect(playTurn(s).played).toEqual([]);
	});
});

describe('auto: Reload (draw now, bonus on a later attack)', () => {
	test('is played when the draw pile has cards and a Bombardier attack is in hand to use the bonus', () => {
		const s = ready(['bombardier', 'shieldbearer', 'confessor']);
		setHand(s, ['bmb_reload', 'bmb_shrapnel']);
		combat(s).energy = 2;
		expect(playTurn(s).played).toContain('bmb_reload');
	});

	test('is not played when there is nothing to draw and no attack to bonus', () => {
		const s = ready(['bombardier', 'shieldbearer', 'confessor']);
		setHand(s, ['bmb_reload']);
		const k = combat(s);
		k.draw = [];
		k.discard = [];
		k.energy = 1;
		expect(playTurn(s).played).toEqual([]);
	});
});

describe('auto: Unseal (draw two, one stress)', () => {
	test('is played at low stress: two cards are worth more than one stress point', () => {
		const s = ready(['arcanist', 'shieldbearer', 'confessor']);
		setHand(s, ['arc_unseal']);
		combat(s).energy = 1;
		expect(playTurn(s).played).toContain('arc_unseal');
	});

	test('is not played when its stress would collapse the arcanist', () => {
		const s = ready(['arcanist', 'shieldbearer', 'confessor']);
		setHand(s, ['arc_unseal']);
		combat(s).energy = 1;
		const owner = s.party.find((h) => h.id === 'arcanist');
		if (owner) owner.stress = 9;
		expect(playTurn(s).played).toEqual([]);
	});
});

describe('auto: Rekindle (fallen hero returns)', () => {
	test('is played when a hero has fallen', () => {
		const s = ready();
		const k: CombatState = combat(s);
		k.lineup = k.lineup.filter((id) => id !== 'marksman');
		k.fallen = ['marksman'];
		const m = s.party.find((h) => h.id === 'marksman');
		if (m) m.hp = 0;
		setHand(s, ['cnf_rekindle']);
		combat(s).energy = 2;
		expect(playTurn(s).played).toContain('cnf_rekindle');
	});

	test('is not played when no hero has fallen', () => {
		const s = ready();
		setHand(s, ['cnf_rekindle']);
		combat(s).energy = 1;
		expect(playTurn(s).played).toEqual([]);
	});
});

describe('auto: determinism and purity', () => {
	test('the same state gives the same command, and choosing does not change the state', () => {
		const s = ready();
		setHand(s, ['arc_channel', 'shb_hack']);
		const before = JSON.stringify(s);
		const first = chooseAutoCommand(s);
		expect(chooseAutoCommand(s)).toEqual(first);
		expect(JSON.stringify(s)).toBe(before);
	});

	test('a whole auto combat from the same seed ends in the same state every time', () => {
		const run = (): string => {
			let s: RunState = combatRun('A1', PARTY, 7);
			for (let i = 0; i < 2000 && s.phase === 'combat'; i++) {
				const cmd = chooseAutoCommand(s) as Command;
				s = apply(s, cmd).state;
			}
			return JSON.stringify(s);
		};
		expect(run()).toBe(run());
	});
});
