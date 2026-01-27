/**
 * Flat structure format - values mapped by string paths
 * @example
 * {
 *   "user.name": "John",
 *   "addresses[0].city": "San Francisco",
 *   "addresses[0].state": "California"
 * }
 */
export type FlatObject<V = unknown> = Record<string, V>;

/**
 * Nested structure format - values in a nested object structure
 * @example
 * {
 *   user: { name: "John" },
 *   addresses: [
 *     { city: "San Francisco", state: "California" }
 *   ]
 * }
 */
export type NestedObject<T = unknown> = T extends object
  ? {
      [K in keyof T]?: T[K] extends object ? NestedObject<T[K]> : unknown;
    }
  : unknown;
