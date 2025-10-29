# @typed-web/valibot-form-data

A set of [Valibot](https://valibot.dev/) validators for parsing and validating `FormData` and `URLSearchParams` objects. It's inspired by Zod's `zod-form-data` package but built with Valibot.

## Installation

```sh
npm install @typed-web/valibot-form-data valibot
```

```sh
pnpm add @typed-web/valibot-form-data valibot
```

```sh
yarn add @typed-web/valibot-form-data valibot
```

## Why?

Working with HTML forms in JavaScript can be tedious. FormData values are always strings (or Files), and you often need to:

- Convert empty strings to `undefined` for optional fields
- Coerce numeric strings to numbers
- Handle checkboxes that may or may not be present
- Process file uploads with empty file detection
- Deal with multiple values for the same field name
- Parse nested object structures from dot/bracket notation

This library provides a set of helpers that make these common tasks simple and type-safe.

## Features

- **Type-safe**: Full TypeScript support with proper type inference
- **Valibot-based**: Leverages Valibot's composable validation system
- **FormData & URLSearchParams**: Works with both web standard APIs
- **Empty string handling**: Automatically treats empty strings as `undefined`
- **Numeric coercion**: Converts string numbers to actual numbers
- **Checkbox support**: Handles checkbox on/off states
- **File uploads**: Treats empty files as `undefined`
- **Repeatable fields**: Handles multiple values for the same field name
- **Nested objects**: Parses dot notation (e.g., `address.street`), bracket notation (e.g., `items[0][name]`), and mixed notation into nested object structures

## Basic Usage

```typescript
import * as v from "valibot";
import { formData, text, numeric, checkbox } from "@typed-web/valibot-form-data";

const schema = formData({
  name: text(), // Required text field
  email: text(v.pipe(v.string(), v.email())), // Required email
  age: numeric(v.optional(v.number())), // Optional number
  subscribe: checkbox(), // Checkbox (true/false)
});

// Parse FormData from an HTML form
const form = document.querySelector("form");
const data = new FormData(form);
const result = v.parse(schema, data);
// → { name: "John", email: "john@example.com", age: 25, subscribe: true }
```

## API Reference

### `formData(shape)`

Main function for processing FormData or URLSearchParams into a structured object. Supports nested objects using `v.object()`.

```typescript
const schema = formData({
  name: text(),
  address: v.object({
    street: text(),
    city: text(),
  }),
});

// FormData input with dot notation:
// name=John&address.street=123 Main St&address.city=NYC
// Result: { name: "John", address: { street: "123 Main St", city: "NYC" } }
```

### `text(schema?)`

Schema for text input fields. Transforms empty strings to `undefined` before validation.

```typescript
// Required field
const required = text(); // or text(v.string())
text().parse(""); // → ValidationError
text().parse("Hello"); // → "Hello"

// Optional field
const optional = text(v.optional(v.string()));
optional.parse(""); // → undefined
optional.parse("Hello"); // → "Hello"

// With validation
const minLength = text(v.pipe(v.string(), v.minLength(3)));
minLength.parse("ab"); // → ValidationError
minLength.parse("abc"); // → "abc"
```

### `numeric(schema?)`

Schema for numeric input fields. Coerces numerical strings to numbers and transforms empty strings to `undefined`.

```typescript
// Required number
const required = numeric(); // or numeric(v.number())
numeric().parse(""); // → ValidationError
numeric().parse("42"); // → 42

// Optional number
const optional = numeric(v.optional(v.number()));
optional.parse(""); // → undefined
optional.parse("42"); // → 42

// With validation
const minValue = numeric(v.pipe(v.number(), v.minValue(13)));
minValue.parse("10"); // → ValidationError
minValue.parse("15"); // → 15
```

### `checkbox(args?)`

Schema for checkbox inputs. Converts form values to boolean.

```typescript
// Default: treats "on" as true
const defaultCheckbox = checkbox();
defaultCheckbox.parse("on"); // → true
defaultCheckbox.parse(undefined); // → false

// Custom true value
const customCheckbox = checkbox({ trueValue: "yes" });
customCheckbox.parse("yes"); // → true
customCheckbox.parse(undefined); // → false
```

### `file(schema?)`

Schema for file input fields. Transforms empty File objects to `undefined`.

```typescript
// Required file
const required = file(); // or file(v.instance(File))
file().parse(new File([], "empty.txt")); // → ValidationError
file().parse(new File(["data"], "file.txt")); // → File

// Optional file
const optional = file(v.optional(v.instance(File)));
optional.parse(new File([], "empty.txt")); // → undefined

// With validation (using Valibot's built-in validators)
const imageOnly = file(v.pipe(v.instance(File), v.mimeType(["image/png", "image/jpeg"])));
imageOnly.parse(new File(["data"], "file.txt")); // → ValidationError
```

### `repeatable(schema?)`

Preprocesses fields where multiple values may be present for the same field name. Always returns an array.

```typescript
const tags = repeatable(); // defaults to array of text()
tags.parse(["a", "b"]); // → ["a", "b"]
tags.parse("single"); // → ["single"]
tags.parse(undefined); // → []

// With minimum length requirement
const atLeastOne = repeatable(v.pipe(v.array(text()), v.minLength(1)));
atLeastOne.parse([]); // → ValidationError
atLeastOne.parse(["item"]); // → ["item"]
```

### `repeatableOfType(itemSchema)`

Convenience wrapper for `repeatable`. Pass the schema for individual items instead of the entire array.

```typescript
const numbers = repeatableOfType(numeric());
numbers.parse(["1", "2", "3"]); // → [1, 2, 3]
numbers.parse("42"); // → [42]
numbers.parse(undefined); // → []
```

## Advanced Examples

### Nested Objects

Use `v.object()` to define nested object structures. The form field names should use dot notation:

```typescript
const schema = formData({
  name: text(),
  address: v.object({
    street: text(),
    city: text(),
  }),
});

// HTML form:
// <input name="name" value="John" />
// <input name="address.street" value="123 Main St" />
// <input name="address.city" value="Anytown" />

// Result: { name: "John", address: { street: "123 Main St", city: "Anytown" } }
```

### Arrays of Objects

Use `v.array()` with `v.object()` for arrays of objects. The form field names can use dot notation with indices or bracket notation:

```typescript
const schema = formData({
  locations: v.array(
    v.object({
      country: text(),
      city: text(),
    })
  ),
});

// HTML form (dot notation):
// <input name="locations.0.country" value="USA" />
// <input name="locations.0.city" value="New York" />
// <input name="locations.1.country" value="Canada" />
// <input name="locations.1.city" value="Toronto" />

// Or using bracket notation:
// <input name="locations[0][country]" value="USA" />
// <input name="locations[0][city]" value="New York" />
// <input name="locations[1][country]" value="Canada" />
// <input name="locations[1][city]" value="Toronto" />

// Result: {
//   locations: [
//     { country: "USA", city: "New York" },
//     { country: "Canada", city: "Toronto" }
//   ]
// }
```

## Complex Example

```typescript
import * as v from "valibot";
import {
  formData,
  text,
  numeric,
  checkbox,
  file,
  repeatableOfType,
} from "@typed-web/valibot-form-data";

const userSchema = formData({
  // Basic fields
  name: text(),
  email: text(v.pipe(v.string(), v.email())),
  age: numeric(v.pipe(v.number(), v.minValue(18))),

  // Optional fields
  website: text(v.optional(v.pipe(v.string(), v.url()))),
  bio: text(v.optional(v.string())),

  // Checkbox
  acceptTerms: checkbox(),

  // File upload
  avatar: file(v.optional(v.instance(File))),

  // Nested object (form fields use dot notation: address.street, address.city, address.zip)
  address: v.object({
    street: text(),
    city: text(),
    zip: text(v.pipe(v.string(), v.regex(/^\d{5}$/))),
  }),

  // Multiple values (form fields: hobbies[], scores[])
  hobbies: repeatableOfType(text()),
  scores: repeatableOfType(numeric()),
});

// Usage with HTML form
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  try {
    const data = v.parse(userSchema, formData);
    console.log(data);
    // {
    //   name: "John Doe",
    //   email: "john@example.com",
    //   age: 25,
    //   website: "https://example.com",
    //   bio: undefined,
    //   acceptTerms: true,
    //   avatar: File { ... },
    //   address: {
    //     street: "123 Main St",
    //     city: "New York",
    //     zip: "10001"
    //   },
    //   hobbies: ["reading", "gaming"],
    //   scores: [95, 87, 92]
    // }
  } catch (error) {
    console.error("Validation failed:", error);
  }
});
```

## Usage with React Router / Remix

This library works great with React Router's Form component and Remix's action handlers:

```typescript
// app/routes/users.new.tsx
import { Form } from "react-router";
import type { Route } from "./+types/users.new";
import * as v from "valibot";
import { formData, text, numeric } from "@typed-web/valibot-form-data";

const userSchema = formData({
  name: text(),
  email: text(v.pipe(v.string(), v.email())),
  age: numeric(v.pipe(v.number(), v.minValue(18))),
});

export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();

  try {
    const user = v.parse(userSchema, data);
    // Save user to database
    return { success: true, user };
  } catch (error) {
    return { success: false, errors: error.issues };
  }
}

export default function NewUser() {
  return (
    <Form method="post">
      <input type="text" name="name" />
      <input type="email" name="email" />
      <input type="number" name="age" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

## Comparison with zod-form-data

If you're familiar with `zod-form-data`, here's a quick comparison:

| zod-form-data            | @typed-web/valibot-form-data |
| ------------------------ | ---------------------------- |
| `zfd.text()`             | `text()`                     |
| `zfd.numeric()`          | `numeric()`                  |
| `zfd.checkbox()`         | `checkbox()`                 |
| `zfd.file()`             | `file()`                     |
| `zfd.repeatable()`       | `repeatable()`               |
| `zfd.repeatableOfType()` | `repeatableOfType()`         |
| `zfd.formData({ ... })`  | `formData({ ... })`          |
| Based on Zod             | Based on Valibot             |

The API is intentionally similar to make migration easier.

## License

MIT - See [LICENSE](https://github.com/typed-web/typed-web/blob/main/LICENSE)
