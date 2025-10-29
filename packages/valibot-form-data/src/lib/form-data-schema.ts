import * as v from "valibot";
import { setPath } from "./set-path.ts";

/**
 * Internal helper that transforms empty strings to undefined.
 * Useful for form fields where empty string should be treated as no value.
 *
 * @param message - Optional error message for validation failure
 * @returns Valibot schema that converts "" to undefined or passes through non-empty strings
 */
function emptyToUndefined(message?: v.ErrorMessage<v.BaseIssue<unknown>>) {
  return v.union(
    [
      v.pipe(
        v.literal(""),
        v.transform(() => undefined),
      ),
      v.undefined(),
      v.string(),
    ],
    message,
  );
}

/**
 * Schema for text input fields that transforms empty strings to undefined before validation.
 * This allows you to use v.optional() for optional fields and v.string() for required fields.
 *
 * @param schema - Optional schema to validate the string after empty string transformation. Defaults to v.string()
 * @returns Valibot schema that converts empty strings to undefined then applies the provided schema
 *
 * @example
 * const requiredSchema = text(); // same as text(v.string())
 * requiredSchema.parse("");        // → ValidationError
 * requiredSchema.parse("John");    // → "John"
 *
 * const optionalSchema = text(v.optional(v.string()));
 * optionalSchema.parse("");        // → undefined
 * optionalSchema.parse("John");    // → "John"
 *
 * const minLengthSchema = text(v.pipe(v.string(), v.minLength(3)));
 * minLengthSchema.parse("ab");     // → ValidationError
 */
export function text<
  TSchema extends v.BaseSchema<
    string | undefined,
    unknown,
    v.BaseIssue<unknown>
  > = v.StringSchema<undefined>,
>(schema?: TSchema) {
  return v.pipe(emptyToUndefined(), schema ?? (v.string() as unknown as TSchema));
}

/**
 * Internal helper that coerces string numbers to numbers, handling undefined passthrough.
 * Used after emptyToUndefined() which can produce string | undefined.
 *
 * @param message - Optional error message for validation failure
 * @returns Valibot schema that transforms string to number or passes through undefined
 */
function coerceStringOrUndefinedToNumber(message?: v.ErrorMessage<v.BaseIssue<unknown>>) {
  return v.union(
    [
      v.undefined(),
      v.pipe(
        v.string(),
        v.transform((string) => Number(string)),
        v.number(),
      ),
    ],
    message,
  );
}

/**
 * Schema for numeric input fields that coerces numerical strings to numbers and transforms empty strings to undefined before validation.
 * If you call numeric with no arguments, it assumes the field is a required number by default.
 *
 * @param schema - Optional schema to validate the number after coercion and empty string transformation. Defaults to v.number()
 * @returns Valibot schema that converts empty strings to undefined, coerces strings to numbers, then applies the provided schema
 *
 * @example
 * const requiredSchema = numeric(); // same as numeric(v.number())
 * requiredSchema.parse("");        // → ValidationError
 * requiredSchema.parse("25");      // → 25
 * requiredSchema.parse("abc");     // → ValidationError
 *
 * const optionalSchema = numeric(v.optional(v.number()));
 * optionalSchema.parse("");        // → undefined
 * optionalSchema.parse("25");      // → 25
 *
 * const minValueSchema = numeric(v.pipe(v.number(), v.minValue(13)));
 * minValueSchema.parse("10");      // → ValidationError
 */
export function numeric<
  TSchema extends v.BaseSchema<
    number | undefined,
    unknown,
    v.BaseIssue<unknown>
  > = v.NumberSchema<undefined>,
>(schema?: TSchema) {
  return v.pipe(
    emptyToUndefined(),
    coerceStringOrUndefinedToNumber(),
    schema ?? (v.number() as unknown as TSchema),
  );
}

/**
 * Configuration options for checkbox validation.
 */
type CheckboxArgs = {
  /** The value that represents "checked" state. Defaults to "on" */
  trueValue?: string;
};

/**
 * Schema for checkbox inputs that converts form values to boolean.
 * Unlike other helpers, this is not a preprocessor, but a complete schema.
 * By default, treats "on" as true and undefined as false, but you can customize the true value.
 *
 * @param args - Configuration options for checkbox validation
 * @returns Valibot schema that converts checkbox values to boolean
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
export function checkbox(args: CheckboxArgs = {}) {
  const { trueValue = "on" } = args;
  return v.union([
    v.pipe(
      v.literal(trueValue),
      v.transform(() => true),
    ),
    v.pipe(
      v.undefined(),
      v.transform(() => false),
    ),
  ]);
}

/**
 * Internal helper that transforms empty File objects to undefined.
 * Used for form file inputs where empty files should be treated as no file selected.
 *
 * @param message - Optional error message for validation failure
 * @returns Valibot schema that converts empty files to undefined or passes through non-empty files
 */
function emptyFileToUndefined(message?: v.ErrorMessage<v.BaseIssue<unknown>>) {
  return v.union(
    [
      v.pipe(
        v.instance(File),
        v.check((file) => file.size === 0),
        v.transform(() => undefined),
      ),
      v.pipe(
        v.undefined(),
        v.transform(() => undefined),
      ),
      v.instance(File),
    ],
    message,
  );
}

