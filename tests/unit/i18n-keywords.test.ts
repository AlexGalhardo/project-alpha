import { describe, expect, test } from 'bun:test';
import { CARDS } from '../../src/data/index.ts';
import { en } from '../../src/i18n/en.ts';
import { ptBR } from '../../src/i18n/pt-BR.ts';

// A card uses a keyword when its data says so. The keyword name must then appear in the card's
// text, character for character, in each locale (keyword.<id>.name in en.ts and pt-BR.ts).
type CardData = { params: Record<string, number>; exhaust?: boolean };

const MECHANICS: [keyword: string, uses: (c: CardData) => boolean][] = [
	['exhaust', (c) => c.exhaust === true],
	['dread', (c) => typeof c.params.dread === 'number'],
	['push', (c) => typeof c.params.push === 'number'],
	['pull', (c) => typeof c.params.pull === 'number'],
	['swap', (c) => typeof c.params.swapBehind === 'number'],
	['splash', (c) => typeof c.params.splash === 'number'],
];

describe('keyword names in card texts (GDD 6.2, i18n ADR 0009)', () => {
	for (const [keyword, uses] of MECHANICS) {
		test(`every card with ${keyword} names it in both locales`, () => {
			const cards = Object.entries(CARDS).filter(([, def]) =>
				uses(def as unknown as CardData),
			);
			for (const [id] of cards) {
				const enText = en.card[id as keyof typeof en.card]?.text ?? '';
				const ptText = ptBR.card[id as keyof typeof ptBR.card]?.text ?? '';
				const enName = en.keyword[keyword as keyof typeof en.keyword].name;
				const ptName = ptBR.keyword[keyword as keyof typeof ptBR.keyword].name;
				expect({ id, locale: 'en', hasName: enText.includes(enName) }).toEqual({
					id,
					locale: 'en',
					hasName: true,
				});
				expect({ id, locale: 'pt-BR', hasName: ptText.includes(ptName) }).toEqual({
					id,
					locale: 'pt-BR',
					hasName: true,
				});
			}
		});
	}

	test('the mechanic list covers at least one card per keyword in the data', () => {
		for (const [keyword, uses] of MECHANICS) {
			const count = Object.values(CARDS).filter((def) =>
				uses(def as unknown as CardData),
			).length;
			if (keyword === 'pull') continue; // no shipped card uses Pull yet
			expect({ keyword, count: count > 0 }).toEqual({ keyword, count: true });
		}
	});
});
