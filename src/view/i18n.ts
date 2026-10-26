import { en, type Strings } from '../i18n/en';
import { ptBR } from '../i18n/pt-BR';

export type Locale = 'en' | 'pt-BR';

const TABLES: Record<Locale, Strings> = { en, 'pt-BR': ptBR };
let current: Locale = 'en';

export function setLocale(locale: Locale): void {
	current = locale;
}

export function getLocale(): Locale {
	return current;
}

export function detectLocale(language: string | undefined): Locale {
	return language?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

/** Looks up a dotted key ("hud.endTurn") and fills `{name}` placeholders. Missing keys show the key itself. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
	let node: unknown = TABLES[current];
	for (const part of key.split('.')) {
		if (typeof node !== 'object' || node === null) return key;
		node = (node as Record<string, unknown>)[part];
	}
	if (typeof node !== 'string') return key;
	return node.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in vars ? String(vars[name]) : match,
	);
}
