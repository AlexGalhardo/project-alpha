// Generates the prototype audio (music loops and SFX) with the ElevenLabs API.
// Run: bun scripts/assets/elevenlabs.ts [--only <key>]
// The API key is read from ELEVEN_LABS_API_KEY and is never printed, logged or written to disk.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const RAW_DIR = join(ROOT, 'art-src', 'audio', 'raw');
const OUT_DIR = join(ROOT, 'public', 'assets', 'audio');
const LOG_PATH = join(ROOT, 'art-src', 'audio', 'generation-log.json');
const API = 'https://api.elevenlabs.io/v1';

type Job =
	| { kind: 'sfx'; key: string; prompt: string; seconds: number }
	| { kind: 'music'; key: string; prompt: string; lengthMs: number; loudness: 'music' };

type LogEntry = {
	key: string;
	kind: 'sfx' | 'music';
	endpoint: string;
	prompt: string;
	params: Record<string, string | number | boolean>;
	date: string;
	status: 'ok' | 'failed';
	httpStatus: number;
	bytes?: number;
	characterCost?: string;
	error?: string;
};

const SFX_SUFFIX = 'close perspective, dry, no music, no voice.';

const SFX: Array<[string, string, number]> = [
	['sfx.card.draw', 'Card slid from a stack over parchment', 0.3],
	['sfx.card.play', 'Card slapped onto stone', 0.4],
	['sfx.card.exhaust', 'Card torn and thrown into a dark pile', 0.6],
	['sfx.card.upgrade', 'Metal click with a rising chime, short', 0.6],
	['sfx.card.invalid', 'Dull wooden knock, rejected', 0.3],
	['sfx.hit.slash', 'Blade cutting through cloth and flesh', 0.5],
	['sfx.hit.blunt', 'Heavy mace hitting rusted plate, dull crunch', 0.5],
	['sfx.hit.pierce', 'Bolt punching through wood with a short whistle', 0.5],
	['sfx.hit.fire', 'Burst of fire with a hiss', 0.6],
	['sfx.hit.multi', 'Three rapid metal knocks', 0.8],
	['sfx.block.gain', 'Shield being raised, metallic slide', 0.5],
	['sfx.block.absorb', 'Blow stopped by shield, short ring', 0.4],
	['sfx.block.break', 'Shield cracking, splintering', 0.6],
	['sfx.status.marked', 'Sharp metal click, sigil lock', 0.4],
	['sfx.status.weakened', 'Low sagging tone, air leaking', 0.6],
	['sfx.status.bleed', 'Wet drip with a faint hiss', 0.5],
	['sfx.status.burn', 'Crackle of fire, short', 0.6],
	['sfx.status.ward', 'Soft bell-like shimmer', 0.5],
	['sfx.status.stun', 'Dull thud with a ringing overtone', 0.6],
	['sfx.stress.gain', 'Low breath tightening into a tremor', 0.8],
	['sfx.stress.collapse', 'Cracked glass and a heavy fall, dark', 1.2],
	['sfx.stress.relief', 'Long exhale with a soft chime', 0.8],
	['sfx.unit.hero_fall', 'Armour hitting stone, a bell-like echo', 1.2],
	['sfx.unit.enemy_death', 'Brittle collapse, bones scattering', 0.9],
	['sfx.unit.boss_phase', 'Deep cathedral bell crack followed by a shockwave', 2.0],
	['sfx.ui.tap', 'Small wooden tick', 0.2],
	['sfx.ui.confirm', 'Two-note low chime', 0.4],
	['sfx.ui.cancel', 'Falling single note', 0.3],
	['sfx.ui.open', 'Stone panel sliding open', 0.5],
	['sfx.ui.close', 'Stone panel closing', 0.5],
	['sfx.ui.coin', 'Few coins clinking', 0.4],
	['sfx.ui.end_turn', 'Heavy iron bell tap', 0.8],
	['sfx.flow.victory', 'Bell chord, short and grim', 2.0],
	['sfx.flow.defeat', 'Low sustained drone falling away', 2.0],
	['sfx.flow.reward', 'Rising three-note sting, dry', 1.0],
];

