import { type NestedObject, flatObjectToNestedObject } from "@typed-web/form-utils";
import { type z } from "zod";
import { zodErrorsToFlatObject } from "./zod-errors-to-flat-object.ts";

/**
 * Converts Zod validation errors to a nested structure object.
 * Uses path strings to create hierarchical error structure.
 *
 * @param error - Zod validation error
 * @returns Nested structure with error messages in hierarchical format
 *
 * @example
 * const schema = z.object({
 *   user: z.object({ name: z.string() }),
 *   addresses: z.array(z.object({ city: z.string() }))
 * });
 * const result = schema.safeParse({ user: { name: '' }, addresses: [{ city: '' }] });
 * if (!result.success) {
 *   const errors = zodErrorsToNestedObject(result.error);
 *   // {
 *   //   user: { name: "Required" },
 *   //   addresses: [{ city: "Required" }]
 * }
 * }
 */
export function zodErrorsToNestedObject<T = unknown>(error: z.ZodError): NestedObject<T> {
  const flatErrors = zodErrorsToFlatObject(error);
  return flatObjectToNestedObject<T, string>(flatErrors);
}
