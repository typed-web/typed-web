import { type FormStore, type TuplePaths, createFormStore } from "@typed-web/form-store";
import { useMemo } from "react";
import { Field, type FieldProps } from "./field";
import { FieldArray, type FieldArrayProps } from "./field-array";

export function useForm<T extends Record<string, unknown>>(initialState: T): UseFormResult<T> {
  const store = useMemo(() => createFormStore(initialState), [initialState]);

  return useMemo(
    () => ({
      store,
      Field: <P extends TuplePaths<T>>(props: Omit<FieldProps<T, P>, "store">) => (
        <Field store={store} {...props} />
      ),
      FieldArray: <P extends TuplePaths<T>>(props: Omit<FieldArrayProps<T, P>, "store">) => (
        <FieldArray store={store} {...props} />
      ),
    }),
    [store],
  );
}

export type UseFormResult<T extends Record<string, unknown>> = {
  store: FormStore<T>;
  Field: <P extends TuplePaths<T>>(props: Omit<FieldProps<T, P>, "store">) => React.ReactNode;
  FieldArray: <P extends TuplePaths<T>>(
    props: Omit<FieldArrayProps<T, P>, "store">,
  ) => React.ReactNode;
};
