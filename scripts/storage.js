const KEY = 'campusPlanner';

const SCHEMA_KEY = 'campusPlannerSchemaVersion';
const CURRENT_SCHEMA = 2;

export function load() {
	const tasks = JSON.parse(localStorage.getItem(KEY) || '[]');
	const storedSchema = Number(localStorage.getItem(SCHEMA_KEY) || 1);

	if (storedSchema < 2 && tasks.length) {
		tasks.forEach(t => { t.duration = Number(t.duration) * 60; });
		localStorage.setItem(KEY, JSON.stringify(tasks));
	}
	localStorage.setItem(SCHEMA_KEY, String(CURRENT_SCHEMA));

	return tasks;
}

export const save = data => localStorage.setItem(KEY, JSON.stringify(data));

const TARGET_KEY = 'campusPlannerTarget';
export const loadTarget = () => Number(localStorage.getItem(TARGET_KEY) || 0);
export const saveTarget = value => localStorage.setItem(TARGET_KEY, value);

const UNIT_KEY = 'campusPlannerUnit';
export const loadUnit = () => localStorage.getItem(UNIT_KEY) || 'minutes';
export const saveUnit = value => localStorage.setItem(UNIT_KEY, value);
