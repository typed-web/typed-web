import * as v from "valibot";

/**
 * Numeric issue interface.
 */
export interface NumericIssue extends v.BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: "schema";
  /**
   * The issue type.
   */
  readonly type: "numeric";
  /**
   * The expected property.
   */
  readonly expected: "number";
}

/**
 * Numeric schema interface.
 */
export interface NumericSchema<TInput, TOutput, TIssue extends v.BaseIssue<unknown>>
  extends v.BaseSchema<TInput, TOutput, NumericIssue | TIssue> {
  /**
   * The schema type.
   */
  readonly type: "numeric";
  /**
   * The schema reference.
   */
  readonly reference: typeof numeric;
  /**
   * The expected property.
   */
  readonly expects: "number";
  /**
   * The wrapped schema.
   */
  readonly schema: v.BaseSchema<number | undefined, TOutput, TIssue>;
}

/**
 * Schema for numeric input fields that coerces numerical strings to numbers and transforms empty strings to undefined before validation.
 * If you call numeric with no arguments, it assumes the field is a required number by default.
 *
 * @param schema - Optional schema to validate after coercion and empty string transformation. Defaults to v.number()
 * @returns Numeric schema that converts empty strings to undefined, coerces strings to numbers, then validates
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
>(schema?: TSchema): NumericSchema<unknown, v.InferOutput<TSchema>, v.InferIssue<TSchema>> {
  const wrappedSchema = schema ?? (v.number() as unknown as TSchema);

  return {
    kind: "schema",
    type: "numeric",
    reference: numeric,
    expects: "number",
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
      // Coerce string to number
      else if (typeof input === "string") {
        const numValue = Number(input);
        // Check if conversion resulted in a valid number
        if (!isNaN(numValue)) {
          dataset.value = numValue;
        }
        // If it's NaN, leave as string so validation will fail
      }

      // Run the wrapped schema validation on the transformed value
      const result = wrappedSchema["~run"]({ typed: false, value: dataset.value }, config);

      // Return the result from the wrapped schema
      return result as v.OutputDataset<
        v.InferOutput<TSchema>,
        NumericIssue | v.InferIssue<TSchema>
      >;
    },
  };
}
