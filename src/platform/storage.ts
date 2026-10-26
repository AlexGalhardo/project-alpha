// The only module that touches localStorage; every access is guarded because storage can be
// blocked (private mode, disabled site data) and the game must keep running without it.
export function readText(key: string): string | null {
	try {
		return globalThis.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

export function writeText(key: string, value: string): boolean {
	try {
		globalThis.localStorage?.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

export function removeKey(key: string): void {
	try {
		globalThis.localStorage?.removeItem(key);
	} catch {
		// Storage unavailable: nothing to remove.
	}
}
