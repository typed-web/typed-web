import { setValueAtPath } from "./set-value-at-path.ts";

/**
 * Transforms flat FormData/URLSearchParams entries into a nested object structure.
 * Handles dot notation (e.g., "address.street") and bracket notation (e.g., "items[0].name").
 * Multiple values for the same key are automatically grouped into arrays.
 *
 * @param formData - Iterable of key-value pairs (FormData or URLSearchParams)
 * @returns Nested object with grouped values
 *
 * @example
 * const formData = new URLSearchParams([
 *   ["name", "John"],
 *   ["address.street", "123 Main St"],
 *   ["hobbies", "reading"],
 *   ["hobbies", "coding"]
 * ]);
 * const result = preprocessFormData(formData);
 * // Result: { name: "John", address: { street: "123 Main St" }, hobbies: ["reading", "coding"] }
 */
export function preprocessFormData(
  formData: Iterable<unknown>,
): Record<string, unknown> {
  const entries = [...formData] as Array<[string, unknown]>;

  // Group values by key (handling multiple values for same key)
  const map = new Map<string, Array<unknown>>();
  for (const [key, value] of entries) {
    if (map.has(key)) {
      map.get(key)?.push(value);
    } else {
      map.set(key, [value]);
    }
  }

  // Build nested object using setValueAtPath for dot/bracket notation
  const result = [...map].reduce<Record<string, unknown>>((acc, [key, list]) => {
    // Single value stays as single value, multiple values become array
    const value = list.length === 1 ? list[0] : list;
    return setValueAtPath(acc, key, value);
  }, {});

  return result;
}
