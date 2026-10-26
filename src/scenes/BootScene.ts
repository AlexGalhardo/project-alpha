import Phaser from 'phaser';
import { generatePlaceholders } from '../view/placeholders';

export class BootScene extends Phaser.Scene {
	constructor() {
		super('Boot');
	}

	create(): void {
		generatePlaceholders(this);
		this.scene.start('Title');
	}
}