const MUSIC: Array<[string, string]> = [
	[
		'music.menu',
		'Dark ambient, wordless low choir pad, distant bell, cello drone, solemn and cold, 60 BPM, D minor. Seamless loop: the end flows into the start with no reverb tail.',
	],
	[
		'music.map',
		'Sparse liturgical chant over low strings, soft frame drum, wary travel, 72 BPM, D Dorian. Seamless loop: the end flows into the start with no reverb tail.',
	],
	[
		'music.combat',
		'Low string ostinato, industrial percussion with metal hits and chains, muted brass stabs, tense and steady with no climax, 104 BPM, D Phrygian. Seamless loop.',
	],
	[
		'music.boss',
		'Wordless full choir, pounding drums, bell tolls on the downbeat, distorted low brass, dread and urgency, 124 BPM, C# minor. Seamless loop.',
	],
];

const JOBS: Job[] = [
	...MUSIC.map(
		([key, prompt]): Job => ({
			kind: 'music',
			key,
			prompt: `Instrumental loop. ${prompt}`,
			lengthMs: 60_000,
			loudness: 'music',
		}),
	),
	...SFX.map(
		([key, action, seconds]): Job => ({
			kind: 'sfx',
			key,
			prompt: `${action}, ${SFX_SUFFIX}`,
			seconds,
		}),
	),
];

function apiKey(): string {
	const key = process.env.ELEVEN_LABS_API_KEY;
	if (!key) {
		console.error('ELEVEN_LABS_API_KEY is not set. Nothing was generated.');
		process.exit(1);
	}
	return key;
}

function loadLog(): LogEntry[] {
	if (!existsSync(LOG_PATH)) return [];
	return JSON.parse(readFileSync(LOG_PATH, 'utf8')) as LogEntry[];
}

