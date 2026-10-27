/**
 * Color-vision audit for the semantic tokens of docs/art-bible.md section 5 and the status icons of section 7.3.
 * Simulates protanopia, deuteranopia and tritanopia with the Machado, Oliveira and Fernandes (2009) model at
 * severity 1.0 (https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html), measures pairwise
 * CIEDE2000 color difference, and writes docs/reports/2026-10-26-colorblind.md. Pairs with dE < 10 under any
 * simulation are flagged; each flagged pair must differ by shape or the report proposes a fix.
 */
import { join } from 'node:path';
import { P, type PaletteKey } from '../../src/view/palette.ts';

const ROOT = join(import.meta.dir, '..', '..');
const OUT = join(ROOT, 'docs/reports/2026-10-26-colorblind.md');
const THRESHOLD = 10;

type Rgb = [number, number, number];
type Lab = [number, number, number];

/** Machado et al. 2009, severity 1.0, applied to linear RGB. */
const MACHADO: Record<'protanopia' | 'deuteranopia' | 'tritanopia', number[][]> = {
	protanopia: [
		[0.152286, 1.052583, -0.204868],
		[0.114503, 0.786281, 0.099216],
		[-0.003882, -0.048116, 1.051998],
	],
	deuteranopia: [
		[0.367322, 0.860646, -0.227968],
		[0.280085, 0.672501, 0.047413],
		[-0.01182, 0.04294, 0.968881],
	],
	tritanopia: [
		[1.255528, -0.076749, -0.178779],
		[-0.078411, 0.930809, 0.147602],
		[0.004733, 0.691367, 0.3039],
	],
};

function hexToRgb(n: number): Rgb {
	return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff].map((c) => c / 255) as Rgb;
}

function toLinear(c: number): number {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toSrgb(c: number): number {
	const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
	return Math.min(1, Math.max(0, v));
}

function simulate(rgb: Rgb, kind: keyof typeof MACHADO): Rgb {
	const lin = rgb.map(toLinear);
	const m = MACHADO[kind];
	const out = m.map((row) =>
		Math.min(
			1,
			Math.max(
				0,
				row.reduce((s, v, i) => s + v * (lin[i] ?? 0), 0),
			),
		),
	);
	return out.map(toSrgb) as Rgb;
}

function rgbToLab(rgb: Rgb): Lab {
	const [r, g, b] = rgb.map(toLinear) as Rgb;
	const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
	const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
	const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
	const f = (t: number): number =>
		t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
	const fx = f(x);
	const fy = f(y);
	const fz = f(z);
	return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const deg = (r: number): number => (r * 180) / Math.PI;
const rad = (d: number): number => (d * Math.PI) / 180;

/** CIEDE2000 with kL = kC = kH = 1 (Sharma, Wu, Dalal 2005). */
export function deltaE2000(l1: Lab, l2: Lab): number {
	const [L1, a1, b1] = l1;
	const [L2, a2, b2] = l2;
	const C1 = Math.hypot(a1, b1);
	const C2 = Math.hypot(a2, b2);
	const Cbar = (C1 + C2) / 2;
	const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
	const a1p = (1 + G) * a1;
	const a2p = (1 + G) * a2;
	const C1p = Math.hypot(a1p, b1);
	const C2p = Math.hypot(a2p, b2);
	const hue = (ap: number, b: number): number => {
		if (ap === 0 && b === 0) return 0;
		const h = deg(Math.atan2(b, ap));
		return h < 0 ? h + 360 : h;
	};
	const h1p = hue(a1p, b1);
	const h2p = hue(a2p, b2);
	const dLp = L2 - L1;
	const dCp = C2p - C1p;
	let dhp = 0;
	if (C1p * C2p !== 0) {
		dhp = h2p - h1p;
		if (dhp > 180) dhp -= 360;
		else if (dhp < -180) dhp += 360;
	}
	const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);
	const Lbarp = (L1 + L2) / 2;
	const Cbarp = (C1p + C2p) / 2;
	let hbarp = h1p + h2p;
	if (C1p * C2p !== 0) {
		if (Math.abs(h1p - h2p) > 180)
			hbarp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
		else hbarp = (h1p + h2p) / 2;
	} else hbarp = h1p + h2p;
	const T =
		1 -
		0.17 * Math.cos(rad(hbarp - 30)) +
		0.24 * Math.cos(rad(2 * hbarp)) +
		0.32 * Math.cos(rad(3 * hbarp + 6)) -
		0.2 * Math.cos(rad(4 * hbarp - 63));
	const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
	const RC = 2 * Math.sqrt(Cbarp ** 7 / (Cbarp ** 7 + 25 ** 7));
	const SL = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
	const SC = 1 + 0.045 * Cbarp;
	const SH = 1 + 0.015 * Cbarp * T;
	const RT = -Math.sin(rad(2 * dTheta)) * RC;
	const tL = dLp / SL;
	const tC = dCp / SC;
	const tH = dHp / SH;
	return Math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH);
}

