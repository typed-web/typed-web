import * as v from "valibot";
import { setPath } from "./set-path.ts";

/**
 * Type guard that checks if a value is a plain object.
 * Used to detect when the input is already in object form (e.g., from JSON).
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Type guard that checks if a value implements the Iterable interface.
 * Used to validate that FormData or URLSearchParams can be processed.
 *
 * @param value - Value to check for iterability
 * @returns Type predicate indicating if value is iterable
 */
function isIterable<T = unknown>(value: unknown): value is Iterable<T> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === "function"
  );
}

/**
 * Transforms flat FormData entries into a nested object structure.
 * Handles dot notation (e.g., "address.street") and bracket notation (e.g., "items[0].name").
 * Multiple values for the same key are automatically grouped into arrays.
 *
 * @param formData - Iterable of key-value pairs (FormData or URLSearchParams)
 * @returns Nested object with grouped values
 *
 * @example
 * const formData = new URLSearchParams([
 *   ["name", "John"],
 *   ["address.street", "123 Main St"],
 *   ["hobbies", "reading"],
 *   ["hobbies", "coding"]
 * ]);
 * const result = preprocessFormData(formData);
 * // Result: { name: "John", address: { street: "123 Main St" }, hobbies: ["reading", "coding"] }
 */
export function preprocessFormData(formData: Iterable<unknown>) {
  const entries = [...formData] as Array<[string, unknown]>;
  // Group values by key (handling multiple values for same key)
  const map = new Map<string, Array<unknown>>();
  for (const [key, value] of entries) {
    if (map.has(key)) {
      map.get(key)?.push(value);
    } else {
      map.set(key, [value]);
    }
  }

  // Build nested object using setPath for dot/bracket notation
  const result = [...map].reduce((acc, [key, list]) => {
    // Single value stays as single value, multiple values become array
    const value = list.length === 1 ? list[0] : list;
    return setPath(acc, key, value);
  }, {});

  return result;
}

/**
 * FormData schema issue type.
 */
export interface FormDataIssue extends v.BaseIssue<unknown> {
  readonly kind: "schema";
  readonly type: "form_data";
  readonly expected: "FormData";
}

/**
 * FormData schema interface that matches Valibot's object schema structure.
 */
export interface FormDataSchema<
  TEntries extends v.ObjectEntries,
  TMessage extends v.ErrorMessage<FormDataIssue> | undefined,
> extends v.BaseSchema<
    Iterable<unknown>,
    v.InferOutput<v.ObjectSchema<TEntries, undefined>>,
    FormDataIssue | v.InferIssue<v.ObjectSchema<TEntries, undefined>>
  > {
  /**
   * The schema type.
   */
  readonly type: "form_data";
  /**
   * The schema reference.
   */
  readonly reference: typeof formData;
  /**
   * The expected property.
   */
  readonly expects: "FormData";
  /**
   * The entries schema.
   */
  readonly entries: TEntries;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Configuration options for formData schema.
 */
export type FormDataConfig = {
  /**
   * Whether to allow additional fields not defined in the schema.
   * - `false` (default): Uses v.object() - removes unknown entries
   * - `true`: Uses v.looseObject() - includes unknown entries
   */
  loose?: boolean;
  /**
   * Optional error message for validation failures.
   */
  message?: v.ErrorMessage<FormDataIssue>;
};

/**
 * Schema for processing FormData, URLSearchParams, or plain objects into a structured object.
 * This is the main function for parsing HTML form submissions or JSON-like data.
 *
 * The function performs several transformations:
 * 1. Accepts FormData, URLSearchParams, or plain objects
 * 2. For iterables: converts to array of [key, value] entries and groups multiple values
 * 3. For plain objects: uses them directly
 * 4. Uses setPath to create nested objects from dot/bracket notation keys (for iterables)
 * 5. Ensures all schema keys exist and validates the result against the provided schema
 *
 * @param entries - Valibot object entries defining the expected structure
 * @param config - Optional configuration for the schema
 * @returns FormData schema with exposed entries property
 *
 * @example
 * // With FormData
 * const schema = formData({
 *   name: text(),
 *   age: numeric(),
 *   "address.street": text(),
 *   "hobbies[]": repeatable(),
 * });
 *
 * const formData = new FormData();
 * formData.append("name", "John");
 * formData.append("age", "30");
 * formData.append("address.street", "123 Main St");
 * formData.append("hobbies[]", "reading");
 * formData.append("hobbies[]", "gaming");
 *
 * schema.parse(formData);
 * // Result: {
 * //   name: "John",
 * //   age: 30,
 * //   address: { street: "123 Main St" },
 * //   hobbies: ["reading", "gaming"]
 * // }
 *
 * @example
 * // With plain object (e.g., from JSON)
 * const data = { name: "John", age: "30" };
 * schema.parse(data);
 * // Result: { name: "John", age: 30 }
 *
 * @example
 * // With loose mode to include additional fields
 * const looseSchema = formData({
 *   name: text(),
 * }, { loose: true });
 */
export function formData<const TEntries extends v.ObjectEntries>(
  entries: TEntries,
  config?: FormDataConfig,
): FormDataSchema<TEntries, undefined>;

// @__NO_SIDE_EFFECTS__
export function formData(
  entries: v.ObjectEntries,
  config?: FormDataConfig,
): FormDataSchema<v.ObjectEntries, v.ErrorMessage<FormDataIssue> | undefined> {
  const { loose = false, message } = config ?? {};
  return {
    kind: "schema",
    type: "form_data",
    reference: formData,
    expects: "FormData",
    async: false,
    entries,
    message,
    get "~standard"() {
      return v._getStandardProps(this);
    },
    "~run"(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // Handle plain objects directly (e.g., from JSON)
      let transformedValue: Record<string, unknown>;
      if (isPlainObject(input)) {
        transformedValue = input;
      }
      // Handle iterables (FormData/URLSearchParams)
      else if (isIterable(input)) {
        transformedValue = preprocessFormData(input);
      }
      // Invalid input type
      else {
        // @ts-expect-error - issue structure
        dataset.issues = [
          {
            kind: "schema",
            type: "form_data",
            input,
            expected: "FormData",
            received: typeof input,
            message:
              message ?? "Invalid type: Expected FormData or object but received " + typeof input,
            requirement: undefined,
            path: undefined,
            issues: undefined,
            lang: undefined,
            abortEarly: undefined,
            abortPipeEarly: undefined,
            skipPipe: undefined,
          },
        ];
        dataset.typed = false;
        // @ts-expect-error - return typed dataset
        return dataset as v.OutputDataset<
          v.InferOutput<v.ObjectSchema<v.ObjectEntries, undefined>>,
          FormDataIssue | v.InferIssue<v.ObjectSchema<v.ObjectEntries, undefined>>
        >;
      }

      // Ensure all schema keys are present, even if missing from form data
      // This allows validators to provide their own defaults (like repeatable() returning [])
      for (const key of Object.keys(entries)) {
        if (!(key in transformedValue)) {
          setPath(transformedValue, key, undefined);
        }
      }

      // Run the object schema validation on the transformed value
      // Use looseObject if loose mode is enabled, otherwise use object
      const objectSchema = loose ? v.looseObject(entries) : v.object(entries);
      const objectDataset = objectSchema["~run"]({ typed: false, value: transformedValue }, config);

      // Return the object schema's dataset result
      return objectDataset as v.OutputDataset<
        v.InferOutput<v.ObjectSchema<v.ObjectEntries, undefined>>,
        FormDataIssue | v.InferIssue<v.ObjectSchema<v.ObjectEntries, undefined>>
      >;
    },
  };
}
