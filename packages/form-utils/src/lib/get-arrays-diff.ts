export interface GetArraysDiffArgs<T extends Record<string, unknown>> {
  before: Array<T>;
  after: Array<T>;
  key: (item: T) => PropertyKey;
  equals: (a: T, b: T) => boolean;
}

export function getArraysDiff<T extends Record<string, unknown>>(
  args: GetArraysDiffArgs<T>,
): {
  added: Array<T>;
  removed: Array<T>;
  modified: Array<{ before: T; after: T }>;
} {
  const { before, after, key, equals } = args;
  const isEqual = equals;

  // Build lookup maps/sets for efficient comparisons by key.
  const beforeMap = new Map(before.map((b) => [key(b), b]));
  const afterMap = new Map(after.map((a) => [key(a), a]));

  const added = after.filter((a) => !beforeMap.has(key(a)));
  const removed = before.filter((b) => !afterMap.has(key(b)));

  const modified = after
    .map((a): { before: T; after: T } | undefined => {
      const b = beforeMap.get(key(a));
      return b !== undefined && !isEqual(b, a) ? { before: b, after: a } : undefined;
    })
    .filter((x): x is { before: T; after: T } => x !== undefined);

  return { added, removed, modified };
}
