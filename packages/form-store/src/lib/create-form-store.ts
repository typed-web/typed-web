type Primitive = string | number | boolean | null | undefined;

/**
 * Recursively builds all valid tuple-based paths in a given object.
 * Supports numeric indices for arrays.
 */
export type TuplePaths<T> = T extends Primitive
  ? []
  : T extends Array<infer U>
    ? [number] | [number, ...TuplePaths<U>]
    : {
        [K in keyof T]: [K] | [K, ...TuplePaths<T[K]>];
      }[keyof T];

/**
 * Resolves the value type at a given tuple path.
 */
export type TuplePathValue<T, P extends ReadonlyArray<unknown>> =
  P extends Array<unknown> // ensure P is a tuple
    ? P extends [infer K, ...infer Rest]
      ? K extends keyof T
        ? TuplePathValue<T[K], Extract<Rest, Array<unknown>>>
        : T extends Array<infer U>
          ? K extends number
            ? TuplePathValue<U, Extract<Rest, Array<unknown>>>
            : never
          : never
      : T
    : never;

export interface FormStore<T> {
  get: <P extends TuplePaths<T>>(path: P) => TuplePathValue<T, P>;
  set: <P extends TuplePaths<T>>(path: P, value: TuplePathValue<T, P>) => void;
  subscribe: <P extends TuplePaths<T>>(
    path: P,
    cb: (value: TuplePathValue<T, P>) => void,
  ) => () => void;
  reset: () => void;
  batch: (callback: () => void) => void;
  unsubscribeAll: () => void;
  array: {
    push: <P extends TuplePaths<T>>(path: P, value: TuplePathValue<T, [...P, number]>) => void;
    remove: <P extends TuplePaths<T>>(path: P, index: number) => void;
    insert: <P extends TuplePaths<T>>(
      path: P,
      index: number,
      value: TuplePathValue<T, [...P, number]>,
    ) => void;
    swap: <P extends TuplePaths<T>>(path: P, indexA: number, indexB: number) => void;
    move: <P extends TuplePaths<T>>(path: P, fromIndex: number, toIndex: number) => void;
    shift: <P extends TuplePaths<T>>(path: P) => void;
    pop: <P extends TuplePaths<T>>(path: P) => void;
    replace: <P extends TuplePaths<T>>(
      path: P,
      index: number,
      value: TuplePathValue<T, [...P, number]>,
    ) => void;
  };
}

