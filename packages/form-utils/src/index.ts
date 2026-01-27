// Types
export type { FlatObject, NestedObject } from "./lib/types.ts";

// Path utilities
export { setValueAtPath } from "./lib/set-value-at-path.ts";
export { stringPathToArrayPath } from "./lib/string-path-to-array-path.ts";
export { arrayPathToStringPath } from "./lib/array-path-to-string-path.ts";

// Structure conversion
export { flatObjectToNestedObject } from "./lib/flat-object-to-nested-object.ts";
export { nestedObjectToFlatObject } from "./lib/nested-object-to-flat-object.ts";

// Array utilities
export { getArraysDiff } from "./lib/get-arrays-diff.ts";
export type { GetArraysDiffArgs } from "./lib/get-arrays-diff.ts";
