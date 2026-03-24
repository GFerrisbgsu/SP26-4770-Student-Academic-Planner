# Testing with Vitest Guide

This guide explains how to write and run tests in this project using **Vitest** and **React Testing Library**.


## 🧪 What is Vitest?

**Vitest** is a testing framework built specifically for Vite projects. Think of it as:

- **Test runner** - Finds and executes your test files
- **Assertion library** - Provides functions like `expect()` to check values
- **Watch mode** - Re-runs tests automatically when you save files

### Why Vitest instead of Jest?

| Feature | Vitest | Jest |
|---------|--------|------|
| Vite integration | Native | Requires config |
| Speed | Faster | Slower |
| Configuration | Shared with Vite | Separate |
| ES Modules | Native support | Limited |

---

## 📄 Project Setup

### Configuration in [vite.config.ts](../vite.config.ts)

```typescript
/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  // ... other config
  test: {
    globals: true,           // Use describe/it/expect without imports
    environment: "jsdom",    // Simulate browser environment
    setupFiles: ["./app/test/setup.ts"],  // Run before each test file
    include: ["app/**/*.test.{ts,tsx}"],  // Which files are tests
  },
});
```

**What each option does:**

| Option | Purpose |
|--------|---------|
| `globals: true` | Lets you use `describe`, `it`, `expect` without importing them |
| `environment: "jsdom"` | Simulates a browser so you can test DOM elements |
| `setupFiles` | Code that runs before your tests (like importing jest-dom) |
| `include` | Pattern matching which files contain tests |

### Setup File: [app/test/setup.ts](../app/test/setup.ts)

```typescript
import "@testing-library/jest-dom";
```

This imports **jest-dom** matchers that let you write assertions like:
- `expect(element).toBeInTheDocument()`
- `expect(button).toBeDisabled()`
- `expect(input).toHaveValue("hello")`

---

## 🚀 Running Tests

### Available Commands

```bash
npm run test          # Watch mode - reruns on file changes
npm run test:run      # Single run - good for CI/CD
npm run test:ui       # Visual UI in browser
npm run test:coverage # Generate coverage report
```

### What you'll see:

```
 ✓ app/utils/generateEvents.test.ts (5 tests) 11ms
   ✓ generateEventsForMonth (3)
     ✓ generates events for enrolled courses 3ms
     ✓ events have correct structure 1ms
     ✓ generates events only for days matching schedule 3ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

- ✓ = test passed
- ✗ = test failed (you'll see error details)

---

## 📝 Writing Your First Test

### Step 1: Create a Test File

Place test files **next to the code they test** with `.test.ts` or `.test.tsx` extension:

```
app/utils/
├── generateEvents.ts        ← Source file
└── generateEvents.test.ts   ← Test file

app/components/
├── Calendar.tsx             ← Component
└── Calendar.test.tsx        ← Component test
```

### Step 2: Basic Test Structure

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./myFile";

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction();
    expect(result).toBe("expected");
  });
});
```

**Breaking it down:**

| Part | Purpose |
|------|---------|
| `describe("name", () => {})` | Groups related tests together |
| `it("description", () => {})` | Defines a single test case |
| `expect(value)` | Creates an assertion to check |
| `.toBe(expected)` | The matcher - checks if values are equal |

---

## ✅ Common Assertions (Matchers)

### Basic Matchers

```typescript
// Exact equality
expect(result).toBe(42);
expect(name).toBe("John");

// Deep equality (for objects/arrays)
expect(user).toEqual({ name: "John", age: 25 });
expect(list).toEqual([1, 2, 3]);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(count).toBeGreaterThan(5);
expect(count).toBeLessThan(10);
expect(count).toBeGreaterThanOrEqual(5);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain("item");

// Strings
expect(message).toMatch(/hello/i);  // regex
expect(message).toContain("hello");

// Objects
expect(obj).toHaveProperty("name");
expect(obj).toHaveProperty("user.email", "test@example.com");
```

