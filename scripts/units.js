export const MINUTES_PER_HOUR = 60;

export function roundClean(value) {
	return Math.round(Number(value) * 100) / 100;
}

export function minutesToHours(minutes) {
	return roundClean(Number(minutes) / MINUTES_PER_HOUR);
}

export function hoursToMinutes(hours) {
	return roundClean(Number(hours) * MINUTES_PER_HOUR);
}

export function toCanonicalMinutes(value, unit) {
	return unit === 'hours' ? hoursToMinutes(value) : roundClean(value);
}

export function fromCanonicalMinutes(minutes, unit) {
	return unit === 'hours' ? minutesToHours(minutes) : roundClean(minutes);
}

export function unitAbbrev(unit) {
	return unit === 'hours' ? 'hr' : 'min';
}

export function unitWord(unit) {
	return unit === 'hours' ? 'hours' : 'minutes';
}

export function formatDuration(minutesValue, unit) {
	return `${fromCanonicalMinutes(minutesValue, unit)} ${unitAbbrev(unit)}`;
}
