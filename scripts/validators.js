export const titleRegex = /^\S(?:.*\S)?$/;

export const durationRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

export const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const tagRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

export const duplicateRegex = /\b(\w+)\s+\1\b/i;

export const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function getValidationErrors(rec) {
	if (typeof rec !== 'object' || rec === null || Array.isArray(rec)) {
		return ['record is not a plain object'];
	}

	const errors = [];

	if (typeof rec.id !== 'string' || !rec.id.trim()) {
		errors.push('"id" is missing or not a string');
	}
	if (typeof rec.title !== 'string' || !titleRegex.test(rec.title)) {
		errors.push('"title" is missing, empty, or has leading/trailing spaces');
	}
	if (typeof rec.dueDate !== 'string' || !dateRegex.test(rec.dueDate)) {
		errors.push('"dueDate" is missing or not a valid YYYY-MM-DD date');
	}
	if (rec.duration === undefined || rec.duration === null || !durationRegex.test(String(rec.duration))) {
		errors.push('"duration" is missing or not a positive number');
	}
	if (typeof rec.tag !== 'string' || !tagRegex.test(rec.tag)) {
		errors.push('"tag" is missing or contains characters other than letters, spaces, or hyphens');
	}
	if (typeof rec.createdAt !== 'string' || !isoDateTimeRegex.test(rec.createdAt)) {
		errors.push('"createdAt" is missing or not a valid ISO timestamp');
	}
	if (typeof rec.updatedAt !== 'string' || !isoDateTimeRegex.test(rec.updatedAt)) {
		errors.push('"updatedAt" is missing or not a valid ISO timestamp');
	}
	if (errors.length === 0 && new Date(rec.updatedAt) < new Date(rec.createdAt)) {
		errors.push('"updatedAt" cannot be earlier than "createdAt"');
	}

	return errors;
}

export function validateRecord(rec) {
	return getValidationErrors(rec).length === 0;
}
