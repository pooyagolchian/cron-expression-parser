import { parseCronExpression } from "./index";

console.log("Cron Expression Parser - Examples\n");
console.log("=".repeat(50));

const testCases = [
	{
		name: "Every 15 minutes during weekdays",
		expression: "*/15 0 1,2,3,15 */2 1-5 /usr/bin/find",
	},
	{
		name: "Daily backup at 2:30 AM",
		expression: "30 2 * * * /usr/bin/backup --daily",
	},
	{
		name: "Every 5 minutes during business hours",
		expression: "*/5 9-17 * * 1-5 /monitor/check-health",
	},
	{
		name: "Monthly report on the 1st at midnight",
		expression: "0 0 1 * * /usr/bin/generate-report",
	},
	{
		name: "Every Sunday at noon",
		expression: "0 12 * * 0 /scripts/weekly-cleanup.sh",
	},
	{
		name: "Complex schedule with mixed patterns",
		expression: "0,30 9,12,15 1-7,15,20-25 3,6,9,12 * /usr/bin/quarterly-task",
	},
	{
		name: "Every minute (stress test)",
		expression: '* * * * * /bin/echo "ping"',
	},
	{
		name: "Specific time: 5:15 PM on 15th of March",
		expression: "15 17 15 3 * /usr/bin/special-event",
	},
	{
		name: "Step values from specific start",
		expression: "10/5 * * * * /usr/bin/step-task",
	},
	{
		name: "Command with arguments and spaces",
		expression:
			"0 3 * * * /bin/bash -c \"find /var/log -name '*.log' -mtime +7 -delete\"",
	},
];

testCases.forEach((testCase, index) => {
	console.log(`\nExample ${index + 1}: ${testCase.name}`);
	console.log("-".repeat(50));
	console.log(`Expression: ${testCase.expression}`);

	try {
		const result = parseCronExpression(testCase.expression);
		console.log("\nParsed Result:");
		console.log(JSON.stringify(result, null, 2));

		console.log("\nSchedule Summary:");
		console.log(`- Minutes: ${formatValues(result.minutes, 60)}`);
		console.log(`- Hours: ${formatValues(result.hours, 24)}`);
		console.log(`- Days of Month: ${formatValues(result.days_of_month, 31)}`);
		console.log(
			`- Months: ${formatValues(result.months, 12, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}`,
		);
		console.log(
			`- Days of Week: ${formatValues(result.days_of_week, 7, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])}`,
		);
		console.log(`- Command: ${result.command}`);
	} catch (error) {
		console.log(
			`\nError: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	console.log("=".repeat(50));
});

console.log("\n\nError Handling Examples\n");
console.log("=".repeat(50));

const errorCases = [
	{
		name: "Too few fields",
		expression: "* * * *",
	},
	{
		name: "Invalid range",
		expression: "60-70 * * * * /bin/cmd",
	},
	{
		name: "Invalid step value",
		expression: "*/0 * * * * /bin/cmd",
	},
	{
		name: "Out of bounds value",
		expression: "0 25 * * * /bin/cmd",
	},
	{
		name: "Empty command",
		expression: "* * * * *",
	},
];

errorCases.forEach((errorCase, index) => {
	console.log(`\nError Example ${index + 1}: ${errorCase.name}`);
	console.log("-".repeat(50));
	console.log(`Expression: ${errorCase.expression}`);

	try {
		parseCronExpression(errorCase.expression);
		console.log("Unexpectedly succeeded!");
	} catch (error) {
		console.log(
			`Expected Error: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	console.log("=".repeat(50));
});

function formatValues(
	values: number[],
	max: number,
	labels?: string[],
): string {
	if (
		values.length === max ||
		(max === 31 && values.length === 31) ||
		(max === 60 && values.length === 60) ||
		(max === 24 && values.length === 24) ||
		(max === 12 && values.length === 12) ||
		(max === 7 && values.length === 7)
	) {
		return `Every ${labels ? labels[0].toLowerCase() : "value"}`;
	}

	if (values.length > 10) {
		const first = values
			.slice(0, 5)
			.map((v) => (labels ? labels[v - (labels.length === 7 ? 0 : 1)] : v))
			.join(", ");
		const last = values
			.slice(-2)
			.map((v) => (labels ? labels[v - (labels.length === 7 ? 0 : 1)] : v))
			.join(", ");
		return `${first}, ... ${last} (${values.length} total)`;
	}

	return values
		.map((v) => (labels ? labels[v - (labels.length === 7 ? 0 : 1)] : v))
		.join(", ");
}

console.log("\n✅ All examples completed!");
