import Phaser from 'phaser';
import { loadAudioInBackground } from '../view/audio';
import { waitForFonts } from '../view/fonts';
import { generatePlaceholders } from '../view/placeholders';

const SPRITE_MANIFEST = 'assets/sprites/manifest.json';

export class BootScene extends Phaser.Scene {
	constructor() {
		super('Boot');
	}

	preload(): void {
		// Loading bar (fonts are not built yet, so shapes only): ash frame, ember fill.
		const frame = this.add.rectangle(320, 180, 244, 12).setStrokeStyle(2, 0x45424d);
		const bar = this.add.rectangle(200, 180, 1, 8, 0xf08a3a).setOrigin(0, 0.5);
		this.load.on('progress', (value: number) => {
			bar.width = Math.max(1, Math.round(240 * value));
		});
		this.load.once('complete', () => {
			frame.destroy();
			bar.destroy();
		});
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
		generatePlaceholders(this);
		// Every texture so far is pixel art (sprites, backgrounds, icons, placeholders): nearest
		// sampling keeps it sharp while the game itself renders smooth for Roboto (ADR 0015).
		for (const key of this.textures.getTextureKeys())
			this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
		// Boot stays alive (it draws nothing) so its loader can stream the audio in the background.
		void waitForFonts().then(() => this.scene.launch('Title'));
		loadAudioInBackground(this);
	}
}
