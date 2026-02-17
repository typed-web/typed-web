import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export function useFieldArray<T, const P extends TuplePaths<T>>(store: FormStore<T>, path: P) {
  const pathKey = path.join(".");

  const subscribe = useCallback(
    (callback: () => void) => store.subscribe(path, callback),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, pathKey],
  );

  const getSnapshot = useCallback(
    () => store.get(path),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, pathKey],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (nextValue: TuplePathValue<T, P>) => store.set(path, nextValue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, pathKey],
  );

  const arrayHelpers = useMemo(
    () => ({
      push: (value: TuplePathValue<T, [...P, number]>) => store.array.push(path, value),
      remove: (index: number) => store.array.remove(path, index),
      insert: (index: number, value: TuplePathValue<T, [...P, number]>) =>
        store.array.insert(path, index, value),
      swap: (indexA: number, indexB: number) => store.array.swap(path, indexA, indexB),
      move: (fromIndex: number, toIndex: number) => store.array.move(path, fromIndex, toIndex),
      shift: () => store.array.shift(path),
      pop: () => store.array.pop(path),
      replace: (index: number, value: TuplePathValue<T, [...P, number]>) =>
        store.array.replace(path, index, value),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, pathKey],
  );

  return useMemo(
    () => ({ name: pathKey, value, setValue, ...arrayHelpers }),
    [pathKey, value, setValue, arrayHelpers],
  );
}
