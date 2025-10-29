import { stringToPathArray } from "./string-to-path-array.ts";

/**
 * Sets a value at a specific path within an object, creating nested objects/arrays as needed.
 * The path is parsed using dot notation and bracket notation to navigate through the object structure.
 * Missing intermediate objects are automatically created as objects or arrays based on the next segment type.
 *
 * @param object - The target object to modify (will be mutated)
 * @param path - The path string indicating where to set the value (e.g., "user.profile[0].name")
 * @param value - The value to set at the specified path
 * @returns The modified input object (same reference, mutated)
 *
 * @example
 * const obj = {};
 * setPath(obj, "user.profile.name", "John");
 * // obj becomes { user: { profile: { name: "John" } } }
 *
 * @example
 * const obj = {};
 * setPath(obj, "users[0].name", "Alice");
 * // obj becomes { users: [{ name: "Alice" }] }
 *
 * @example
 * const obj = {};
 * setPath(obj, "config[database][host]", "localhost");
 * // obj becomes { config: { database: { host: "localhost" } } }
 */
export function setPath<T extends Record<string | number, unknown>>(
  object: T,
  path: string,
  value: unknown,
): T {
  const pathSegments = stringToPathArray(path);

  // Handle empty path - cannot set value on empty path.
  if (pathSegments.length === 0) {
    throw new Error("Cannot set value on empty path");
  }

  // Extract leading segments (all but last) and the final segment.
  const leadingSegments = pathSegments.slice(0, -1);
  const lastSegment = pathSegments[pathSegments.length - 1];

  // Type guard for lastSegment.
  if (lastSegment === undefined) {
    throw new Error("Invalid path: last segment is undefined");
  }

  // Navigate through the object, creating intermediate objects/arrays as needed.
  let currentObject: Record<string | number, unknown> = object;

  for (let i = 0; i < leadingSegments.length; i++) {
    const currentSegment = leadingSegments[i];

    // Type guard for currentSegment.
    if (currentSegment === undefined) {
      throw new Error(`Invalid path: segment at index ${i} is undefined`);
    }

    // If the current property doesn't exist, create it.
    if (!(currentSegment in currentObject)) {
      // Determine the next segment to decide whether to create an object or array.
      const nextSegment = leadingSegments[i + 1] ?? lastSegment;
      // Create array if next segment is a number, otherwise create object.
      currentObject[currentSegment] = typeof nextSegment === "number" ? [] : {};
    }

    // Move deeper into the structure.
    const nextValue = currentObject[currentSegment];

    // Type guard to ensure we have an object-like structure to navigate into.
    if (typeof nextValue !== "object" || nextValue === null) {
      throw new Error(
        `Cannot navigate through path: expected object at segment "${currentSegment}", got ${typeof nextValue}`,
      );
    }

    currentObject = nextValue as Record<string | number, unknown>;
  }

  // Set the final value.
  currentObject[lastSegment] = value;

  return object;
}
