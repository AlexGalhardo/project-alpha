// Animates the generated sprites with PixelLab /animate-pixminimax (1 generation per call).
// Run: PIXELLAB_KEY_OVERRIDE=<key> bun scripts/assets/animate.ts [--only <key.anim>] [--force] [--process-only]
// For each job the static sprite is the first frame; the API returns the frames, which are palette snapped,
// aligned to the baseline of frame 0 and joined into a horizontal strip:
//   public/assets/sprites/anim.<key>.<anim>.png   (frame width = sprite width)
// and described in public/assets/sprites/anims.json:
//   { "<key>": { "<anim>": { "file", "frames", "frameWidth", "frameHeight", "durations": [ms...] } } }
// Raw frames stay in art-src/pixellab/anim-raw/. The key is never printed, logged or written.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	apiKey,
	appendLog,
	decodePng,
	encodePng,
	fitCanvas,
	http,
	type Img,
	snap,
} from './pixellab.ts';

const ROOT = join(import.meta.dir, '..', '..');
const SPRITES = join(ROOT, 'public', 'assets', 'sprites');
const RAW = join(ROOT, 'art-src', 'pixellab', 'anim-raw');
const ANIMS_JSON = join(SPRITES, 'anims.json');

type Anim = 'idle' | 'attack';

interface Job {
	/** Texture key without the `.idle` suffix, e.g. `hero.shieldbearer`. */
	key: string;
	anim: Anim;
	description: string;
	subject: string;
	pose: string;
	direction: 'east' | 'west' | null;
	/** Frames asked from the API (a multiple of 4). */
	ask: number;
	/** Frames kept in the strip. */
	keep: number;
	durations: number[];
}

const IDLE_MS = [140, 140, 140, 140];
const ATTACK_MS = [90, 120, 50, 140, 100, 100];

const heroes: [string, string, string, string][] = [
	[
		'shieldbearer',
		'a heavy armoured knight with a tall shield and a sword',
		'standing ready with the shield at the side',
		'a sword slash, the arm swings the sword across and then returns to the ready stance',
	],
	[
		'marksman',
		'a slim hooded archer with a long bow',
		'standing with the bow held low',
		'drawing the bow, releasing an arrow, then lowering the bow again',
	],
	[
		'arcanist',
		'a tall robed figure with a spiked staff and an ember rune',
		'standing with the staff upright',
		'raising the staff, flaring the ember rune in a spell cast, then lowering the staff',
	],
	[
		'confessor',
		'a slender priest in white robes with a lantern staff',
		'standing with the lantern staff upright',
		'thrusting the lantern staff forward in a strike, then pulling it back',
	],
	[
		'bombardier',
		'a stocky armoured gunner with a short hand cannon',
		'standing with the cannon held low',
		'raising the hand cannon, firing it with a recoil, then lowering it',
	],
];

const enemies: [string, string, string, string][] = [
	[
		'husk_penitent',
		'a gaunt man in a torn shift with a chain flail',
		'standing hunched with the chain hanging',
		'swaying slowly, the chain swinging a little',
	],
	[
		'chitter_swarm',
		'a knot of small pale many-legged creatures',
		'crouching in place',
		'twitching, the legs and mouths shifting',
	],
	[
		'ash_acolyte',
		'a cloaked woman holding a brazier on a chain',
		'standing with the brazier hanging',
		'the brazier swinging gently, ash drifting from the sleeves',
	],
	[
		'graft_hound',
		'a stitched quadruped hound',
		'standing on four legs',
		'breathing, the head and tail moving slightly',
	],
	[
		'wax_mourner',
		'a hooded mourner with a wax mask',
		'standing still with arms down',
		'swaying slowly, wax dripping down the chest',
	],
	[
		'rust_templar',
		'a hollow knight in rusted plate with a banner spear',
		'standing with the spear planted',
		'breathing slowly, the banner moving slightly',
	],
	[
		'lantern_leech',
		'a sack-shaped creature with a lantern in its body',
		'resting on the ground',
		'the lantern flickering and the tendrils moving slowly',
	],
	[
		'choir_thing',
		'a tall throatless figure with mouths along the arms',
		'bent forward',
		'swaying, the mouths opening and closing',
	],
	[
		'ossified_brute',
		'a hulking figure of bone with a heavy fist',
		'standing slouched',
		'breathing slowly, the shoulders rising and falling',
	],
	[
		'rift_stalker',
		'a thin long-limbed shape with blade forelimbs',
		'standing poised',
		'swaying slightly, the blade limbs twitching',
	],
];

