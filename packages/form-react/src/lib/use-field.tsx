import { useCallback, useSyncExternalStore } from "react";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export function useField<T, const P extends TuplePaths<T>>(store: FormStore<T>, path: P) {
  const subscribe = (callback: () => void) => store.subscribe(path, callback);
  const getSnapshot = () => store.get(path);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (nextValue: TuplePathValue<T, P>) => store.set(path, nextValue),
    [path, store],
  );

  return { name: path.join("."), value, setValue };
}
