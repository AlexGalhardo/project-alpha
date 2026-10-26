import Phaser from 'phaser';
import { preloadAudio } from '../view/audio';
import { buildPixelFonts } from '../view/fonts';
import { generatePlaceholders } from '../view/placeholders';

const SPRITE_MANIFEST = 'assets/sprites/manifest.json';

export class BootScene extends Phaser.Scene {
	constructor() {
		super('Boot');
	}

	preload(): void {
		preloadAudio(this);
		// Generated art is listed in a manifest so only files that exist are requested; any key not
		// listed keeps its procedural placeholder (same key and size, .claude/rules/assets.md).
		this.load.json('sprite-manifest', SPRITE_MANIFEST);
		this.load.on(
			'filecomplete-json-sprite-manifest',
			(_key: string, _type: string, data: unknown) => {
				const keys = Array.isArray(data)
					? data.filter((k): k is string => typeof k === 'string')
					: [];
				// Files follow `<entity>.<pose>`; the static prototype pose `idle` is the base texture key.
				for (const name of keys) {
					this.load.image(name.replace(/\.idle$/, ''), `assets/sprites/${name}.png`);
				}
			},
		);
	}

	create(): void {
		buildPixelFonts(this);
		generatePlaceholders(this);
		this.scene.start('Title');
	}
}
