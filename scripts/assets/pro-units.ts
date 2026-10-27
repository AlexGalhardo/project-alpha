// Native-resolution units and card art through PixelLab Pro (/generate-image-v2), styled by the concept arts.
// Run: PIXELLAB_KEY_OVERRIDE=<key> bun scripts/assets/pro-units.ts [--group heroes|enemies|bosses|cards] [--only <key>] [--force] [--process-only] [--limit N]
// Raw output: art-src/pixellab/raw-pro/<key>.png. Final: public/assets/sprites/<key>.png (palette snapped, bottom aligned).
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	apiKey,
	appendLog,
	cards,
	cardsAct2,
	enemies,
	enemiesAct2,
	fitCanvas,
	type Img,
	heroes as legacyHeroes,
	paletteImage,
	snap,
} from './pixellab.ts';
import {
	b64Image,
	CONCEPT_DIR,
	crop,
	loadPng,
	PALETTE_HEX,
	ROOT,
	runJob,
	STYLE_DIR,
	writeImg,
} from './pro-lib.ts';

const RAW = join(ROOT, 'art-src', 'pixellab', 'raw-pro');
const OUT = join(ROOT, 'public', 'assets', 'sprites');

type Group = 'heroes' | 'enemies' | 'bosses' | 'cards';
interface Job {
	key: string;
	group: Group;
	prompt: string;
	size: [number, number];
	facing: 'right' | 'left' | null;
	styleFile: string;
	/** Concept art file the style crop comes from (logged per asset). */
	concept: string;
	subjectRef?: string;
}

// ---- unified template (docs/art-bible.md section 15.1) ----
const UNIT_TEMPLATE = (facing: 'right' | 'left', desc: string): string =>
	`2D side-scroller game sprite of a single character in strict side profile, like a fighting game character seen exactly from the side. The torso, hips and legs are turned 90 degrees in profile, the head and face are in profile pointing to the ${facing} edge of the image, only one shoulder and the near arm and leg are clearly visible, flat orthographic camera at eye level, the whole body visible from head to feet, the whole figure fits inside the canvas with a small margin, feet planted on a flat ground line near the bottom edge of the canvas, facing ${facing}. ${desc} Grimdark dark fantasy, worn and weathered. Dark tinted outline, single light from the upper left, muted master palette of ash greys, dark iron, bone, worn gold and deep crimson accents, no pure black, no pure white. No text, no background, no ground, no shadow, no frame, no other characters.`;

const CARD_TEMPLATE = (scene: string): string =>
	`Pixel art illustration for a card, wide landscape composition, one clear focal point. ${scene}. Grimdark dark fantasy, cold ash greys, dark iron, bone, ember orange and worn gold, strong value contrast at the focal point, dark vignette edges, light from the upper left. No border, no frame, no text, no letters, no stars, no pentagrams, no eight-pointed symbols.`;

const HERO_DESC: Record<string, string> = {
	shieldbearer:
		'A heavy knight in black riveted plate armour with gold trim, a horned helm with a red plume and a red scarf, a tall kite shield with a red cross, a broad jagged sword held low pointing down and forward, a short tattered crimson cape. Standing upright and calm, legs side by side in profile, not lunging.',
	marksman:
		'A slim hooded archer in charcoal leather and scale, a narrow bone mask under the hood, a tall recurve bow held in the front hand, a quiver of arrows over the shoulder, a torn dark red sash.',
	arcanist:
		'A tall figure in layered dark violet robes with a deep hood, a faceless metal mask, a long staff topped by a spiked glowing violet orb held upright, small floating shards at the hem.',
	confessor:
		'A priest in long ash-white robes with a tall hood and a thin golden halo ring, a plague-like beaked mask, a tall brass lantern-staff with pale green light held upright, a leather satchel and a book on the hip.',
	bombardier:
		'A stocky gunner in dark riveted iron armour with a breathing helmet and a red scarf, a huge brass-banded hand cannon resting on the shoulder, shell belts across the chest, a red banner tabard.',
};
const heroStyle = 'style-heroes.png';
const enemyStyle = 'style-enemies.png';

