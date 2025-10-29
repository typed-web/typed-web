// Regular expression to match bracket notation: [key] followed by rest of path.
const BRACKET_NOTATION_REGEX = /^\[(.+?)\](.*)$/;

// Regular expression to match dot notation: optional dot followed by property
// name and rest of path.
const DOT_NOTATION_REGEX = /^\.?([^\.\[\]]+)(.*)$/;

// Regular expression to test if a string contains only digits
// (for array indices).
const NUMERIC_KEY_REGEX = /^\d+$/;

/**
 * Internal recursive parser for path segments.
 * Returns null if the path contains invalid syntax that cannot be parsed.
 *
 * @param currentPath - The remaining path to parse
 * @returns Array of path segments, or null if parsing fails
 */
function parsePath(currentPath: string): Array<string | number> | null {
  // Base case: empty path
  if (currentPath.length === 0) {
    return [];
  }

  // Try to match bracket notation first, then dot notation.
  const bracketMatch = currentPath.match(BRACKET_NOTATION_REGEX);
  const dotMatch = currentPath.match(DOT_NOTATION_REGEX);

  if (bracketMatch) {
    const [, key = "", rest = ""] = bracketMatch;
    // Convert numeric keys to numbers, keep string keys as strings.
    const parsedKey = NUMERIC_KEY_REGEX.test(key) ? Number(key) : key;

    // Recursively process the rest of the path.
    const restResult = parsePath(rest);

    // If rest parsing failed (returned null), propagate failure
    if (restResult === null) {
      return null;
    }

    return [parsedKey, ...restResult];
  } else if (dotMatch) {
    const [, key = "", rest = ""] = dotMatch;
    // Convert numeric keys to numbers, keep string keys as strings.
    const parsedKey = NUMERIC_KEY_REGEX.test(key) ? Number(key) : key;

    // Recursively process the rest of the path.
    const restResult = parsePath(rest);

    // If rest parsing failed (returned null), propagate failure
    if (restResult === null) {
      return null;
    }

    return [parsedKey, ...restResult];
  }

  // No pattern matched but we still have content - invalid path
  // Return null to signal failure
  return null;
}

/**
 * Converts a string path to an array of path segments.
 * Supports both bracket notation (e.g., "[0]", "[key]") and dot notation (e.g., ".prop", "prop").
 * All numeric strings are converted to numbers regardless of notation type.
 * If the path contains invalid syntax, returns the entire path as a single segment.
 *
 * @param path - The string path to convert (e.g., "user.profile[0].name")
 * @returns Array of path segments where numeric strings become numbers
 *
 * @example
 * stringToPathArray("user.profile[0].name") // ["user", "profile", 0, "name"]
 * stringToPathArray("users.0[name]") // ["users", 0, "name"]
 * stringToPathArray("[0].title") // [0, "title"]
 * stringToPathArray("") // []
 * stringToPathArray("invalid[[path") // ["invalid[[path"] (invalid syntax)
 */
export function stringToPathArray(path: string): Array<string | number> {
  // Handle empty path.
  if (path.length === 0) {
    return [];
  }

  // Attempt to parse the path
  const result = parsePath(path);

  // If parsing failed, return the entire path as a single segment
  if (result === null) {
    return [path];
  }

  return result;
}