interface Token {
	id: string;
	/** Palette key; the hex is taken from src/view/palette.ts. */
	color: PaletteKey;
	/** Shape from docs/art-bible.md section 5 or 7.3 (always present on the token). */
	shape: string;
}

/** Section 5 tokens. Color keys follow the table; shapes are the table's shape column, shortened. */
const TOKENS: Token[] = [
	{ id: 'hp', color: 'blood2', shape: 'bar with notch every 10 HP, heart glyph' },
	{ id: 'hp track', color: 'blood0', shape: 'bar track' },
	{ id: 'block', color: 'ward1', shape: 'shield glyph' },
	{ id: 'stress', color: 'rift2', shape: '10 diamond pips' },
	{ id: 'energy', color: 'ember3', shape: 'orb with flame notch' },
	{ id: 'damage', color: 'blood2', shape: 'minus sign with slash spark, sword glyph' },
	{ id: 'heal', color: 'rot2', shape: 'plus sign with cross glyph' },
	{ id: 'buff', color: 'gold2', shape: 'chevron up' },
	{ id: 'debuff', color: 'rift2', shape: 'chevron down' },
	{ id: 'ally', color: 'gold1', shape: 'square frame' },
	{ id: 'enemy', color: 'blood1', shape: 'frame with notched corners' },
	{ id: 'rarity common', color: 'ash4', shape: 'plain 2 px frame' },
	{ id: 'rarity uncommon', color: 'iron2', shape: '2 px frame, clipped 45 deg corners' },
	{ id: 'rarity rare', color: 'gold2', shape: '2 px frame, corner studs, crest' },
	{ id: 'rarity legendary', color: 'ember3', shape: 'double frame, thorn crown' },
	{ id: 'focus', color: 'ember3', shape: 'L-shaped corner brackets' },
	{ id: 'selected', color: 'gold2', shape: 'outline and raise by 4-16 px' },
	{ id: 'valid target', color: 'gold2', shape: 'pulsing corner brackets, dotted line' },
	{ id: 'invalid', color: 'ash3', shape: 'diagonal hatch' },
];

/** Section 7.3 status set as the Art Bible specifies it (the spec color and chevron). */
const STATUS_SPEC: Token[] = [
	{ id: 'status block (spec)', color: 'ward1', shape: 'shield' },
	{ id: 'status might (spec)', color: 'gold2', shape: 'raised fist, chevron up' },
	{ id: 'status ward (spec)', color: 'bone2', shape: 'ring with rune, chevron up' },
	{ id: 'status marked (spec)', color: 'ember3', shape: 'crosshair, chevron down' },
	{ id: 'status weakened (spec)', color: 'ash5', shape: 'broken blade, chevron down' },
	{ id: 'status bleed (spec)', color: 'blood2', shape: 'droplet, chevron down' },
	{ id: 'status burn (spec)', color: 'ember2', shape: 'flame, chevron down' },
	{ id: 'status stunned (spec)', color: 'gold1', shape: 'spiral, chevron down' },
];

/** Status icons as src/view/placeholders.ts draws them (color and icon kind, read from the file). */
const STATUS_CODE: { id: string; color: PaletteKey; shape: string }[] = [
	{ id: 'icon.status.block', color: 'ward1', shape: 'square' },
	{ id: 'icon.status.might', color: 'ember3', shape: 'tri' },
	{ id: 'icon.status.marked', color: 'gold2', shape: 'diamond' },
	{ id: 'icon.status.weakened', color: 'rift2', shape: 'tri' },
	{ id: 'icon.status.bleed', color: 'blood2', shape: 'circle' },
	{ id: 'icon.status.burn', color: 'ember2', shape: 'tri' },
	{ id: 'icon.status.ward', color: 'ward0', shape: 'diamond' },
	{ id: 'icon.status.stunned', color: 'ash5', shape: 'circle' },
];