function buildJobs(): Job[] {
	const jobs: Job[] = [];
	for (const [id, subject, pose, attack] of heroes) {
		jobs.push({
			key: `hero.${id}`,
			anim: 'idle',
			description:
				'idle, standing in place, subtle breathing and a slight sway, looping, the feet stay planted',
			subject,
			pose,
			direction: 'east',
			ask: 4,
			keep: 4,
			durations: IDLE_MS,
		});
		jobs.push({
			key: `hero.${id}`,
			anim: 'attack',
			description: `${attack}, the feet stay planted`,
			subject,
			pose,
			direction: 'east',
			ask: 8,
			keep: 6,
			durations: ATTACK_MS,
		});
	}
	for (const [id, subject, pose, idle] of enemies) {
		jobs.push({
			key: `enemy.${id}`,
			anim: 'idle',
			description: `idle, ${idle}, looping, the feet stay planted`,
			subject,
			pose,
			direction: 'west',
			ask: 4,
			keep: 4,
			durations: IDLE_MS,
		});
	}
	jobs.push({
		key: 'enemy.bell_maw',
		anim: 'idle',
		description:
			'idle, the bell mouth breathing, the teeth and brass parts shifting a little, looping, the base stays rooted',
		subject: 'a cathedral bell grown into a toothed biomechanical mouth',
		pose: 'resting open',
		direction: null,
		ask: 4,
		keep: 4,
		durations: IDLE_MS,
	});
	return jobs;
}

// ---------- frame processing ----------
function bottomRow(img: Img): number {
	for (let y = img.h - 1; y >= 0; y--) {
		for (let x = 0; x < img.w; x++)
			if ((img.d[(y * img.w + x) * 4 + 3] as number) > 0) return y;
	}
	return img.h - 1;
}

function shiftY(img: Img, dy: number): Img {
	if (dy === 0) return img;
	const out = new Uint8Array(img.d.length);
	for (let y = 0; y < img.h; y++) {
		const ty = y + dy;
		if (ty < 0 || ty >= img.h) continue;
		out.set(img.d.subarray(y * img.w * 4, (y + 1) * img.w * 4), ty * img.w * 4);
	}
	return { w: img.w, h: img.h, d: out };
}

function changedPixels(a: Img, b: Img): number {
	let n = 0;
	for (let i = 0; i < a.d.length; i += 4) {
		const same =
			a.d[i] === b.d[i] &&
			a.d[i + 1] === b.d[i + 1] &&
			a.d[i + 2] === b.d[i + 2] &&
			a.d[i + 3] === b.d[i + 3];
		if (!same) n++;
	}
	return n;
}

function opaque(img: Img): number {
	let n = 0;
	for (let i = 3; i < img.d.length; i += 4) if ((img.d[i] as number) > 0) n++;
	return n;
}

function strip(frames: Img[]): Img {
	const w = frames[0]?.w ?? 0;
	const h = frames[0]?.h ?? 0;
	const d = new Uint8Array(w * frames.length * h * 4);
	frames.forEach((f, i) => {
		for (let y = 0; y < h; y++) {
			d.set(f.d.subarray(y * w * 4, (y + 1) * w * 4), (y * w * frames.length + i * w) * 4);
		}
	});
	return { w: w * frames.length, h, d };
}

/** Which of `n` frames to keep: evenly spread, always including the first. */
function pickIndexes(n: number, keep: number): number[] {
	if (keep >= n) return [...Array(n).keys()];
	return Array.from({ length: keep }, (_, i) => Math.round((i * (n - 1)) / (keep - 1)));
}

function processJob(job: Job): { frames: number; w: number; h: number; drift: number[] } {
	const dir = join(RAW, `${job.key}.${job.anim}`);
	const files = readdirSync(dir)
		.filter((f) => f.endsWith('.png'))
		.sort();
	const staticSprite = decodePng(
		new Uint8Array(readFileSync(join(SPRITES, `${job.key}.idle.png`))),
	);
	const raws = files.map((f) => decodePng(new Uint8Array(readFileSync(join(dir, f)))));
	// The API may return the first frame plus the generated ones; keep the generated ones.
	const gen = raws.length > job.ask ? raws.slice(raws.length - job.ask) : raws;
	const chosen = pickIndexes(gen.length, job.keep).map((i) => gen[i] as Img);
	const w = staticSprite.w;
	const h = staticSprite.h;
	const base = bottomRow(staticSprite);
	const frames = chosen.map((raw) => {
		let img = snap(fitCanvas(raw, w, h, true), true);
		img = shiftY(img, base - bottomRow(img));
		return img;
	});
	const drift: number[] = [];
	for (let i = 1; i < frames.length; i++) {
		const a = frames[i - 1] as Img;
		const b = frames[i] as Img;
		drift.push(Math.round((changedPixels(a, b) / Math.max(1, opaque(a))) * 100));
	}
	const file = `anim.${job.key}.${job.anim}.png`;
	writeFileSync(join(SPRITES, file), encodePng(strip(frames)));
	const all = existsSync(ANIMS_JSON)
		? (JSON.parse(readFileSync(ANIMS_JSON, 'utf8')) as Record<string, Record<string, unknown>>)
		: {};
	all[job.key] = {
		...(all[job.key] ?? {}),
		[job.anim]: {
			file: file.replace(/\.png$/, ''),
			frames: frames.length,
			frameWidth: w,
			frameHeight: h,
			durations: job.durations.slice(0, frames.length),
		},
	};
	const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
	writeFileSync(ANIMS_JSON, `${JSON.stringify(sorted, null, '\t')}\n`);
	return { frames: frames.length, w, h, drift };
}

