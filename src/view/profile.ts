import { emptyProfile, type Profile, parseProfile } from '../core';
import { readText, writeText } from '../platform/storage';

const KEY = 'ossuary.profile.v1';

/** Meta profile (banked Embers, skill-tree nodes) kept outside the run save. */
export function loadProfile(): Profile {
	const raw = readText(KEY);
	if (!raw) return emptyProfile();
	try {
		return parseProfile(JSON.parse(raw));
	} catch {
		return emptyProfile();
	}
}

export function saveProfile(profile: Profile): void {
	writeText(KEY, JSON.stringify(profile));
}
