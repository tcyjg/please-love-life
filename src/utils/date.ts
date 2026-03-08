export function getTodayKey(): string {
	return new Date().toISOString().slice(0, 10);
}
