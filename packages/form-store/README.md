# @typed-web/form-store

Framework-agnostic form state management with type-safe paths and reactive updates.

## Installation

```bash
npm install @typed-web/form-store
```

## Exports

- `createFormStore` - Create a form store instance
- `FormStore` - TypeScript type for store
- `TuplePaths`, `TuplePathValue` - TypeScript utility types

## Usage

```typescript
import { createFormStore } from "@typed-web/form-store";

type User = {
  name: string;
  email: string;
  address: {
    city: string;
    state: string;
  };
};

const store = createFormStore<User>({
  name: "",
  email: "",
  address: {
    city: "",
    state: "",
  },
});

// Type-safe path access
store.set(["address", "city"], "San Francisco");
const city = store.get(["address", "city"]);

// Subscribe to changes
const unsubscribe = store.subscribe(["address", "city"], (value) => {
  console.log("City changed:", value);
});

// Batch updates
store.batch(() => {
  store.set(["name"], "John");
  store.set(["email"], "john@example.com");
});
```

## License

MIT