// ---------- generation ----------
async function generate(job: Job, keyStr: string): Promise<boolean> {
	const png = readFileSync(join(SPRITES, `${job.key}.idle.png`));
	const body: Record<string, unknown> = {
		first_frame: { type: 'base64', base64: png.toString('base64'), format: 'png' },
		description: job.description,
		frame_count: job.ask,
		no_background: true,
		view: 'side',
		subject_description: job.subject,
		initial_pose: job.pose,
	};
	if (job.direction) body.direction = job.direction;
	const { first_frame: _first, ...params } = body;
	const date = new Date().toISOString();
	const r = await http('POST', '/animate-pixminimax', body, keyStr);
	const id = (r.json as { background_job_id?: string } | null)?.background_job_id;
	const label = `${job.key}.${job.anim}`;
	if (r.status !== 202 && r.status !== 200) {
		const err = (typeof r.json === 'string' ? r.json : JSON.stringify(r.json)).slice(0, 300);
		appendLog({
			key: label,
			endpoint: '/animate-pixminimax',
			prompt: job.description,
			params,
			date,
			status: 'failed',
			httpStatus: r.status,
			error: err,
		});
		console.error(`Failed ${label}: HTTP ${r.status} ${err.slice(0, 120)}`);
		if ([401, 402, 429].includes(r.status)) throw new Error('stop');
		return false;
	}
	for (let i = 0; i < 90 && id; i++) {
		await Bun.sleep(4000);
		const g = await http('GET', `/background-jobs/${id}`, undefined, keyStr);
		const j = g.json as {
			status?: string;
			usage?: unknown;
			last_response?: { images?: { base64?: string }[] };
		};
		if (g.status >= 400) {
			console.error(`Failed ${label}: poll HTTP ${g.status}`);
			if ([401, 402, 429].includes(g.status)) throw new Error('stop');
			return false;
		}
		if (j.status === 'failed') {
			appendLog({
				key: label,
				endpoint: '/animate-pixminimax',
				prompt: job.description,
				params,
				date,
				status: 'failed',
				httpStatus: g.status,
				jobId: id,
				error: 'job failed',
			});
			console.error(`Failed ${label}: job failed`);
			return false;
		}
		const images = j.last_response?.images ?? [];
		if (j.status === 'completed' && images.length > 0) {
			const dir = join(RAW, `${job.key}.${job.anim}`);
			mkdirSync(dir, { recursive: true });
			images.forEach((im, n) => {
				if (im.base64)
					writeFileSync(
						join(dir, `frame-${String(n).padStart(2, '0')}.png`),
						Buffer.from(im.base64, 'base64'),
					);
			});
			appendLog({
				key: label,
				endpoint: '/animate-pixminimax',
				prompt: job.description,
				params,
				date,
				status: 'ok',
				httpStatus: g.status,
				usage: j.usage,
				jobId: id,
			});
			return true;
		}
	}
	console.error(`Failed ${label}: timeout`);
	return false;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
	const force = args.includes('--force');
	const processOnly = args.includes('--process-only');
	const keyStr = processOnly ? '' : apiKey();
	let generated = 0;
	let skipped = 0;
	let failed = 0;
	const all = existsSync(ANIMS_JSON)
		? (JSON.parse(readFileSync(ANIMS_JSON, 'utf8')) as Record<string, Record<string, unknown>>)
		: {};
	for (const job of buildJobs()) {
		const label = `${job.key}.${job.anim}`;
		if (only && label !== only) continue;
		const rawDir = join(RAW, `${job.key}.${job.anim}`);
		const hasRaw = existsSync(rawDir) && readdirSync(rawDir).length > 0;
		const done = Boolean(all[job.key]?.[job.anim]);
		if (!force && done && hasRaw) {
			skipped++;
			continue;
		}
		if (force || !hasRaw) {
			if (processOnly) continue;
			try {
				if (!(await generate(job, keyStr))) {
					failed++;
					continue;
				}
			} catch {
				console.error(
					`Stopped at ${label}: the API refused the request (auth, credits or rate limit).`,
				);
				break;
			}
			generated++;
		}
		const r = processJob(job);
		console.log(
			`done ${label}: ${r.frames} frames ${r.w}x${r.h}, frame-to-frame change % ${r.drift.join(' ')}`,
		);
	}
	console.log(`generated ${generated}, skipped ${skipped}, failed ${failed}`);
}

await main();
