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
    unshift: <P extends TuplePaths<T>>(path: P) => void;
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
      const path = pathKey.split(".").map((k) => (/^\d+$/.test(k) ? parseInt(k) : k)) as Path;
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
      const path = pathKey.split(".").map((k) => (/^\d+$/.test(k) ? parseInt(k) : k)) as Path;
      notify(path);
    }
    pendingNotifications.clear();
  }

  function setNested(obj: unknown, path: ReadonlyArray<string | number>, value: unknown): unknown {
    const [head, ...rest] = path;
    if (head === undefined) {
      throw new Error("Invalid path");
    }

    const copy = Array.isArray(obj)
      ? [...(obj as Array<unknown>)]
      : { ...(obj as Record<string | number, unknown>) };

    if (rest.length === 0) {
      (copy as Record<string | number, unknown>)[head] = value;
    } else {
      const child = (obj as Record<string | number, unknown>)[head];
      (copy as Record<string | number, unknown>)[head] = setNested(child, rest, value);
    }

    return copy;
  }

  function subscribe<P extends Path>(
    path: P,
    callback: (value: TuplePathValue<T, P>) => void,
  ): () => void {
    const key = pathToKey(path);
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    const set = subscribers.get(key);
    if (set === undefined) {
      throw new Error(`Failed to get subscribers for path: ${key}`);
    }
    set.add(callback as (v: unknown) => void);

    return () => {
      set.delete(callback as (v: unknown) => void);
      if (set.size === 0) {
        subscribers.delete(key);
      }
    };
  }

  function notify<P extends Path>(path: P) {
    const key = pathToKey(path);
    if (batching) {
      pendingNotifications.add(key);
      return;
    }

    subscribers.get(key)?.forEach((cb) => {
      (cb as (v: TuplePathValue<T, P>) => void)(get(path));
    });

    const prefix = key + ".";
    for (const childKey of subscribers.keys()) {
      if (childKey.startsWith(prefix)) {
        const childPath = childKey
          .split(".")
          .map((k) => (/^\d+$/.test(k) ? parseInt(k) : k)) as Path;
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
    const next = [...current];
    const tempA = next[indexA];
    const tempB = next[indexB];
    if (tempA === undefined || tempB === undefined) {
      throw new Error("Index out of bounds");
    }
    next[indexA] = tempB;
    next[indexB] = tempA;
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

  function unshift<P extends Path>(path: P) {
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
      unshift,
      pop,
      replace,
    },
  };
}
