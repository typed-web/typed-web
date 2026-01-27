import type { FlatObject, NestedObject } from "./types.ts";

/**
 * Converts a nested structure object to a flat structure object.
 * Recursively walks the nested structure and creates path strings.
 *
 * @param nestedStructure - Nested structure object with hierarchical structure
 * @returns Flat structure object with string paths as keys
 *
 * @example
 * const nested = {
 *   user: { name: "John" },
 *   addresses: [{ city: "San Francisco" }]
 * };
 * const flat = nestedObjectToFlatObject(nested);
 * // {
 * //   "user.name": "John",
 * //   "addresses[0].city": "San Francisco"
 * // }
 */
export function nestedObjectToFlatObject<T = unknown, V = unknown>(
  nestedStructure: NestedObject<T>,
): FlatObject<V> {
  const result: FlatObject<V> = {};

  function walk(obj: unknown, currentPath: string) {
    if (typeof obj !== "object" || obj === null) {
      // Leaf node - this is a value
      result[currentPath] = obj as V;
      return;
    }

    if (Array.isArray(obj)) {
      // Handle arrays
      obj.forEach((item, index) => {
        const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
        walk(item, newPath);
      });
    } else {
      // Handle objects
      for (const [key, value] of Object.entries(obj)) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        walk(value, newPath);
      }
    }
  }

  walk(nestedStructure, "");

  return result;
}
