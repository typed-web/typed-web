import { objectFromPathEntries } from "./object-from-path-entries.ts";

/**
 * Transforms FormData, URLSearchParams, or plain objects into a nested object structure.
 * Handles dot notation (e.g., "address.street") and bracket notation (e.g., "items[0].name").
 * Multiple values for the same key are automatically grouped into arrays.
 *
 * @param data - FormData, URLSearchParams, or plain object to transform
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
 *
 * @example
 * const data = { name: "John", age: "30" };
 * const result = preprocessFormData(data);
 * // Result: { name: "John", age: "30" }
 */
export function preprocessFormData(
  data: FormData | URLSearchParams | Record<string, unknown>,
): Record<string, unknown> {
  // Check if data has entries method (FormData, URLSearchParams, Map, etc.)
  if ("entries" in data && typeof data.entries === "function") {
    return objectFromPathEntries([...data.entries()]);
  }
  // Plain object - use Object.entries
  return objectFromPathEntries(Object.entries(data));
}