const ACT3: [string, [number, number], string][] = [
	[
		'iron_mourner',
		[64, 80],
		'A hooded giant in riveted iron plate, carrying a huge funeral bell on a hammer haft.',
	],
	[
		'grave_cur',
		[80, 64],
		'An emaciated hound wrapped in grey burial cloth, glowing seams of ember light along the wrappings.',
	],
	[
		'ash_cantor',
		[64, 80],
		'A robed singer with a stitched-shut mouth, ash pouring from the long sleeves.',
	],
	[
		'bronze_scribe',
		[64, 80],
		'A bronze automaton monk with a quill blade in one hand and a heavy ledger in the other.',
	],
	[
		'hollow_choir',
		[80, 112],
		'Three fused hollow-faced choristers standing on one stone plinth, mouths open, robes melded together.',
	],
	[
		'sepulchre_knight',
		[80, 112],
		'A tomb-effigy knight risen from its slab, stone and iron plate, carrying a huge greatsword.',
	],
	[
		'wax_saint',
		[64, 80],
		'A melting wax saint statue with a dripping halo, hands folded, wax running down the robes.',
	],
	[
		'chain_wraith',
		[64, 80],
		'A translucent pale wraith bound in hanging iron chains, hollow eyes.',
	],
	[
		'marrow_butcher',
		[64, 80],
		'A hunched bone-plated butcher holding twin cleavers, a stained leather apron.',
	],
	[
		'rift_spawn',
		[48, 48],
		'A small wet rift larva with many eyes, glistening skin, a ragged mouth.',
	],
];

const BOSS_SIZE: [number, number] = [400, 360];

function buildJobs(): Job[] {
	const jobs: Job[] = [];
	for (const [id] of legacyHeroes) {
		jobs.push({
			key: `hero.${id}.idle`,
			group: 'heroes',
			prompt: UNIT_TEMPLATE('right', HERO_DESC[id] ?? ''),
			size: [192, 240],
			facing: 'right',
			styleFile: heroStyle,
			concept: 'batle-1.png',
			subjectRef: `hero-${id}.png`,
		});
	}
	for (const [id, size, desc] of [...enemies, ...enemiesAct2, ...ACT3]) {
		jobs.push({
			key: `enemy.${id}.idle`,
			group: 'enemies',
			prompt: UNIT_TEMPLATE('left', desc),
			size: [size[0] * 3, size[1] * 3],
			facing: 'left',
			styleFile: enemyStyle,
			concept: 'batle-1.png',
		});
	}
	const bosses: [string, string][] = [
		[
			'bell_maw',
			'A colossal cathedral bell grown into a biomechanical mouth with a rim of bone teeth, rooted in cracked stone, brass machinery on the sides, a dark opening at the front, seen from the side.',
		],
		[
			'gilded_penitent',
			'A giant reliquary statue of a kneeling saint in gold leaf over rot, hands clasped, cracks of green rot leaking through the gold, a ruined golden halo, seen from the side.',
		],
		[
			'rift_mother',
			'A colossal mass of bone, wax and machinery cradled in iron ribs, an open rift womb glowing from within, seen from the side.',
		],
	];
	for (const [id, desc] of bosses) {
		jobs.push({
			key: `enemy.${id}.idle`,
			group: 'bosses',
			prompt: UNIT_TEMPLATE('left', `${desc} A huge boss that fills the canvas.`),
			size: id === 'rift_mother' ? [480, 432] : BOSS_SIZE,
			facing: 'left',
			styleFile: enemyStyle,
			concept: 'batle-1.png',
		});
	}
	for (const [id, scene] of [...cards, ...cardsAct2]) {
		jobs.push({
			key: `card.${id}`,
			group: 'cards',
			prompt: CARD_TEMPLATE(scene),
			size: [180, 120],
			facing: null,
			styleFile: 'style-cards.png',
			concept: 'batle-1.png',
		});
	}
	return jobs;
}

function ensureStyleFiles(): void {
	const f = join(STYLE_DIR, 'style-cards.png');
	if (!existsSync(f))
		writeImg(f, crop(loadPng(join(CONCEPT_DIR, 'batle-1.png')), 305, 705, 960, 125));
}

