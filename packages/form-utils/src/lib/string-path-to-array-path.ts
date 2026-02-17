// Regular expression to match bracket notation: [key] followed by rest of path.
const BRACKET_NOTATION_REGEX = /^\[(.+?)\](.*)$/;

// Regular expression to match dot notation: optional dot followed by property
// name and rest of path.
const DOT_NOTATION_REGEX = /^\.?([^\.\[\]]+)(.*)$/;

// Regular expression to test if a string contains only digits
// (for array indices).
const NUMERIC_KEY_REGEX = /^\d+$/;

/**
 * Internal iterative parser for path segments.
 * Consumes the path string segment by segment, trying bracket notation first,
 * then dot notation. Returns null if any remaining portion cannot be parsed.
 *
 * @param path - The path string to parse
 * @returns Array of path segments, or null if parsing fails
 */
function parsePath(path: string): Array<string | number> | null {
  const result: Array<string | number> = [];
  let remaining = path;

  while (remaining.length > 0) {
    // Try bracket notation first (e.g. "[0]", "[key]"), fall back to dot notation (e.g. ".prop", "prop").
    const match = remaining.match(BRACKET_NOTATION_REGEX) ?? remaining.match(DOT_NOTATION_REGEX);

    // No pattern matched but we still have content — invalid path.
    if (match === null) {
      return null;
    }

    const [, key = "", rest = ""] = match;
    // Convert numeric keys to numbers, keep string keys as strings.
    result.push(NUMERIC_KEY_REGEX.test(key) ? Number(key) : key);
    remaining = rest;
  }

  return result;
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
 * stringPathToArrayPath("user.profile[0].name") // ["user", "profile", 0, "name"]
 * stringPathToArrayPath("users.0[name]") // ["users", 0, "name"]
 * stringPathToArrayPath("[0].title") // [0, "title"]
 * stringPathToArrayPath("") // []
 * stringPathToArrayPath("invalid[[path") // ["invalid[[path"] (invalid syntax)
 */
export function stringPathToArrayPath(path: string): Array<string | number> {
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