function appendLog(entry: LogEntry): void {
	const log = loadLog();
	log.push(entry);
	mkdirSync(join(ROOT, 'art-src', 'audio'), { recursive: true });
	writeFileSync(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`);
}

function isFinished(key: string): boolean {
	return existsSync(join(OUT_DIR, `${key}.ogg`)) && existsSync(join(OUT_DIR, `${key}.mp3`));
}

type PostResult = { status: number; characterCost?: string; data: Uint8Array };

// curl is used instead of fetch because Bun's TLS store rejects the local certificate chain.
// The key travels only through curl's stdin config; it is never written to a file or logged.
async function post(url: string, body: unknown, key: string): Promise<PostResult> {
	const dir = mkdtempSync(join(tmpdir(), 'ossuary-el-'));
	try {
		const bodyFile = join(dir, 'body.json');
		const outFile = join(dir, 'out.bin');
		const headFile = join(dir, 'headers.txt');
		writeFileSync(bodyFile, JSON.stringify(body));
		const config = `header = "xi-api-key: ${key}"\nheader = "Content-Type: application/json"\n`;
		const proc = Bun.spawn(
			[
				'curl',
				'-sS',
				'-K',
				'-',
				'-X',
				'POST',
				'--data-binary',
				`@${bodyFile}`,
				'-o',
				outFile,
				'-D',
				headFile,
				'-w',
				'%{http_code}',
				url,
			],
			{ stdin: new Blob([config]), stdout: 'pipe', stderr: 'pipe' },
		);
		const status = Number((await new Response(proc.stdout).text()).trim());
		const code = await proc.exited;
		if (code !== 0) {
			const err = (await new Response(proc.stderr).text()).slice(0, 200);
			throw new Error(`curl exited with ${code}: ${err}`);
		}
		const headers = readFileSync(headFile, 'utf8');
		const characterCost = /character-cost:\s*(\S+)/i.exec(headers)?.[1];
		return { status, characterCost, data: new Uint8Array(readFileSync(outFile)) };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

async function generate(
	job: Job,
	key: string,
): Promise<{ ok: boolean; stop: boolean; retryable: boolean }> {
	const endpoint = job.kind === 'sfx' ? '/sound-generation' : '/music';
	const body =
		job.kind === 'sfx'
			? {
					text: job.prompt,
					duration_seconds: Math.max(0.5, job.seconds),
					prompt_influence: 0.5,
				}
			: { prompt: job.prompt, music_length_ms: job.lengthMs, force_instrumental: true };
	const params: Record<string, string | number | boolean> =
		job.kind === 'sfx'
			? { duration_seconds: Math.max(0.5, job.seconds), prompt_influence: 0.5 }
			: { music_length_ms: job.lengthMs, force_instrumental: true };
	const date = new Date().toISOString();

	const res = await post(`${API}${endpoint}?output_format=mp3_44100_128`, body, key);
	const characterCost = res.characterCost;

	if (res.status < 200 || res.status >= 300) {
		const errorText = new TextDecoder().decode(res.data).slice(0, 300);
		appendLog({
			key: job.key,
			kind: job.kind,
			endpoint,
			prompt: job.prompt,
			params,
			date,
			status: 'failed',
			httpStatus: res.status,
			characterCost,
			error: errorText,
		});
		const stop = [401, 402, 403, 429].includes(res.status);
		return { ok: false, stop, retryable: res.status >= 500 };
	}

	const bytes = res.data;
	mkdirSync(RAW_DIR, { recursive: true });
	await Bun.write(join(RAW_DIR, `${job.key}.mp3`), bytes);
	appendLog({
		key: job.key,
		kind: job.kind,
		endpoint,
		prompt: job.prompt,
		params,
		date,
		status: 'ok',
		httpStatus: res.status,
		bytes: bytes.length,
		characterCost,
	});
	return { ok: true, stop: false, retryable: false };
}

async function convert(job: Job): Promise<void> {
	mkdirSync(OUT_DIR, { recursive: true });
	const input = join(RAW_DIR, `${job.key}.mp3`);
	const target = job.kind === 'music' ? 'I=-16:TP=-1:LRA=11' : 'I=-14:TP=-1:LRA=7';
	const filter = `loudnorm=${target}`;
	const ogg = join(OUT_DIR, `${job.key}.ogg`);
	const mp3 = join(OUT_DIR, `${job.key}.mp3`);
	const run = async (args: string[]): Promise<void> => {
		const proc = Bun.spawn(['ffmpeg', '-y', '-loglevel', 'error', ...args], {
			stdout: 'inherit',
			stderr: 'inherit',
		});
		const code = await proc.exited;
		if (code !== 0) throw new Error(`ffmpeg exited with ${code} for ${job.key}`);
	};
	await run(['-i', input, '-af', filter, '-c:a', 'libvorbis', '-q:a', '4', ogg]);
	await run(['-i', input, '-af', filter, '-c:a', 'libmp3lame', '-b:a', '128k', mp3]);
}

async function main(): Promise<void> {
	const key = apiKey();
	const only = process.argv.indexOf('--only');
	const filter = only > -1 ? process.argv[only + 1] : undefined;
	let generated = 0;
	let skipped = 0;
	let failed = 0;

	for (const job of JOBS) {
		if (filter && job.key !== filter) continue;
		if (isFinished(job.key)) {
			skipped++;
			continue;
		}
		let rawReady = existsSync(join(RAW_DIR, `${job.key}.mp3`));
		if (!rawReady) {
			let result = await generate(job, key);
			if (!result.ok && !result.stop && result.retryable) result = await generate(job, key);
			if (result.stop) {
				console.error(
					`Stopped at ${job.key}: the API refused the request (quota or auth).`,
				);
				break;
			}
			if (!result.ok) {
				failed++;
				console.error(`Failed: ${job.key}`);
				continue;
			}
			generated++;
			rawReady = true;
		}
		if (rawReady) await convert(job);
		console.log(`done ${job.key}`);
	}

	console.log(`generated ${generated}, skipped ${skipped}, failed ${failed}`);
}

await main();