/**
 * Schema for file input fields that transforms empty File objects to undefined before validation.
 * This makes it so empty files will fail required checks, allowing you to use optional for optional fields.
 * If you call file with no arguments, it assumes the field is a required file by default.
 *
 * @param schema - Optional schema to validate the file after empty file transformation. Defaults to v.instance(File)
 * @returns Valibot schema that converts empty files to undefined then applies the provided schema
 *
 * @example
 * const requiredFile = file(); // same as file(v.instance(File))
 * requiredFile.parse(new File([], "empty.txt"));    // → ValidationError
 * requiredFile.parse(new File(["data"], "file.txt")); // → File object
 *
 * const optionalFile = file(v.optional(v.instance(File)));
 * optionalFile.parse(new File([], "empty.txt"));    // → undefined
 * optionalFile.parse(new File(["data"], "file.txt")); // → File object
 *
 * const imageFile = file(v.pipe(v.instance(File), v.mimeType(["image/png"])));
 * imageFile.parse(new File(["data"], "file.txt"));  // → ValidationError (wrong MIME type)
 */
export function file<
  TSchema extends v.BaseSchema<File | undefined, unknown, v.BaseIssue<unknown>> = v.InstanceSchema<
    typeof File,
    undefined
  >,
>(schema?: TSchema) {
  return v.pipe(emptyFileToUndefined(), schema ?? (v.instance(File) as unknown as TSchema));
}

/**
 * Preprocesses a field where you expect multiple values could be present for the same field name
 * and transforms the value of that field to always be an array. This is specifically meant to work
 * with data transformed by formData().
 *
 * If you don't provide a schema, it will assume the field is an array of text() fields.
 * Always returns an empty array when no values are provided (never fails).
 *
 * @param schema - Optional schema to validate the array after normalization. Defaults to v.array(text())
 * @returns Valibot schema that normalizes values to arrays then applies validation
 *
 * @example
 * const myCheckboxGroup = repeatable();
 * myCheckboxGroup.parse(["a", "b"]);  // → ["a", "b"] (validated as text)
 * myCheckboxGroup.parse("single");    // → ["single"] (validated as text)
 * myCheckboxGroup.parse(undefined);   // → []
 *
 * const atLeastOneItem = repeatable(v.pipe(v.array(text()), v.minLength(1)));
 * atLeastOneItem.parse([]);           // → ValidationError
 * atLeastOneItem.parse(["item"]);     // → ["item"]
 */
export function repeatable<
  TSchema extends v.BaseSchema<Array<unknown>, unknown, v.BaseIssue<unknown>> = v.ArraySchema<
    ReturnType<typeof text>,
    undefined
  >,
>(schema?: TSchema) {
  return v.pipe(
    v.unknown(),
    v.transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }
      if (value === undefined) {
        return [];
      }
      return [value];
    }),
    schema ?? (v.array(text()) as unknown as TSchema),
  );
}

/**
 * A convenience wrapper for repeatable. Instead of passing the schema for an entire array,
 * you pass in the schema for the item type.
 *
 * @param itemSchema - Schema to validate each item in the array
 * @returns Valibot schema that normalizes values to arrays and validates each item
 *
 * @example
 * const repeatableNumberField = repeatableOfType(numeric());
 * repeatableNumberField.parse(["1", "2"]);    // → [1, 2]
 * repeatableNumberField.parse("42");          // → [42]
 * repeatableNumberField.parse(undefined);     // → []
 */
export function repeatableOfType<
  TItemSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(itemSchema: TItemSchema) {
  return repeatable(v.array(itemSchema));
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
 * Schema for processing FormData or URLSearchParams into a structured object.
 * This is the main function for parsing HTML form submissions.
 *
 * The function performs several transformations:
 * 1. Validates the input is iterable (FormData/URLSearchParams)
 * 2. Converts to array of [key, value] entries
 * 3. Groups multiple values for the same key into arrays
 * 4. Uses setPath to create nested objects from dot/bracket notation keys
 * 5. Validates the result against the provided schema shape
 *
 * @param shape - Valibot object schema defining the expected structure
 * @returns Valibot schema that transforms FormData to structured object
 *
 * @example
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
 */
export function formData<E extends v.ObjectEntries>(shape: E) {
  return v.pipe(
    v.unknown(),
    // Make sure that value is iterable (FormData, URLSearchParams, etc.)
    v.custom<Iterable<unknown>>(isIterable),
    // Convert iterable to array of entries
    v.transform((iterable) => [...iterable]),
    // Validate that all entries are [string, unknown] pairs
    v.array(v.tuple([v.string(), v.unknown()])),
    // Transform flat key-value pairs into nested object structure
    v.transform((data) => {
      // Group values by key (handling multiple values for same key)
      const map = new Map<string, Array<unknown>>();
      for (const [key, value] of data) {
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

      // Ensure all schema keys are present, even if missing from form data
      // This allows validators to provide their own defaults (like repeatable() returning [])
      for (const key of Object.keys(shape)) {
        if (!(key in result)) {
          setPath(result, key, undefined);
        }
      }

      return result;
    }),
    // Validate the final object against the provided schema shape
    v.object(shape),
  ) as unknown as v.ObjectSchema<E, undefined>;
}
