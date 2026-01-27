import { type NestedObject, flatObjectToNestedObject } from "@typed-web/form-utils";
import { valibotIssuesToFlatObject } from "./valibot-issues-to-flat-object.ts";
import type * as v from "valibot";

/**
 * Converts Valibot validation issues to a nested structure object.
 * Uses path strings to create hierarchical error structure.
 *
 * @param issues - Array of Valibot validation issues
 * @returns Nested structure with error messages in hierarchical format
 *
 * @example
 * const issues = [
 *   { path: [{ key: 'user' }, { key: 'name' }], message: 'Required field' },
 *   { path: [{ key: 'addresses' }, { key: 0 }, { key: 'city' }], message: 'Invalid city' }
 * ];
 * const errors = valibotIssuesToNestedObject(issues);
 * // {
 * //   user: { name: "Required field" },
 * //   addresses: [{ city: "Invalid city" }]
 * // }
 */
export function valibotIssuesToNestedObject<T = unknown>(
  issues: Array<v.BaseIssue<unknown>>,
): NestedObject<T> {
  const flatErrors = valibotIssuesToFlatObject(issues);
  return flatObjectToNestedObject<T, string>(flatErrors);
}