type Sim = 'normal' | keyof typeof MACHADO;
const SIMS: Sim[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

function labFor(token: { color: PaletteKey }, sim: Sim): Lab {
	const rgb = hexToRgb(P[token.color]);
	return rgbToLab(sim === 'normal' ? rgb : simulate(rgb, sim));
}

interface PairResult {
	a: string;
	b: string;
	must: string;
	de: Record<Sim, number>;
	min: number;
	flagged: boolean;
	shapeDistinct: boolean;
	shapeNote: string;
}

function pair(
	a: Token | { id: string; color: PaletteKey; shape: string },
	b: { id: string; color: PaletteKey; shape: string },
	must: string,
): PairResult {
	const de = {} as Record<Sim, number>;
	for (const s of SIMS) de[s] = deltaE2000(labFor(a, s), labFor(b, s));
	const min = Math.min(de.protanopia, de.deuteranopia, de.tritanopia);
	const shapeDistinct = a.shape !== b.shape;
	return {
		a: a.id,
		b: b.id,
		must,
		de,
		min,
		flagged: min < THRESHOLD,
		shapeDistinct,
		shapeNote: shapeDistinct ? 'different shape' : 'same shape descriptor',
	};
}

function find(
	list: { id: string }[],
	id: string,
): { id: string; color: PaletteKey; shape: string } {
	const t = list.find((x) => x.id === id);
	if (!t || !('color' in t)) throw new Error(`token not found: ${id}`);
	return t as { id: string; color: PaletteKey; shape: string };
}

const SEMANTIC_PAIRS: [string, string, string][] = [
	['damage', 'heal', 'damage vs heal'],
	['hp', 'stress', 'hp vs stress'],
	['hp', 'damage', 'hp vs damage (same color)'],
	['buff', 'debuff', 'buff vs debuff'],
	['ally', 'enemy', 'ally vs enemy (turn queue)'],
	['block', 'heal', 'block vs heal'],
	['block', 'buff', 'block vs buff'],
	['energy', 'buff', 'energy vs buff'],
	['focus', 'selected', 'focus vs selected'],
	['selected', 'valid target', 'selected vs valid target (same color)'],
	['invalid', 'rarity common', 'invalid vs common rarity'],
	['rarity common', 'rarity uncommon', 'common vs uncommon'],
	['rarity uncommon', 'rarity rare', 'uncommon vs rare'],
	['rarity rare', 'rarity legendary', 'rare vs legendary'],
];

const semantic = SEMANTIC_PAIRS.map(([a, b, must]) => pair(find(TOKENS, a), find(TOKENS, b), must));

const statusCode = STATUS_CODE.map((s) => s);
const statusPairs: PairResult[] = [];
for (let i = 0; i < statusCode.length; i++)
	for (let j = i + 1; j < statusCode.length; j++) {
		const a = statusCode[i];
		const b = statusCode[j];
		if (a && b) statusPairs.push(pair(a, b, 'status icons (placeholders.ts)'));
	}

const specPairs: PairResult[] = [];
for (let i = 0; i < STATUS_SPEC.length; i++)
	for (let j = i + 1; j < STATUS_SPEC.length; j++) {
		const a = STATUS_SPEC[i];
		const b = STATUS_SPEC[j];
		if (a && b && a.color !== b.color)
			specPairs.push(pair(a, b, 'status icons (art bible 7.3)'));
	}

function fmt(n: number): string {
	return n.toFixed(1);
}

function row(p: PairResult): string {
	const flag = p.flagged ? 'FLAG' : 'ok';
	return `| ${p.a} | ${p.b} | ${fmt(p.de.normal)} | ${fmt(p.de.protanopia)} | ${fmt(p.de.deuteranopia)} | ${fmt(p.de.tritanopia)} | ${fmt(p.min)} | ${flag} | ${p.shapeNote} |`;
}

const header =
	'| A | B | dE normal | dE protan | dE deutan | dE tritan | min dE (CVD) | Result | Shape |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |';

const flaggedSemantic = semantic.filter((p) => p.flagged);
const flaggedStatus = statusPairs.filter((p) => p.flagged);
const flaggedNeedsShape = [...flaggedSemantic, ...flaggedStatus].filter((p) => !p.shapeDistinct);
const specFlagged = specPairs.filter((p) => p.flagged);

const now = new Date().toISOString();
const md = [
	'# Color-vision audit (2026-10-26)',
	'',
	`Generated by \`scripts/a11y/colorblind.ts\` at ${now}. Rerun after any palette or token change.`,
	'',
	'## Method',
	'',
	'- Colors: `src/view/palette.ts` hex values, as drawn by Phaser.',
	'- Simulation: Machado, Oliveira and Fernandes (2009), "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE TVCG 15(6). Severity 1.0. Matrices applied to linear RGB. Paper: [CVD_Simulation](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html)',
	'- Difference: CIEDE2000 (kL = kC = kH = 1), Sharma, Wu and Dalal (2005). Measured in D65 Lab.',
	`- Flag: min dE under any simulation below ${THRESHOLD}. Each flagged pair must differ by shape (Art Bible section 5 and 7.3). Same-shape pairs need a fix.`,
	'- Shape: the shape column of the Art Bible for section 5 tokens and section 7.3 status icons. The "Shape" column says whether the two descriptors differ. It does not measure pixels; that check is part of the 1x review of the real sprites.',
	'',
	'## Summary',
	'',
	`- Section 5 pairs checked: ${semantic.length}. Flagged (dE < ${THRESHOLD} under a CVD simulation): ${flaggedSemantic.length}.`,
	`- Status icons as drawn in \`src/view/placeholders.ts\`: ${statusPairs.length} pairs. Flagged: ${flaggedStatus.length}.`,
	`- Status icons as the Art Bible section 7.3 specifies: ${specPairs.length} pairs with different color. Flagged: ${specFlagged.length}.`,
	`- Flagged pairs without a shape difference: ${flaggedNeedsShape.length}.`,
	'',
	'## Section 5 tokens',
	'',
	header,
	...semantic.map(row),
	'',
	'## Status icons: placeholders.ts',
	'',
	'Shape column: `placeholders.ts` icon kind. `tri` icons (might, weakened, burn) are the same kind in code; their meaning depends on the chevron direction, which the code does not record.',
	'',
	header,
	...statusPairs.map(row),
	'',
	'## Status icons: Art Bible 7.3 (spec)',
	'',
	'Only pairs with different spec colors are listed. Shape column: spec shape with chevron.',
	'',
	header,
	...specPairs.map(row),
	'',
	'## Findings and proposed fixes',
	'',
	...(flaggedNeedsShape.length === 0
		? ['No flagged pair lacks a shape difference by the descriptors.']
		: flaggedNeedsShape.map(
				(p) =>
					`- ${p.a} vs ${p.b}: min dE ${fmt(p.min)} and same shape descriptor. Proposed fix: add a distinct glyph or frame to one side.`,
			)),
	'',
	'### Checked by hand',
	'',
	'- hp vs damage: same color (blood2), dE 0 in every view. Distinct by shape (bar with heart vs minus with sword). Passes the shape rule; keep both glyphs visible at 1x.',
	'- selected vs valid target: same color (gold2). Distinct by shape (outline and raise vs pulsing brackets with dotted line). Passes.',
	'- focus vs selected and energy vs buff: ember3 vs gold2, min dE 5.5 (deuteranopia). Distinct by shape (L brackets vs outline; orb vs chevron). Passes.',
	'- rarity common vs uncommon (min dE 7.9) and rare vs legendary (min dE 5.5): differ only by 2-3 px frame details (clipped corners; studs and crest; double frame and crown). Passes by descriptor. Needs the 1x check on real sprites. If that fails, add a rarity pip row so the tiers differ by count as well as frame.',
	'',
	'### Status icons: placeholders.ts (defects)',
	'',
	'- `tri` draws its apex up in `icon()` (placeholders.ts, `fillTriangle(..., c, 0)`). `weakened` and `burn` are debuffs and must show a down chevron (Art Bible 7.3). Both currently render as up-triangles, so the chevron rule fails for them. Fix: add a down-pointing triangle to `icon()` and use it for both icons.',
	'- `bleed` and `stunned` are both circles. The spec has a droplet and a spiral. Same silhouette, so shape carries no information between them. Fix: draw a droplet and a spiral (or a distinct silhouette for each) instead of the circle.',
	'- Colors differ from Art Bible 7.3 for 5 of 8 statuses: might (ember3, spec gold2), ward (ward0, spec bone2), marked (gold2, spec ember3), weakened (rift2, spec ash5), stunned (ash5, spec gold1). Section 5 maps debuff to rift2 while 7.3 gives weakened ash5, so the Art Bible disagrees with itself. Decide the color per status with the developer, then align placeholders.ts.',
	'- Flagged placeholder pairs (min dE < 10): might vs marked (deut 5.5), weakened vs stunned (tritan 9.3), bleed vs burn (tritan 2.9). Each pair differs by icon kind, so they pass the shape rule. Pairs of the same kind (`tri` for might, weakened and burn) depend on the orientation defect above.',
	'',
	'### Status icons: Art Bible 7.3 (spec)',
	'',
	'- Flagged spec pairs differ by glyph (raised fist vs crosshair; droplet vs flame; spiral vs droplet and flame). bleed vs burn (tritan 2.9) shares a down chevron, so it rests on the droplet vs flame silhouette at 9 px. Needs the 1x check.',
	'',
].join('\n');

await Bun.write(OUT, md);
console.log(
	`wrote ${OUT}: semantic flagged ${flaggedSemantic.length}/${semantic.length}, status(placeholders) flagged ${flaggedStatus.length}/${statusPairs.length}, status(spec) flagged ${specFlagged.length}/${specPairs.length}`,
);
