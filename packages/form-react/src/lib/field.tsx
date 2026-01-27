import { useField } from "./use-field";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export type FieldProps<T, P extends TuplePaths<T>> = {
  children: (field: {
    name: string;
    value: TuplePathValue<T, P>;
    setValue: (val: TuplePathValue<T, P>) => void;
  }) => React.ReactNode;
  path: P;
  store: FormStore<T>;
};

export function Field<T, P extends TuplePaths<T>>(props: FieldProps<T, P>) {
  const { children, path, store } = props;

  const result = useField(store, path);

  return children(result);
}
