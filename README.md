# Campus Life Planner

## Overview

Campus Life Planner is a client-side web application that helps students organize academic and extracurricular responsibilities. Users can create, edit, search, sort, and manage tasks while tracking deadlines, durations, and activity tags. The application stores data locally in the browser and provides import/export functionality for backup and portability.

---

## Features

### Task Management
- Add new tasks with:
  - Title
  - Due Date
  - Duration
  - Tag
- Edit existing tasks
- Delete tasks
- Cancel edit mode

### Dashboard
- Total task count
- Total recorded duration
- Most frequently used tag
- Last 7 days trend visualization
- Weekly target tracking

### Search & Filtering
- Regex-based search
- Case-sensitive search option
- Tag filtering using:
  ```
  @tag:TagName
  ```
- Highlighted search matches
- Search result statistics

### Sorting
- Title (A → Z)
- Title (Z → A)
- Due Date (Newest First)
- Due Date (Oldest First)
- Duration (Ascending)
- Duration (Descending)

### Data Persistence
- LocalStorage-based storage
- Automatic schema migration
- Import JSON records
- Export JSON records

### Units System
- Minutes mode
- Hours mode
- Automatic duration conversion
- Dynamic unit labels

### Validation
- Form validation
- Record validation during import
- Duplicate word detection
- Date and timestamp validation

---

## Setup Guide

### Requirements
- Modern web browser with ES Module support
- JavaScript enabled

### Installation

1. Extract the project folder.
2. Open the project directory.
3. Start a local web server.

Example:

```bash
python -m http.server 8000
```

4. Open:

```text
http://localhost:8000
```

5. Load `index.html`.

---

## Project Structure

```text
project/
│
├── index.html
├── seed.json
├── tests.html
│
├── scripts/
│   ├── app.js
│   ├── bundle.js
│   ├── search.js
│   ├── storage.js
│   ├── units.js
│   └── validators.js
│
└── styles/
    └── style.css
```

---

## Regex Catalog

### Title Validation

```regex
^\S(?:.*\S)?$
```

Purpose:
- Prevents leading spaces
- Prevents trailing spaces
- Requires non-empty title

Examples:

 `Math Assignment`


---

### Duration Validation

```regex
^(0|[1-9]\d*)(\.\d{1,2})?$
```

Purpose:
- Accepts positive integers
- Accepts decimals up to 2 places

Examples:

`90`

`2.5`



---

### Date Validation

```regex
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
```

Purpose:
- Validates YYYY-MM-DD format

Examples:

 `2026-06-20`


---

### Tag Validation

```regex
^[A-Za-z]+(?:[ -][A-Za-z]+)*$
```

Purpose:
- Allows letters
- Allows spaces
- Allows hyphens

Examples:

`Study`

`Self-Care`



---

### Duplicate Word Detection

```regex
\b(\w+)\s+\1\b
```

Flags:

```text
i
```

Purpose:
- Detects repeated consecutive words

Examples:

Detects: `the the meeting`


---

### ISO Timestamp Validation

```regex
^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$
```

Purpose:
- Validates ISO-8601 timestamps

Examples:

`2026-06-20T09:00:00.000Z`


---

### Search Regex

User-provided patterns are compiled dynamically:

```javascript
new RegExp(input, flags)
```

Examples:

```regex
study|exam
```

```regex
^Math
```

```regex
assignment$
```

---

## Keyboard Map

| Key | Action |
|------|---------|
| Tab | Move between controls |
| Shift + Tab | Move backward between controls |
| Enter | Submit form |
| Space | Activate focused button |
| Arrow Keys | Navigate select options |
| Ctrl + C | Copy exported JSON |
| Ctrl + V | Paste imported JSON content |
| Browser Shortcuts | Standard browser navigation |

### Skip Navigation

```text
Skip to Content
```

Allows keyboard users to bypass navigation and jump directly to main content.

---

## Accessibility Notes

### Semantic Structure
- Uses semantic HTML elements:
  - Header
  - Nav
  - Main
  - Section
  - Footer
  - Table

### ARIA Support
- `aria-label`
- `aria-labelledby`
- `aria-live`
- `role="status"`
- `role="alert"`
- `role="table"`
- `role="rowgroup"`
- `role="columnheader"`

### Screen Reader Support
- Live announcements for:
  - Search results
  - Status messages
  - Target progress

### Keyboard Accessibility
- Fully navigable with keyboard
- Skip link provided
- Form controls properly labeled

### Responsive Design
- Mobile-friendly layout
- Accessible table structure

---

## Testing Instructions

### Running Tests

Open:

```text
tests.html
```

in a browser.

The test runner executes assertions for:

- Validators
- Regex rules
- Search helpers
- Highlighting
- HTML escaping
- Unit conversions
- Record validation

### Tested Areas

#### Title Validation
- Valid titles
- Leading spaces
- Trailing spaces
- Empty values

#### Duration Validation
- Integers
- Decimals
- Invalid formats
- Negative values

#### Date Validation
- Correct date format
- Invalid month
- Invalid formats

#### Tag Validation
- Single-word tags
- Hyphenated tags
- Numeric rejection

#### Duplicate Detection
- Repeated words
- Normal sentences

#### ISO Timestamp Validation
- Valid timestamps
- Invalid timestamps

#### Record Validation
- Complete records
- Missing properties
- Invalid dates
- Invalid timestamps
- Incorrect update order

#### Search Functions
- Regex compilation
- Invalid regex handling
- Highlight rendering

#### Security Helpers
- HTML escaping

#### Unit Conversion
- Minutes to hours
- Hours to minutes
- Canonical conversions
- Duration formatting

### Expected Result

When all tests pass:

```text
PASS - ...
PASS - ...
PASS - ...

Summary:
All tests passed.
```

If a test fails:

```text
FAIL - ...
```

The failure message identifies the specific validation or function that did not behave as expected.

---

Watch this video for demo presentation: https://youtu.be/ohWpTF2fzzk