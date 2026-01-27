import { type FlatObject, arrayPathToStringPath } from "@typed-web/form-utils";
import { type z } from "zod";
import { getIssuesForError } from "./get-issues-for-error.ts";

/**
 * Converts Zod validation errors to a flat structure object.
 * Maps error paths to error messages using dot and bracket notation.
 *
 * @param error - Zod validation error
 * @returns Flat structure with error messages mapped by path strings
 *
 * @example
 * const schema = z.object({
 *   user: z.object({ name: z.string() }),
 *   addresses: z.array(z.object({ city: z.string() }))
 * });
 * const result = schema.safeParse({ user: { name: '' }, addresses: [{ city: '' }] });
 * if (!result.success) {
 *   const errors = zodErrorsToFlatObject(result.error);
 *   // {
 *   //   "user.name": "Required",
 *   //   "addresses[0].city": "Required"
 *   // }
 * }
 */
export function zodErrorsToFlatObject(error: z.ZodError): FlatObject<string> {
  const flatErrors: FlatObject<string> = {};

  getIssuesForError(error).forEach((issue) => {
    const stringPath = arrayPathToStringPath(issue.path);
    if (flatErrors[stringPath] === undefined) {
      flatErrors[stringPath] = issue.message;
    }
  });

  return flatErrors;
}
