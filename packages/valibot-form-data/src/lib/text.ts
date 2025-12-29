import * as v from "valibot";

/**
 * Text issue interface.
 */
export interface TextIssue extends v.BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: "schema";
  /**
   * The issue type.
   */
  readonly type: "text";
  /**
   * The expected property.
   */
  readonly expected: "string";
}

/**
 * Text schema interface.
 */
export interface TextSchema<TInput, TOutput, TIssue extends v.BaseIssue<unknown>>
  extends v.BaseSchema<TInput, TOutput, TextIssue | TIssue> {
  /**
   * The schema type.
   */
  readonly type: "text";
  /**
   * The schema reference.
   */
  readonly reference: typeof text;
  /**
   * The expected property.
   */
  readonly expects: "string";
  /**
   * The wrapped schema.
   */
  readonly schema: v.BaseSchema<string | undefined, TOutput, TIssue>;
}

/**
 * Schema for text input fields that transforms empty strings to undefined before validation.
 * This allows you to use v.optional() for optional fields and v.string() for required fields.
 *
 * @param schema - Optional schema to validate after empty string transformation. Defaults to v.string()
 * @returns Text schema that transforms empty strings to undefined then validates
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
>(schema?: TSchema): TextSchema<unknown, v.InferOutput<TSchema>, v.InferIssue<TSchema>> {
  const wrappedSchema = schema ?? (v.string() as unknown as TSchema);

  return {
    kind: "schema",
    type: "text",
    reference: text,
    expects: "string",
    async: false,
    schema: wrappedSchema,
    get "~standard"() {
      return v._getStandardProps(this);
    },
    "~run"(dataset, config) {
      const input = dataset.value;

      // Transform empty string to undefined
      if (input === "") {
        dataset.value = undefined;
      }

      // Run the wrapped schema validation on the transformed value
      const result = wrappedSchema["~run"]({ typed: false, value: dataset.value }, config);

      // Return the result from the wrapped schema
      return result as v.OutputDataset<v.InferOutput<TSchema>, TextIssue | v.InferIssue<TSchema>>;
    },
  };
}