export function createFormStore<T extends Record<string, unknown>>(initialState: T): FormStore<T> {
  type Path = TuplePaths<T>;

  let state: T = initialState;
  const subscribers = new Map<string, Set<(value: unknown) => void>>();

  let batching = false;
  const pendingNotifications = new Set<string>();

  function pathToKey(path: ReadonlyArray<string | number>) {
    return path.join(".");
  }

  function keyToPath(key: string): Path {
    return key.split(".").map((k) => (/^\d+$/.test(k) ? parseInt(k) : k)) as Path;
  }

  function get<P extends Path>(path: P): TuplePathValue<T, P> {
    return path.reduce(
      (acc, key) => (acc as Record<string | number, unknown>)?.[key],
      state as unknown,
    ) as TuplePathValue<T, P>;
  }

  function set<P extends Path>(path: P, value: TuplePathValue<T, P>) {
    state = setNested(state, path, value) as T;
    notify(path);
  }

  function reset() {
    state = initialState;
    for (const pathKey of subscribers.keys()) {
      const path = keyToPath(pathKey);
      subscribers.get(pathKey)?.forEach((cb) => cb(get(path)));
    }
  }

  function unsubscribeAll() {
    subscribers.clear();
  }

  function batch(callback: () => void) {
    batching = true;
    callback();
    batching = false;
    for (const pathKey of pendingNotifications) {
      notify(keyToPath(pathKey));
    }
    pendingNotifications.clear();
  }

  // Returns Record<string | number, unknown> for both arrays and objects.
  // Arrays aren't truly string-keyed, but the unified type lets setNested
  // treat all levels the same without separate type branches.
  function shallowCopy(value: unknown): Record<string | number, unknown> {
    return (
      Array.isArray(value) ? [...value] : { ...(value as Record<string, unknown>) }
    ) as Record<string | number, unknown>;
  }

  function setNested(
    obj: Record<string | number, unknown>,
    path: ReadonlyArray<string | number>,
    value: unknown,
  ): Record<string | number, unknown> {
    if (path.length === 0) {
      throw new Error("Invalid path");
    }

    // Shallow-copy the root so we never mutate the original state.
    const root = shallowCopy(obj);

    // Walk forward to the second-to-last segment, shallow-copying each
    // level and linking the copy into its already-copied parent.
    let current = root;
    for (let i = 0; i < path.length - 1; i++) {
      const pathSegment = path[i];
      if (pathSegment === undefined) {
        throw new Error("Invalid path");
      }
      // Shallow-copy the child before descending into it.
      const childCopy = shallowCopy(current[pathSegment]);
      // Assign the copy back so the parent references the new object.
      current[pathSegment] = childCopy;
      current = childCopy;
    }

    // Set the value at the final segment of the path.
    const lastPathSegment = path[path.length - 1];
    if (lastPathSegment === undefined) {
      throw new Error("Invalid path");
    }
    current[lastPathSegment] = value;

    return root;
  }

  function subscribe<P extends Path>(
    path: P,
    callback: (value: TuplePathValue<T, P>) => void,
  ): () => void {
    const key = pathToKey(path);
    let set = subscribers.get(key);
    if (set === undefined) {
      set = new Set();
      subscribers.set(key, set);
    }
    set.add(callback as (v: unknown) => void);

    return () => {
      set.delete(callback as (v: unknown) => void);
      if (set.size === 0) {
        subscribers.delete(key);
      }
    };
  }

  // Adds a path key to pending batch notifications while deduplicating
  // ancestor/descendant relationships. Since notify() cascades to all
  // child subscribers, we only need to keep the highest ancestor.
  function addPendingNotification(key: string) {
    const prefix = key + ".";

    // If an ancestor is already pending, it will cascade to this path — skip.
    // Example: "a" is pending, then "a.b" arrives
    //   → skip "a.b" because notify("a") will already cascade to "a.b" subscribers
    for (const existing of pendingNotifications) {
      if (key.startsWith(existing + ".")) {
        return;
      }
    }

    // Remove any descendants — this ancestor covers them.
    // Example: "a.b" is pending, then "a" arrives
    //   → remove "a.b", add "a" because notify("a") covers "a.b" and all other "a.*"
    for (const existing of pendingNotifications) {
      if (existing.startsWith(prefix)) {
        pendingNotifications.delete(existing);
      }
    }

    pendingNotifications.add(key);
  }

  function notify<P extends Path>(path: P) {
    const key = pathToKey(path);
    if (batching) {
      addPendingNotification(key);
      return;
    }

    subscribers.get(key)?.forEach((cb) => {
      (cb as (v: TuplePathValue<T, P>) => void)(get(path));
    });

    const prefix = key + ".";
    for (const childKey of subscribers.keys()) {
      if (childKey.startsWith(prefix)) {
        const childPath = keyToPath(childKey);
        subscribers.get(childKey)?.forEach((cb) => {
          (cb as (v: unknown) => void)(get(childPath));
        });
      }
    }
  }

  // Array Helpers
  function push<P extends Path>(path: P, value: TuplePathValue<T, [...P, number]>) {
    const current = get(path);
    if (Array.isArray(current)) {
      set(path, [...current, value] as TuplePathValue<T, P>);
    }
  }

  function remove<P extends Path>(path: P, index: number) {
    const current = get(path);
    if (Array.isArray(current)) {
      set(path, [...current.slice(0, index), ...current.slice(index + 1)] as TuplePathValue<T, P>);
    }
  }

  function insert<P extends Path>(
    path: P,
    index: number,
    value: TuplePathValue<T, [...P, number]>,
  ) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    set(path, [...current.slice(0, index), value, ...current.slice(index)] as TuplePathValue<T, P>);
  }

  function swap<P extends Path>(path: P, indexA: number, indexB: number) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    if (indexA < 0 || indexA >= current.length || indexB < 0 || indexB >= current.length) {
      throw new Error("Index out of bounds");
    }
    const next = [...current];
    next[indexA] = current[indexB];
    next[indexB] = current[indexA];
    set(path, next as TuplePathValue<T, P>);
  }

  function move<P extends Path>(path: P, fromIndex: number, toIndex: number) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    const next = [...current];
    const item = next.splice(fromIndex, 1)[0];
    if (item === undefined) {
      throw new Error("Index out of bounds");
    }
    next.splice(toIndex, 0, item);
    set(path, next as TuplePathValue<T, P>);
  }

  function shift<P extends Path>(path: P) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    const rest = current.slice(1);
    set(path, rest as TuplePathValue<T, P>);
  }

  function pop<P extends Path>(path: P) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    set(path, current.slice(0, -1) as TuplePathValue<T, P>);
  }

  function replace<P extends Path>(
    path: P,
    index: number,
    value: TuplePathValue<T, [...P, number]>,
  ) {
    const current = get(path);
    if (!Array.isArray(current)) throw new Error("Value under path is not an array");
    if (index < 0 || index >= current.length) {
      throw new Error("Index out of bounds");
    }
    const next = [...current];
    next[index] = value as (typeof next)[number];
    set(path, next as TuplePathValue<T, P>);
  }

  return {
    get,
    set,
    reset,
    batch,
    subscribe,
    unsubscribeAll,
    array: {
      push,
      remove,
      insert,
      swap,
      move,
      shift,
      pop,
      replace,
    },
  };
}
