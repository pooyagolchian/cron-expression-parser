import { parseCronExpression } from "./index";

describe("parseCronExpression", () => {
	test("should parse the example expression correctly", () => {
		const result = parseCronExpression("*/15 0 1,2,3,15 */2 1-5 /usr/bin/find");
		expect(result).toEqual({
			minutes: [0, 15, 30, 45],
			hours: [0],
			days_of_month: [1, 2, 3, 15],
			months: [1, 3, 5, 7, 9, 11],
			days_of_week: [1, 2, 3, 4, 5],
			command: "/usr/bin/find",
		});
	});

	test("should handle wildcard (*) for all fields", () => {
		const result = parseCronExpression("* * * * * /bin/echo");
		expect(result.minutes).toEqual(Array.from({ length: 60 }, (_, i) => i));
		expect(result.hours).toEqual(Array.from({ length: 24 }, (_, i) => i));
		expect(result.days_of_month).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
		expect(result.months).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
		expect(result.days_of_week).toEqual([0, 1, 2, 3, 4, 5, 6]);
		expect(result.command).toBe("/bin/echo");
	});

	test("should handle single values", () => {
		const result = parseCronExpression("5 10 15 8 3 /usr/bin/script");
		expect(result).toEqual({
			minutes: [5],
			hours: [10],
			days_of_month: [15],
			months: [8],
			days_of_week: [3],
			command: "/usr/bin/script",
		});
	});

	test("should handle ranges", () => {
		const result = parseCronExpression("10-15 2-4 5-7 3-5 1-3 /bin/test");
		expect(result).toEqual({
			minutes: [10, 11, 12, 13, 14, 15],
			hours: [2, 3, 4],
			days_of_month: [5, 6, 7],
			months: [3, 4, 5],
			days_of_week: [1, 2, 3],
			command: "/bin/test",
		});
	});

	test("should handle step values with wildcard", () => {
		const result = parseCronExpression("*/5 */2 */10 */3 * /bin/cmd");
		expect(result.minutes).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
		expect(result.hours).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
		expect(result.days_of_month).toEqual([1, 11, 21, 31]);
		expect(result.months).toEqual([1, 4, 7, 10]);
		expect(result.command).toBe("/bin/cmd");
	});

	test("should handle step values with range", () => {
		const result = parseCronExpression("10-30/5 2-10/2 5-20/3 1-6/2 1-5/2 /bin/script");
		expect(result).toEqual({
			minutes: [10, 15, 20, 25, 30],
			hours: [2, 4, 6, 8, 10],
			days_of_month: [5, 8, 11, 14, 17, 20],
			months: [1, 3, 5],
			days_of_week: [1, 3, 5],
			command: "/bin/script",
		});
	});

	test("should handle comma-separated lists", () => {
		const result = parseCronExpression("5,10,15 2,4,6,8 1,15,31 1,6,12 0,3,6 /bin/run");
		expect(result).toEqual({
			minutes: [5, 10, 15],
			hours: [2, 4, 6, 8],
			days_of_month: [1, 15, 31],
			months: [1, 6, 12],
			days_of_week: [0, 3, 6],
			command: "/bin/run",
		});
	});

	test("should handle mixed expressions", () => {
		const result = parseCronExpression("5,10-15,30 */4,23 1-5,10,20-25 * 1-3,5 /complex/cmd");
		expect(result).toEqual({
			minutes: [5, 10, 11, 12, 13, 14, 15, 30],
			hours: [0, 4, 8, 12, 16, 20, 23],
			days_of_month: [1, 2, 3, 4, 5, 10, 20, 21, 22, 23, 24, 25],
			months: Array.from({ length: 12 }, (_, i) => i + 1),
			days_of_week: [1, 2, 3, 5],
			command: "/complex/cmd",
		});
	});

	test("should handle commands with spaces", () => {
		const result = parseCronExpression('0 0 * * * /usr/bin/find /home -name "*.log" -delete');
		expect(result.command).toBe('/usr/bin/find /home -name "*.log" -delete');
	});

	test("should handle day of week 7 as Sunday (0)", () => {
		const result = parseCronExpression("0 0 * * 7 /bin/sunday");
		expect(result.days_of_week).toEqual([0]);
	});

	test("should handle both 0 and 7 for Sunday", () => {
		const result = parseCronExpression("0 0 * * 0,7 /bin/sunday");
		expect(result.days_of_week).toEqual([0]);
	});

	test("should throw error for invalid cron expression", () => {
		expect(() => parseCronExpression("0 0 * *")).toThrow("Invalid cron expression");
	});

	test("should throw error for invalid range", () => {
		expect(() => parseCronExpression("60-70 * * * * /bin/cmd")).toThrow();
	});

	test("should throw error for invalid step value", () => {
		expect(() => parseCronExpression("*/0 * * * * /bin/cmd")).toThrow("Invalid step value");
	});

	test("should handle zero values in appropriate fields", () => {
		const result = parseCronExpression("0 0 1 1 0 /bin/newyear");
		expect(result).toEqual({
			minutes: [0],
			hours: [0],
			days_of_month: [1],
			months: [1],
			days_of_week: [0],
			command: "/bin/newyear",
		});
	});

	test("should handle maximum values", () => {
		const result = parseCronExpression("59 23 31 12 6 /bin/max");
		expect(result).toEqual({
			minutes: [59],
			hours: [23],
			days_of_month: [31],
			months: [12],
			days_of_week: [6],
			command: "/bin/max",
		});
	});

	test("should properly sort values", () => {
		const result = parseCronExpression("30,10,45,5 20,5,15,10 25,5,15,10 10,3,7,1 5,1,3,0 /bin/sort");
		expect(result).toEqual({
			minutes: [5, 10, 30, 45],
			hours: [5, 10, 15, 20],
			days_of_month: [5, 10, 15, 25],
			months: [1, 3, 7, 10],
			days_of_week: [0, 1, 3, 5],
			command: "/bin/sort",
		});
	});

	test("should handle step values starting from specific number", () => {
		const result = parseCronExpression("10/5 * * * * /bin/cmd");
		expect(result.minutes).toEqual([10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
	});

	test("should remove duplicates", () => {
		const result = parseCronExpression("5,5,10,10,5 * * * * /bin/cmd");
		expect(result.minutes).toEqual([5, 10]);
	});

	test("should handle complex command with flags and arguments", () => {
		const result = parseCronExpression(
			"0 2 * * * /usr/bin/backup --verbose --output=/var/backups/$(date +\\%Y\\%m\\%d).tar.gz /home",
		);
		expect(result.command).toBe(
			"/usr/bin/backup --verbose --output=/var/backups/$(date +\\%Y\\%m\\%d).tar.gz /home",
		);
	});
});