function bbox(img: Img): { x0: number; y0: number; x1: number; y1: number } | null {
	let x0 = img.w;
	let y0 = img.h;
	let x1 = -1;
	let y1 = -1;
	for (let y = 0; y < img.h; y++) {
		for (let x = 0; x < img.w; x++) {
			if ((img.d[(y * img.w + x) * 4 + 3] as number) > 0) {
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
		}
	}
	return x1 < 0 ? null : { x0, y0, x1, y1 };
}

function processJob(job: Job): void {
	let img = loadPng(join(RAW, `${job.key}.png`));
	const unit = job.group !== 'cards';
	img = snap(img, unit);
	if (unit) {
		const b = bbox(img);
		if (b) img = crop(img, b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1);
		img = fitCanvas(img, job.size[0], job.size[1], true);
	} else {
		img = fitCanvas(img, job.size[0], job.size[1], false);
	}
	writeImg(join(OUT, `${job.key}.png`), img);
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const arg = (k: string): string | undefined =>
		args.includes(k) ? args[args.indexOf(k) + 1] : undefined;
	const group = arg('--group') ?? 'all';
	const only = arg('--only');
	const limit = Number(arg('--limit') ?? '100000');
	const force = args.includes('--force');
	const processOnly = args.includes('--process-only');
	const key = processOnly ? '' : apiKey();
	ensureStyleFiles();
	mkdirSync(RAW, { recursive: true });
	let generated = 0;
	let skipped = 0;
	let failed = 0;
	let spent = 0;
	for (const job of buildJobs()) {
		if (group !== 'all' && job.group !== group) continue;
		if (only && !only.split(',').includes(job.key)) continue;
		const rawPath = join(RAW, `${job.key}.png`);
		if (!force && existsSync(rawPath)) {
			skipped++;
			if (processOnly || !existsSync(join(OUT, `${job.key}.png`))) processJob(job);
			continue;
		}
		if (processOnly) continue;
		if (generated >= limit) break;
		const style = loadPng(join(STYLE_DIR, job.styleFile));
		const body: Record<string, unknown> = {
			description: job.prompt,
			image_size: { width: job.size[0], height: job.size[1] },
			no_background: job.group !== 'cards',
			style_image: {
				image: b64Image(style),
				size: { width: style.w, height: style.h },
				usage_description:
					'pixel size, shading, outline and mood only; do not copy the subject',
			},
			style_options: { color_palette: false, outline: true, detail: true, shading: true },
			target_palette: { colors: PALETTE_HEX, name: 'Ossuary master palette' },
		};
		const refs = job.subjectRef && !args.includes('--no-ref') ? [job.subjectRef] : [];
		if (refs.length) {
			body.reference_images = refs.map((f) => {
				const im = loadPng(join(STYLE_DIR, f));
				return {
					image: b64Image(im),
					size: { width: im.w, height: im.h },
					usage_description:
						'the character design to depict as a clean side-view sprite; ignore its background and any interface',
				};
			});
		}
		const { style_image: _s, reference_images: _r, target_palette: _t, ...params } = body;
		const date = new Date().toISOString();
		const isCard = job.group === 'cards';
		const cardBody = {
			description: job.prompt,
			image_size: { width: job.size[0], height: job.size[1] },
			outline: 'lineless',
			shading: 'medium shading',
			detail: 'highly detailed',
			text_guidance_scale: 8,
			color_image: paletteImage(),
		};
		const r = isCard
			? await runJob('/create-image-pixflux-background', cardBody, key)
			: await runJob('/generate-image-v2', body, key);
		const logBase = {
			key: job.key,
			endpoint:
				job.group === 'cards' ? '/create-image-pixflux-background' : '/generate-image-v2',
			prompt: job.prompt,
			params: {
				...params,
				style_concept: job.concept,
				style_file: job.styleFile,
				subject_ref: job.subjectRef ?? null,
				palette: 'master 33',
			},
			date,
			httpStatus: r.status,
			jobId: r.jobId,
			usage: r.usage,
		};
		if (!r.ok) {
			appendLog({ ...logBase, status: 'failed', error: r.error });
			console.error(`Failed ${job.key}: ${r.error?.slice(0, 160)}`);
			failed++;
			if (r.stop) {
				console.error(
					'Stopped: the API refused the request (auth, credits or rate limit).',
				);
				break;
			}
			continue;
		}
		appendLog({ ...logBase, status: 'ok' });
		writeImg(rawPath, r.images[0] as Img);
		processJob(job);
		generated++;
		const gens = (r.usage as { generations?: number } | null)?.generations ?? 0;
		spent += gens;
		console.log(`done ${job.key} (${gens} generations)`);
	}
	console.log(
		`generated ${generated}, skipped ${skipped}, failed ${failed}, generations ${spent}`,
	);
}

if (import.meta.main) await main();