### DOM Matchers (from jest-dom)

```typescript
// Element presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toBeEnabled();

// Content
expect(element).toHaveTextContent("Hello");
expect(input).toHaveValue("typed text");

// Classes and attributes
expect(element).toHaveClass("active");
expect(element).toHaveAttribute("href", "/home");
```

---

## 🧩 Real Example from This Project

Here's the actual test file [app/utils/generateEvents.test.ts](../app/utils/generateEvents.test.ts):

```typescript
import { describe, it, expect } from "vitest";
import { generateEventsForMonth, getAllEventsForMonth } from "./generateEvents";

describe("generateEventsForMonth", () => {
  it("generates events for enrolled courses", () => {
    const events = generateEventsForMonth(2026, 0); // January 2026

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("id");
    expect(events[0]).toHaveProperty("title");
    expect(events[0]).toHaveProperty("date");
    expect(events[0]).toHaveProperty("tag");
  });

  it("events have correct structure", () => {
    const events = generateEventsForMonth(2026, 0);
    const firstEvent = events[0];

    expect(firstEvent.type).toBe("class");
    expect(firstEvent.tag).toBe("school");
    expect(typeof firstEvent.startTime).toBe("number");
    expect(typeof firstEvent.endTime).toBe("number");
  });
});
```

**What this tests:**
1. The function returns events (not an empty array)
2. Each event has the required properties
3. Events have the correct types and values

---

## 🎭 Testing React Components

For testing React components, use **React Testing Library**:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();  // Create a mock function
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText("Click me"));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Key Testing Library Functions

| Function | Purpose |
|----------|---------|
| `render(<Component />)` | Renders component to virtual DOM |
| `screen.getByText("...")` | Find element by text content |
| `screen.getByRole("button")` | Find by accessibility role |
| `screen.queryByText("...")` | Find element or return null (no error) |
| `userEvent.click(element)` | Simulate user clicking |
| `userEvent.type(input, "text")` | Simulate user typing |

---

## 🔍 Debugging Tests

### When a test fails:

1. **Read the error message** - It usually tells you exactly what's wrong
2. **Use `screen.debug()`** - Prints the current DOM to console

```typescript
it("shows the title", () => {
  render(<MyComponent />);
  
  screen.debug();  // Prints HTML to console
  
  expect(screen.getByText("Title")).toBeInTheDocument();
});
```

### Run a single test file:

```bash
npm run test -- app/utils/generateEvents.test.ts
```

### Run tests matching a pattern:

```bash
npm run test -- --grep "generates events"
```

---

## 📚 Test File Naming Conventions

| Pattern | Example | When to use |
|---------|---------|-------------|
| `*.test.ts` | `utils.test.ts` | Utility function tests |
| `*.test.tsx` | `Button.test.tsx` | React component tests |
| `*.spec.ts` | `api.spec.ts` | Alternative naming (both work) |

---

## 🎯 What Should You Test?

### Good things to test:
- ✅ Utility functions with clear inputs/outputs
- ✅ Component rendering with different props
- ✅ User interactions (clicks, form submissions)
- ✅ Edge cases (empty arrays, null values)
- ✅ Error states

### Don't over-test:
- ❌ Implementation details (internal state)
- ❌ Third-party library code
- ❌ Simple pass-through components

---

## 📖 Key Takeaways

1. **Vitest** is the test runner - it finds and executes test files
2. **Test files** go next to source files with `.test.ts` or `.test.tsx` extension
3. Use **`describe`** to group tests and **`it`** for individual test cases
4. Use **`expect()`** with matchers like `.toBe()`, `.toEqual()`, `.toBeInTheDocument()`
5. Run **`npm run test`** in watch mode during development

---

## 📖 Next Steps

- Try adding a test to an existing utility function
- Write a component test using React Testing Library
- Check out the [Vitest documentation](https://vitest.dev/)
- Check out the [Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/)
