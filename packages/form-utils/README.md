# @typed-web/form-utils

Utilities for form handling: path conversion, object flattening, and array diffing.

## Installation

```bash
npm install @typed-web/form-utils
```

## Exports

### Object Conversion
- `flatObjectToNestedObject` - Convert flat objects to nested structures
- `nestedObjectToFlatObject` - Convert nested objects to flat structures

### Path Utilities
- `setValueAtPath` - Set value at path in object
- `stringPathToArrayPath` - Convert string path to array
- `arrayPathToStringPath` - Convert array path to string

### Array Utilities
- `getArraysDiff` - Compute differences between arrays

### Types
- `FlatObject`, `NestedObject`, `GetArraysDiffArgs`

## Usage

```typescript
import {
  flatObjectToNestedObject,
  stringPathToArrayPath,
  setValueAtPath,
} from "@typed-web/form-utils";

// Convert flat to nested
const nested = flatObjectToNestedObject({
  "user.name": "John",
  "addresses[0].city": "NYC",
});
// { user: { name: "John" }, addresses: [{ city: "NYC" }] }

// Parse path
const path = stringPathToArrayPath("user.addresses[0].city");
// ["user", "addresses", 0, "city"]

// Set value at path
const obj = {};
setValueAtPath(obj, ["user", "name"], "John");
// { user: { name: "John" } }
```

## License

MIT
