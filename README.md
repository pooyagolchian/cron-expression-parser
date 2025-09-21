# Cron Expression Parser

A minimal, clean TypeScript package for parsing standard cron schedule expressions. This parser focuses on simplicity and maintainability while supporting the five standard cron fields plus a command.

## Features

- **Standard cron syntax support** - All five time fields (minute, hour, day of month, month, day of week)
- **Flexible field expressions**:
  - Wildcards (`*`)
  - Ranges (`1-5`)
  - Lists (`1,3,5`)
  - Steps (`*/15`, `10-30/5`)
  - Combined expressions (`1-5,10,20-25`)
- **Command parsing** - Extracts and preserves the command portion
- **Robust validation** - Clear error messages for invalid expressions
- **Zero dependencies** - Pure TypeScript implementation
- **Well-tested** - Comprehensive test suite with 100% coverage

## Installation

```bash
npm install cron-expression-parser
```

## Usage

```typescript
import { parseCronExpression } from "cron-expression-parser";

// Parse a cron expression
const result = parseCronExpression("*/15 0 1,15 * 1-5 /usr/bin/backup");

console.log(result);
// Output:
// {
//   minutes: [0, 15, 30, 45],
//   hours: [0],
//   days_of_month: [1, 15],
//   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//   days_of_week: [1, 2, 3, 4, 5],
//   command: "/usr/bin/backup"
// }
```

## API

### `parseCronExpression(cronString: string): CronExpression`

Parses a cron expression string and returns an object with expanded time fields.

**Parameters:**

- `cronString` - A valid cron expression with 5 time fields + command

**Returns:**

```typescript
interface CronExpression {
  minutes: number[]; // 0-59
  hours: number[]; // 0-23
  days_of_month: number[]; // 1-31
  months: number[]; // 1-12
  days_of_week: number[]; // 0-6 (0=Sunday)
  command: string;
}
```

## Test Examples

```javascript
// Every 15 minutes, at midnight, on specific days, odd months, weekdays
parseCronExpression("*/15 0 1,2,3,15 */2 1-5 /usr/bin/find");
// Result:
// {
//   minutes: [0, 15, 30, 45],
//   hours: [0],
//   days_of_month: [1, 2, 3, 15],
//   months: [1, 3, 5, 7, 9, 11],
//   days_of_week: [1, 2, 3, 4, 5],
//   command: "/usr/bin/find"
// }

// Every minute, every hour, every day
parseCronExpression("* * * * * /bin/echo 'hello'");
// Result: All possible values for each field

// At 5:30 AM on the 15th of every month, Monday through Friday
parseCronExpression("30 5 15 * 1-5 /scripts/report.sh");

// Every 5 minutes during business hours (9 AM - 5 PM), weekdays only
parseCronExpression("*/5 9-17 * * 1-5 /monitor/check");

// Complex expression with mixed patterns
parseCronExpression("0,30 9,12,15 1-7,15,20-25 3,6,9,12 * /usr/bin/quarterly");
```

### Edge Cases

```javascript
// Sunday can be represented as 0 or 7
parseCronExpression("0 0 * * 7 /backup"); // 7 is normalized to 0

// Commands with arguments and special characters
parseCronExpression("0 2 * * * /bin/bash -c 'echo $(date) >> /log/file.txt'");

// Step values from specific start points
parseCronExpression("10/5 * * * * /task"); // Minutes: 10,15,20,25,30,35,40,45,50,55
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm test:watch

# Generate coverage report
npm test:coverage
```

## Development

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev

# Run example scripts
npm run example
```

## Architecture & AI Usage

### Code Structure

The implementation follows a clean, functional approach:

1. **Main Parser** (`parseCronExpression`): Entry point that validates and delegates to field parsers
2. **Field Parser** (`parseField`): Orchestrates parsing of individual cron fields
3. **Specialized Parsers**: Handle specific patterns (ranges, steps, lists)
4. **Utilities**: Helper functions for normalization and range generation

### AI-Assisted Development

The following components were developed with AI assistance:

- **Initial architecture design** (src/index.ts:10-32): AI helped structure the main parsing function and error handling approach
- **Step parsing logic** (src/index.ts:54-82): AI provided the algorithm for handling step values with ranges
- **Day normalization** (src/index.ts:108-111): AI suggested the approach for handling Sunday as both 0 and 7
- **Test case generation** (src/index.test.ts): AI helped generate comprehensive test cases covering edge cases

All AI-generated code was reviewed, tested, and refined to ensure it met the project's simplicity and maintainability requirements.

## Design Principles

This parser adheres to three core principles:

1. **Simplicity**: Straightforward logic without over-engineering
2. **Cleanliness**: Clear function names, consistent patterns, minimal complexity
3. **Maintainability**: Well-structured, testable, easy to extend

## License

MIT

## Contributing

Contributions are welcome! Please ensure any changes maintain the project's focus on simplicity and include appropriate tests.
