# @typed-web/form-valibot

Convert Valibot validation issues to flat or nested error objects.

## Installation

```bash
npm install @typed-web/form-valibot valibot
```

## Exports

- `valibotIssuesToFlatObject` - Convert to flat error object
- `valibotIssuesToNestedObject` - Convert to nested error object

## Usage

```typescript
import * as v from "valibot";
import { valibotIssuesToFlatObject } from "@typed-web/form-valibot";

const schema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
});

const result = v.safeParse(schema, { name: "", email: "invalid" });

if (!result.success) {
  const flat = valibotIssuesToFlatObject(result.issues);
  // { "name": "Required", "email": "Invalid email" }
}
```

## License

MIT
