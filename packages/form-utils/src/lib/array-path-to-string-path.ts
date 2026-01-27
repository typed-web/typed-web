/**
 * Convert array path to string format.
 * Examples: ["user", "name"] -> "user.name", ["items", 0] -> "items[0]"
 *
 * @param path - Array of path segments (strings, numbers, or symbols)
 * @returns String path with dot notation for object properties and bracket notation for array indices
 *
 * @example
 * arrayPathToStringPath(["user", "name"]) // "user.name"
 * arrayPathToStringPath(["items", 0]) // "items[0]"
 * arrayPathToStringPath(["addresses", 0, "city"]) // "addresses[0].city"
 * arrayPathToStringPath([]) // ""
 */
export function arrayPathToStringPath(path: Array<PropertyKey>): string {
  return path.reduce((str: string, item) => {
    if (typeof item === "symbol") {
      return str + (str === "" ? "" : ".") + item.toString();
    }
    if (typeof item === "number" || !Number.isNaN(Number(item))) {
      return str + "[" + item + "]";
    }
    return str + (str === "" ? "" : ".") + item;
  }, "");
}
