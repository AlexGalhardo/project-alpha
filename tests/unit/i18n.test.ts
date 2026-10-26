import { describe, expect, test } from 'bun:test';
import { en } from '../../src/i18n/en';
import { ptBR } from '../../src/i18n/pt-BR';

type Leaves = Map<string, string>;

function collect(node: unknown, prefix: string, out: Leaves): Leaves {
	if (typeof node === 'string') {
		out.set(prefix, node);
		return out;
	}
	if (typeof node === 'object' && node !== null) {
		for (const [key, value] of Object.entries(node)) {
			collect(value, prefix === '' ? key : `${prefix}.${key}`, out);
		}
	}
	return out;
}

function placeholders(text: string): string[] {
	return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort();
}

const enLeaves = collect(en, '', new Map());
const ptLeaves = collect(ptBR, '', new Map());

describe('i18n dictionaries (ADR 0009)', () => {
	test('every English key exists in PT-BR', () => {
		const missing = [...enLeaves.keys()].filter((key) => !ptLeaves.has(key));
		expect(missing).toEqual([]);
	});

	test('every PT-BR key exists in English', () => {
		const extra = [...ptLeaves.keys()].filter((key) => !enLeaves.has(key));
		expect(extra).toEqual([]);
	});

	test('no leaf string is empty or whitespace-only', () => {
		const empty = [...enLeaves, ...ptLeaves]
			.filter(([, value]) => value.trim() === '')
			.map(([key]) => key);
		expect(empty).toEqual([]);
	});

	test('placeholders match between locales for every key', () => {
		const mismatched = [...enLeaves.keys()].filter((key) => {
			const en = enLeaves.get(key) ?? '';
			const pt = ptLeaves.get(key) ?? '';
			return placeholders(en).join(',') !== placeholders(pt).join(',');
		});
		expect(mismatched).toEqual([]);
	});

	test('every card has a name and a rules text', () => {
		const cardKeys = [...enLeaves.keys()].filter((key) => key.startsWith('card.'));
		const cardIds = new Set(cardKeys.map((key) => key.split('.')[1] ?? ''));
		expect(cardIds.size).toBe(45);
		for (const id of cardIds) {
			expect(enLeaves.has(`card.${id}.name`)).toBe(true);
			expect(enLeaves.has(`card.${id}.text`)).toBe(true);
			expect(ptLeaves.has(`card.${id}.name`)).toBe(true);
			expect(ptLeaves.has(`card.${id}.text`)).toBe(true);
		}
	});

	test('card rules text stays within 12 words before placeholder substitution', () => {
		const tooLong = [...enLeaves]
			.filter(([key]) => key.startsWith('card.') && key.endsWith('.text'))
			.filter(([, value]) => value.replace(/\{\w+\}/g, 'N').split(/\s+/).length > 12)
			.map(([key]) => key);
		expect(tooLong).toEqual([]);
	});
});
