import { setValueAtPath } from "./set-value-at-path.ts";
import type { FlatObject, NestedObject } from "./types.ts";

/**
 * Converts a flat structure object to a nested structure object.
 * Uses path strings like "user.name" or "addresses[0].city" to create nested structure.
 *
 * @param flatStructure - Flat structure object with string paths as keys
 * @returns Nested structure object with hierarchical structure
 *
 * @example
 * const flat = {
 *   "user.name": "John",
 *   "addresses[0].city": "San Francisco"
 * };
 * const nested = flatObjectToNestedObject(flat);
 * // {
 * //   user: { name: "John" },
 * //   addresses: [{ city: "San Francisco" }]
 * // }
 */
export function flatObjectToNestedObject<T = unknown, V = unknown>(
  flatStructure: FlatObject<V>,
): NestedObject<T> {
  const result = {} as Record<string | number, unknown>;

  for (const [path, value] of Object.entries(flatStructure)) {
    setValueAtPath(result, path, value);
  }

  return result as NestedObject<T>;
}
