import { useFieldArray } from "./use-field-array";
import type { FormStore, TuplePathValue, TuplePaths } from "@typed-web/form-store";

export type FieldArrayProps<T, P extends TuplePaths<T>> = {
  children: (args: {
    name: string;
    value: TuplePathValue<T, P>;
    setValue: (value: TuplePathValue<T, P>) => void;
    push: (value: TuplePathValue<T, [...P, number]>) => void;
    remove: (index: number) => void;
    insert: (index: number, value: TuplePathValue<T, [...P, number]>) => void;
    swap: (indexA: number, indexB: number) => void;
    move: (fromIndex: number, toIndex: number) => void;
    unshift: () => void;
    pop: () => void;
    replace: (index: number, value: TuplePathValue<T, [...P, number]>) => void;
  }) => React.ReactNode;
  path: P;
  store: FormStore<T>;
};

export function FieldArray<T, P extends TuplePaths<T>>(props: FieldArrayProps<T, P>) {
  const { children, path, store } = props;

  const result = useFieldArray(store, path);

  return children(result);
}
