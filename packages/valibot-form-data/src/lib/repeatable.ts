import * as v from "valibot";
import { text } from "./text.ts";

/**
 * Repeatable issue interface.
 */
export interface RepeatableIssue extends v.BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: "schema";
  /**
   * The issue type.
   */
  readonly type: "repeatable";
  /**
   * The expected property.
   */
  readonly expected: "Array";
}

/**
 * Repeatable schema interface.
 */
export interface RepeatableSchema<TInput, TOutput, TIssue extends v.BaseIssue<unknown>>
  extends v.BaseSchema<TInput, TOutput, RepeatableIssue | TIssue> {
  /**
   * The schema type.
   */
  readonly type: "repeatable";
  /**
   * The schema reference.
   */
  readonly reference: typeof repeatable;
  /**
   * The expected property.
   */
  readonly expects: "Array";
  /**
   * The wrapped schema.
   */
  readonly schema: v.BaseSchema<Array<unknown>, TOutput, TIssue>;
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
 * @returns Repeatable schema that normalizes values to arrays then applies validation
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
>(schema?: TSchema): RepeatableSchema<unknown, v.InferOutput<TSchema>, v.InferIssue<TSchema>> {
  const wrappedSchema = schema ?? (v.array(text()) as unknown as TSchema);

  return {
    kind: "schema",
    type: "repeatable",
    reference: repeatable,
    expects: "Array",
    async: false,
    schema: wrappedSchema,
    get "~standard"() {
      return v._getStandardProps(this);
    },
    "~run"(dataset, config) {
      const input = dataset.value;

      // Transform value to array
      if (Array.isArray(input)) {
        dataset.value = input;
      } else if (input === undefined) {
        dataset.value = [];
      } else {
        dataset.value = [input];
      }

      // Run the wrapped schema validation on the transformed value
      const result = wrappedSchema["~run"]({ typed: false, value: dataset.value }, config);

      // Return the result from the wrapped schema
      return result as v.OutputDataset<
        v.InferOutput<TSchema>,
        RepeatableIssue | v.InferIssue<TSchema>
      >;
    },
  };
}

/**
 * A convenience wrapper for repeatable. Instead of passing the schema for an entire array,
 * you pass in the schema for the item type.
 *
 * @param itemSchema - Schema to validate each item in the array
 * @returns Repeatable schema that normalizes values to arrays and validates each item
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
