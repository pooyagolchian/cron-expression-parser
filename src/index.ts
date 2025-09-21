export interface CronExpression {
	minutes: number[];
	hours: number[];
	days_of_month: number[];
	months: number[];
	days_of_week: number[];
	command: string;
}

export function parseCronExpression(cronString: string): CronExpression {
	const parts = cronString.trim().split(/\s+/);

	if (parts.length < 6) {
		throw new Error("Invalid cron expression: must have at least 6 fields (5 time fields + command)");
	}

	const [minute, hour, dayOfMonth, month, dayOfWeek, ...cmdParts] = parts;
	const command = cmdParts.join(" ");

	if (!command.trim()) {
		throw new Error("Invalid cron expression: command cannot be empty");
	}

	return {
		minutes: parseField(minute, 0, 59),
		hours: parseField(hour, 0, 23),
		days_of_month: parseField(dayOfMonth, 1, 31),
		months: parseField(month, 1, 12),
		days_of_week: normalizeDays(parseField(dayOfWeek, 0, 7)),
		command,
	};
}

function parseField(field: string, min: number, max: number): number[] {
	if (field === "*") {
		return range(min, max);
	}

	const values = new Set<number>();

	for (const part of field.split(",")) {
		if (part.includes("/")) {
			parseStep(part, min, max, values);
		} else if (part.includes("-")) {
			parseRange(part, min, max, values);
		} else {
			parseSingle(part, min, max, values);
		}
	}

	return [...values].sort((a, b) => a - b);
}

function parseStep(expr: string, min: number, max: number, values: Set<number>) {
	const [rangeStr, stepStr] = expr.split("/");
	const step = Number.parseInt(stepStr, 10);

	if (Number.isNaN(step) || step <= 0) {
		throw new Error(`Invalid step value: ${stepStr}`);
	}

	let start = min;
	let end = max;

	if (rangeStr !== "*") {
		if (rangeStr.includes("-")) {
			const parts = rangeStr.split("-").map(n => Number.parseInt(n, 10));
			start = parts[0];
			end = parts[1];
		} else {
			start = Number.parseInt(rangeStr, 10);
		}
	}

	if (Number.isNaN(start) || Number.isNaN(end) || start < min || end > max || start > end) {
		throw new Error(`Invalid range: ${rangeStr}`);
	}

	for (let i = start; i <= end; i += step) {
		values.add(i);
	}
}

function parseRange(expr: string, min: number, max: number, values: Set<number>) {
	const parts = expr.split("-").map(n => Number.parseInt(n, 10));
	const start = parts[0];
	const end = parts[1];

	if (Number.isNaN(start) || Number.isNaN(end) || start < min || end > max || start > end) {
		throw new Error(`Invalid range: ${expr}`);
	}

	for (let i = start; i <= end; i++) {
		values.add(i);
	}
}

function parseSingle(expr: string, min: number, max: number, values: Set<number>) {
	const value = Number.parseInt(expr, 10);

	if (Number.isNaN(value) || value < min || value > max) {
		throw new Error(`Value out of bounds: ${expr}`);
	}

	values.add(value);
}

function normalizeDays(days: number[]): number[] {
	const normalized = days.map(d => d === 7 ? 0 : d);
	return [...new Set(normalized)].sort((a, b) => a - b);
}

function range(start: number, end: number): number[] {
	const result = [];
	for (let i = start; i <= end; i++) {
		result.push(i);
	}
	return result;
}