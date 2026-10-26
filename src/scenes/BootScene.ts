import Phaser from 'phaser';
import { preloadAudio } from '../view/audio';
import { buildPixelFonts } from '../view/fonts';
import { generatePlaceholders } from '../view/placeholders';

export class BootScene extends Phaser.Scene {
	constructor() {
		super('Boot');
	}

	preload(): void {
		preloadAudio(this);
	}

	create(): void {
		buildPixelFonts(this);
		generatePlaceholders(this);
		this.scene.start('Title');
	}
}
