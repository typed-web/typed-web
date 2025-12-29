import * as v from "valibot";

/**
 * Checkbox issue interface.
 */
export interface CheckboxIssue extends v.BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: "schema";
  /**
   * The issue type.
   */
  readonly type: "checkbox";
  /**
   * The expected property.
   */
  readonly expected: "boolean";
}

/**
 * Configuration options for checkbox validation.
 */
export type CheckboxArgs = {
  /** The value that represents "checked" state. Defaults to "on" */
  trueValue?: string;
  /** Optional error message for validation failures */
  message?: v.ErrorMessage<CheckboxIssue>;
};

/**
 * Checkbox schema interface.
 */
export interface CheckboxSchema<TMessage extends v.ErrorMessage<CheckboxIssue> | undefined>
  extends v.BaseSchema<string | undefined, boolean, CheckboxIssue> {
  /**
   * The schema type.
   */
  readonly type: "checkbox";
  /**
   * The schema reference.
   */
  readonly reference: typeof checkbox;
  /**
   * The expected property.
   */
  readonly expects: "boolean";
  /**
   * The configuration.
   */
  readonly config: CheckboxArgs;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Schema for checkbox inputs that converts form values to boolean.
 * By default, treats "on" as true and undefined as false, but you can customize the true value.
 *
 * @param args - Configuration options for checkbox validation
 * @returns Checkbox schema that converts checkbox values to boolean
 *
 * @example
 * const defaultCheckbox = checkbox();
 * defaultCheckbox.parse("on");        // → true
 * defaultCheckbox.parse(undefined);   // → false
 *
 * const customValue = checkbox({ trueValue: "true" });
 * customValue.parse("true");          // → true
 * customValue.parse(undefined);       // → false
 * customValue.parse("false");         // → ValidationError
 */
export function checkbox(
  args?: CheckboxArgs,
): CheckboxSchema<v.ErrorMessage<CheckboxIssue> | undefined> {
  const config = args ?? {};
  const { trueValue = "on", message } = config;

  return {
    kind: "schema",
    type: "checkbox",
    reference: checkbox,
    expects: "boolean",
    async: false,
    config,
    message,
    get "~standard"() {
      return v._getStandardProps(this);
    },
    "~run"(dataset, config) {
      const input = dataset.value;

      // Transform checkbox value to boolean
      if (input === trueValue) {
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = true;
      } else if (input === undefined) {
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = false;
      } else {
        // Any other value is invalid
        v._addIssue(this, "type", dataset, config);
      }

      // @ts-expect-error
      return dataset as v.OutputDataset<boolean, CheckboxIssue>;
    },
  };
}
