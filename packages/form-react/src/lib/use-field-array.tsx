import { useCallback, useSyncExternalStore } from "react";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export function useFieldArray<T, const P extends TuplePaths<T>>(store: FormStore<T>, path: P) {
  const subscribe = (callback: () => void) => store.subscribe(path, callback);
  const getSnapshot = () => store.get(path);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (nextValue: TuplePathValue<T, P>) => store.set(path, nextValue),
    [path, store],
  );

  return {
    name: path.join("."),
    value,
    setValue,
    push: (value: TuplePathValue<T, [...P, number]>) => store.array.push(path, value),
    remove: (index: number) => store.array.remove(path, index),
    insert: (index: number, value: TuplePathValue<T, [...P, number]>) =>
      store.array.insert(path, index, value),
    swap: (indexA: number, indexB: number) => store.array.swap(path, indexA, indexB),
    move: (fromIndex: number, toIndex: number) => store.array.move(path, fromIndex, toIndex),
    unshift: () => store.array.unshift(path),
    pop: () => store.array.pop(path),
    replace: (index: number, value: TuplePathValue<T, [...P, number]>) =>
      store.array.replace(path, index, value),
  };
}
