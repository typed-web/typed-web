import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export function useField<T, const P extends TuplePaths<T>>(store: FormStore<T>, path: P) {
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

  return useMemo(() => ({ name: pathKey, value, setValue }), [pathKey, value, setValue]);
}
