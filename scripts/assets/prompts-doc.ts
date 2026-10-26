/**
 * Renders docs/assets-prompts-used.md from the generation logs. Rerun after every batch.
 * Reads only the logs and checks file existence; never reads API keys or request headers.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const AUDIO_LOG = join(ROOT, 'art-src/audio/generation-log.json');
const PIXEL_LOG = join(ROOT, 'art-src/pixellab/generation-log.json');
const OUT = join(ROOT, 'docs/assets-prompts-used.md');

interface Entry {
	key: string;
	kind?: string;
	endpoint: string;
	prompt: string;
	params: Record<string, unknown>;
	date: string;
	status: string;
	httpStatus: number;
	error?: string;
	note?: string;
	usage?: unknown;
}

function isEntry(v: unknown): v is Entry {
	if (typeof v !== 'object' || v === null) return false;
	const e = v as Record<string, unknown>;
	return (
		typeof e.key === 'string' &&
		typeof e.endpoint === 'string' &&
		typeof e.prompt === 'string' &&
		typeof e.params === 'object' &&
		e.params !== null &&
		typeof e.date === 'string' &&
		typeof e.status === 'string' &&
		typeof e.httpStatus === 'number'
	);
}

async function readLog(path: string): Promise<Entry[]> {
	const raw: unknown = JSON.parse(await Bun.file(path).text());
	if (!Array.isArray(raw) || !raw.every(isEntry))
		throw new Error(`unexpected log shape: ${path}`);
	return raw;
}

/** Table cell safe: pipes escaped, newlines collapsed. */
function cell(s: string): string {
	return s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
}

function formatParams(params: Record<string, unknown>): string {
	return Object.entries(params)
		.filter(([k]) => k !== 'description')
		.map(([k, v]) => {
			if (k === 'image_size' && typeof v === 'object' && v !== null) {
				const { width, height } = v as { width: number; height: number };
				return `size ${width}x${height}`;
			}
			return `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`;
		})
		.join('; ');
}

function category(key: string): string {
	const [head] = key.split('.');
	const map: Record<string, string> = {
		hero: 'Heroes',
		enemy: 'Enemies',
		card: 'Cards',
		bg: 'Backgrounds',
		icon: 'Icons (status, node, item)',
		music: 'Music',
		sfx: 'Sound effects',
	};
	return map[head ?? ''] ?? 'Other';
}

function outputFiles(e: Entry): string {
	// A failed attempt can share its key with a later successful retry; don't attribute those files to it.
	if (e.status !== 'ok') return 'none (failed attempt)';
	const candidates = [
		`public/assets/audio/${e.key}.ogg`,
		`public/assets/audio/${e.key}.mp3`,
		`art-src/pixellab/raw/${e.key}.png`,
	];
	const found = candidates.filter((p) => existsSync(join(ROOT, p)));
	return found.length ? found.map((p) => `\`${p}\``).join(', ') : 'none on disk';
}

function table(entries: Entry[]): string {
	const head =
		'| Key | Tool / endpoint | Prompt | Params | Date | Status | Output files |\n| --- | --- | --- | --- | --- | --- | --- |';
	const rows = entries.map((e) => {
		const status =
			e.status === 'ok' ? `ok (HTTP ${e.httpStatus})` : `failed (HTTP ${e.httpStatus})`;
		const note = e.note ? `; note: ${e.note}` : '';
		return `| \`${e.key}\` | \`${e.endpoint}\` | ${cell(e.prompt)} | ${cell(formatParams(e.params))} | ${e.date} | ${cell(status + note)} | ${outputFiles(e)} |`;
	});
	return [head, ...rows].join('\n');
}

function section(title: string, entries: Entry[]): string {
	const groups = new Map<string, Entry[]>();
	for (const e of entries) {
		const c = category(e.key);
		groups.set(c, [...(groups.get(c) ?? []), e]);
	}
	return [
		`## ${title}`,
		'',
		...[...groups].flatMap(([c, es]) => [`### ${c} (${es.length})`, '', table(es), '']),
	].join('\n');
}

const audio = (await readLog(AUDIO_LOG)).filter((e) => e.status !== 'failed');
const pixel = (await readLog(PIXEL_LOG)).filter((e) => e.status !== 'failed');
const audioFailed = (await readLog(AUDIO_LOG)).filter((e) => e.status === 'failed');
const pixelFailed = (await readLog(PIXEL_LOG)).filter((e) => e.status === 'failed');

const now = new Date().toISOString();
const doc = [
	'# Asset prompts used',
	'',
	`Regenerated from logs on ${now} by \`scripts/assets/prompts-doc.ts\`. Do not edit by hand; rerun the script.`,
	'',
	'Source of truth: `art-src/audio/generation-log.json` (ElevenLabs) and `art-src/pixellab/generation-log.json` (PixelLab).',
	'Rerun this script after every generation batch so the counts and the prompt list stay current.',
	'',
	'## Tools and common settings',
	'',
	'- **ElevenLabs** (audio, approved by the developer 2026-10-26 ~19:16): `POST https://api.elevenlabs.io/v1/sound-generation` for SFX (`duration_seconds`, `prompt_influence`) and `POST https://api.elevenlabs.io/v1/music` for music (`music_length_ms`, `force_instrumental`). Requests are sent with curl; the key is never logged.',
	'- **Post-processing (audio)**: ffmpeg loudnorm, music target I=-16 dBFS, SFX target I=-14 dBFS, true peak -1 dBTP; OGG (libvorbis q4) and MP3 (128k) outputs.',
	'- **PixelLab** (art): `create_image_pixflux` endpoint. Common settings across the logged entries: `no_background=true`, `outline="selective outline"`, `shading="medium shading"`, `detail="medium detail"`, `text_guidance_scale=8`, `color_image="master palette (33 colours)"`. Sizes and directions are per entry.',
	'- Style rules applied to every PixelLab prompt: dark fantasy, grim and worn; single light from the upper left; 1 px selective outline; no dithering; no pure black or pure white.',
	'',
	'## Counts',
	'',
	`- Audio: ${audio.length} successful entries, ${audioFailed.length} failed attempts.`,
	`- PixelLab: ${pixel.length} successful entries, ${pixelFailed.length} failed attempts.`,
	'',
	section('Audio (ElevenLabs)', audio),
	section('Pixel art (PixelLab)', pixel),
	'## Failed attempts',
	'',
	'Kept for history. Failed entries have no output files.',
	'',
	'### ElevenLabs',
	'',
	table(
		audioFailed.map((e) => ({
			...e,
			prompt: e.prompt,
			note: e.error ? `error: ${e.error}` : undefined,
		})),
	),
	'',
	'### PixelLab',
	'',
	table(pixelFailed.map((e) => ({ ...e, note: e.error ? `error: ${e.error}` : undefined }))),
	'',
].join('\n');

await Bun.write(OUT, doc);
console.log(
	`wrote ${OUT}: audio ${audio.length}+${audioFailed.length} failed, pixellab ${pixel.length}+${pixelFailed.length} failed`,
);
