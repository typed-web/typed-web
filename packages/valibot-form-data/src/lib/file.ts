import * as v from "valibot";

/**
 * File issue interface.
 */
export interface FileIssue extends v.BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: "schema";
  /**
   * The issue type.
   */
  readonly type: "file";
  /**
   * The expected property.
   */
  readonly expected: "File";
}

/**
 * File schema interface.
 */
export interface FileSchema<TInput, TOutput, TIssue extends v.BaseIssue<unknown>>
  extends v.BaseSchema<TInput, TOutput, FileIssue | TIssue> {
  /**
   * The schema type.
   */
  readonly type: "file";
  /**
   * The schema reference.
   */
  readonly reference: typeof file;
  /**
   * The expected property.
   */
  readonly expects: "File";
  /**
   * The wrapped schema.
   */
  readonly schema: v.BaseSchema<File | undefined, TOutput, TIssue>;
}

/**
 * Schema for file input fields that transforms empty File objects to undefined before validation.
 * This makes it so empty files will fail required checks, allowing you to use optional for optional fields.
 * If you call file with no arguments, it assumes the field is a required file by default.
 *
 * @param schema - Optional schema to validate the file after empty file transformation. Defaults to v.instance(File)
 * @returns File schema that converts empty files to undefined then applies the provided schema
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
>(schema?: TSchema): FileSchema<unknown, v.InferOutput<TSchema>, v.InferIssue<TSchema>> {
  const wrappedSchema = schema ?? (v.instance(File) as unknown as TSchema);

  return {
    kind: "schema",
    type: "file",
    reference: file,
    expects: "File",
    async: false,
    schema: wrappedSchema,
    get "~standard"() {
      return v._getStandardProps(this);
    },
    "~run"(dataset, config) {
      const input = dataset.value;

      // Transform empty File objects to undefined
      if (input instanceof File && input.size === 0) {
        dataset.value = undefined;
      }

      // Run the wrapped schema validation on the transformed value
      const result = wrappedSchema["~run"]({ typed: false, value: dataset.value }, config);

      // Return the result from the wrapped schema
      return result as v.OutputDataset<v.InferOutput<TSchema>, FileIssue | v.InferIssue<TSchema>>;
    },
  };
}
