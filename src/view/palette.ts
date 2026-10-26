// Master palette, docs/art-bible.md §4. Numbers are 0xRRGGBB for Phaser; css strings for Text.
export const P = {
	ash0: 0x0e0d12,
	ash1: 0x1b1a22,
	ash2: 0x2c2a33,
	ash3: 0x45424d,
	ash4: 0x6b6772,
	ash5: 0x9a95a0,
	ash6: 0xcfcad2,
	iron0: 0x23303a,
	iron1: 0x3b4c58,
	iron2: 0x66808c,
	bone0: 0x8a7a62,
	bone1: 0xbfae8c,
	bone2: 0xe8dcc0,
	ember0: 0x3a1410,
	ember1: 0x7a2418,
	ember2: 0xc2461f,
	ember3: 0xf08a3a,
	gold0: 0x5a4320,
	gold1: 0xa07a2c,
	gold2: 0xe0b84a,
	blood0: 0x4a0f17,
	blood1: 0x8e1e2a,
	blood2: 0xd0404a,
	rot0: 0x1d3a24,
	rot1: 0x3f7a3a,
	rot2: 0x9cd65a,
	rift0: 0x2a1a3e,
	rift1: 0x5b3a8a,
	rift2: 0x9d7ad6,
	ward0: 0x2f5c8a,
	ward1: 0x7fb8e0,
} as const;

export type PaletteKey = keyof typeof P;

export function css(key: PaletteKey): string {
	return `#${P[key].toString(16).padStart(6, '0')}`;
}
