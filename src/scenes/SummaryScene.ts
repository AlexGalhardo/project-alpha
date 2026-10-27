import Phaser from 'phaser';
import { bankRun, maxHP, recordWin, riteLevel, summaryView } from '../core';
import { ENCOUNTERS } from '../data';
import { BASE_WIDTH } from '../platform/zoom';
import { stopMusic } from '../view/audio';
import { enemyName, t } from '../view/i18n';
import { loadProfile, saveProfile } from '../view/profile';
import { session } from '../view/session';
import { Button, backdrop, fitCamera, label, panel } from '../view/ui';

/** i18n text if the key exists, else null (t() echoes unknown keys). */
function maybe(key: string): string | null {
	const s = t(key);
	return s === key ? null : s;
}

export class SummaryScene extends Phaser.Scene {
	constructor() {
		super('Summary');
	}

	create(): void {
		fitCamera(this);
		stopMusic();
		this.cameras.main.setBackgroundColor('#0e0d12');
		backdrop(this, 'bg.menu', 0.6);
		const state = session.state;
		const view = state ? summaryView(state) : null;
		if (!state || !view) {
			this.scene.start('Menu');
			return;
		}
		// Bank this run's Embers once (the profile remembers the seed).
		const before = loadProfile();
		const rite = riteLevel(state);
		let profile = bankRun(before, state.seed, view.embers);
		// A victory unlocks the next Rite (docs/gdd.md §13.3).
		if (view.victory) profile = recordWin(profile, rite);
		saveProfile(profile);
		const unlockedNow = profile.unlockedRite > before.unlockedRite;
		panel(this, 80, 32, 480, 296);
		const title = view.victory ? t('hud.victory') : t('hud.defeat');
		label(this, BASE_WIDTH / 2, 44, title, 'h1', view.victory ? 'gold2' : 'blood2').setOrigin(
			0.5,
			0,
		);
		const line = view.victory ? t('summary.victory') : t('summary.defeat');
		label(this, BASE_WIDTH / 2, 72, line, 'ui', 'ash5').setOrigin(0.5, 0);
		let y = 92;
		if (view.victory) {
			// Epilogue of the boss of the act the run ended in (the final boss on a full win).
			const boss = Object.values(ENCOUNTERS).find(
				(e) => e.pool === 'boss' && (e.act ?? 1) === state.act,
			)?.enemies[0]?.key;
			const epilogue = boss ? maybe(`boss.${boss}.epilogue`) : null;
			if (epilogue) {
				const ep = label(this, BASE_WIDTH / 2, y, epilogue, 'tiny', 'bone1')
					.setOrigin(0.5, 0)
					.setWordWrapWidth(440)
					.setAlign('center');
				y += ep.height + 8;
			}
		} else {
			// Story line: the encounter that ended the run.
			const lost = [...state.stats.combats].reverse().find((c) => !c.won);
			const enemies = lost ? ENCOUNTERS[lost.id]?.enemies : undefined;
			if (enemies) {
				const names = enemies.map((e) => enemyName(e.key)).join(', ');
				label(
					this,
					BASE_WIDTH / 2,
					y,
					t('summary.fellTo', { enemies: names }),
					'tiny',
					'bone1',
				)
					.setOrigin(0.5, 0)
					.setWordWrapWidth(440)
					.setAlign('center');
				y += 18;
			}
		}
		const top = y + 16;
		const rows = [
			t('summary.rounds', { count: view.roundsCleared }),
			t('summary.elites', { count: view.elitesWon }),
			t('summary.bosses', { count: view.bossesWon }),
			t('summary.collapses', { count: view.collapses }),
			t('summary.embers', { count: view.embers }),
		];
		rows.forEach((r, i) => {
			label(this, 104, top + i * 18, r, 'ui');
		});
		// Per-hero fate (GDD 19 "story machine"): who is left standing and at what cost.
		label(this, 330, top, t('summary.party'), 'ui', 'gold2');
		state.party.forEach((h, i) => {
			const text =
				t('summary.hero', {
					name: t(`hero.${h.id}.name`),
					hp: h.hp,
					max: maxHP(h),
					stress: h.stress,
				}) + (h.injured ? ` · ${t('summary.injured')}` : '');
			label(this, 330, top + 18 + i * 16, text, 'tiny', h.hp > 0 ? 'bone2' : 'blood2');
		});
		if (unlockedNow)
			label(
				this,
				BASE_WIDTH / 2,
				top + 96,
				rite === 0
					? t('summary.firstRite')
					: t('summary.riteWon', { n: rite, next: profile.unlockedRite }),
				'tiny',
				'ember3',
			)
				.setOrigin(0.5, 0)
				.setName('summary-rite-won');
		new Button(this, BASE_WIDTH / 2 - 70, 284, t('summary.mainMenu'), () => this.toMenu(), {
			w: 140,
			h: 32,
			testId: 'summary-menu',
		});
	}

	private toMenu(): void {
		session.clear();
		this.scene.start('Menu');
	}
}
