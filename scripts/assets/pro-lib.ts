// Shared helpers for the PixelLab Pro endpoints (async jobs). The key is passed through http() (curl stdin config) only.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { decodePng, encodePng, http, type Img, PALETTE } from './pixellab.ts';

export const ROOT = join(import.meta.dir, '..', '..');
export const STYLE_DIR = join(ROOT, 'art-src', 'pixellab', 'style');
export const CONCEPT_DIR = join(ROOT, 'references', 'concept-arts');

export const loadPng = (path: string): Img => decodePng(new Uint8Array(readFileSync(path)));
export const b64 = (img: Img): string => Buffer.from(encodePng(img)).toString('base64');
export const b64Image = (img: Img): { type: 'base64'; base64: string; format: 'png' } => ({
	type: 'base64',
	base64: b64(img),
	format: 'png',
});

export function crop(img: Img, x: number, y: number, w: number, h: number): Img {
	const d = new Uint8Array(w * h * 4);
	for (let j = 0; j < h; j++) {
		d.set(img.d.subarray(((y + j) * img.w + x) * 4, ((y + j) * img.w + x + w) * 4), j * w * 4);
	}
	return { w, h, d };
}

export function writeImg(path: string, img: Img): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, encodePng(img));
}

export const PALETTE_HEX: string[] = PALETTE.map(
	([r, g, b]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
);

export interface JobResult {
	ok: boolean;
	stop: boolean;
	status: number;
	jobId?: string;
	usage?: unknown;
	images: Img[];
	error?: string;
}

/** POST a job endpoint, poll until completed. Stops (stop=true) on 401/402/429. */
export async function runJob(
	path: string,
	body: unknown,
	key: string,
	maxPolls = 120,
): Promise<JobResult> {
	const r = await http('POST', path, body, key);
	const id = (r.json as { background_job_id?: string } | null)?.background_job_id;
	if ((r.status !== 200 && r.status !== 202) || !id) {
		const err = (typeof r.json === 'string' ? r.json : JSON.stringify(r.json)).slice(0, 300);
		return {
			ok: false,
			stop: [401, 402, 429].includes(r.status),
			status: r.status,
			images: [],
			error: err,
		};
	}
	for (let i = 0; i < maxPolls; i++) {
		await Bun.sleep(4000);
		const g = await http('GET', `/background-jobs/${id}`, undefined, key);
		if (g.status >= 400) {
			return {
				ok: false,
				stop: [401, 402, 429].includes(g.status),
				status: g.status,
				jobId: id,
				images: [],
				error: `poll ${g.status}`,
			};
		}
		const j = g.json as {
			status?: string;
			usage?: unknown;
			last_response?: { images?: { base64?: string }[]; image?: { base64?: string } };
		};
		if (j.status === 'failed')
			return {
				ok: false,
				stop: false,
				status: g.status,
				jobId: id,
				images: [],
				error: 'job failed',
			};
		if (j.status === 'completed') {
			const list =
				j.last_response?.images ?? (j.last_response?.image ? [j.last_response.image] : []);
			const images = list
				.filter((x) => x.base64)
				.map((x) => decodePng(new Uint8Array(Buffer.from(x.base64 as string, 'base64'))));
			return {
				ok: images.length > 0,
				stop: false,
				status: g.status,
				jobId: id,
				usage: j.usage,
				images,
			};
		}
	}
	return { ok: false, stop: false, status: 0, jobId: id, images: [], error: 'timeout' };
}

export { existsSync };
