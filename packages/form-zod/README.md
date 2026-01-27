# @typed-web/form-zod

Convert Zod validation errors to flat or nested error objects.

## Installation

```bash
npm install @typed-web/form-zod zod
```

## Exports

- `zodErrorsToFlatObject` - Convert to flat error object
- `zodErrorsToNestedObject` - Convert to nested error object

## Usage

```typescript
import { z } from "zod";
import { zodErrorsToFlatObject } from "@typed-web/form-zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const result = schema.safeParse({ name: "", email: "invalid" });

if (!result.success) {
  const flat = zodErrorsToFlatObject(result.error);
  // { "name": "String must contain at least 1 character(s)", "email": "Invalid email" }
}
```

## License

MIT
