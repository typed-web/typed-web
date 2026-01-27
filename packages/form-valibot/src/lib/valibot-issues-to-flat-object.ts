import { type FlatObject } from "@typed-web/form-utils";
import type * as v from "valibot";

/**
 * Converts Valibot validation issues to a flat structure object.
 * Maps error paths to error messages using dot and bracket notation.
 *
 * @param issues - Array of Valibot validation issues
 * @returns Flat structure with error messages mapped by path strings
 *
 * @example
 * const issues = [
 *   { path: [{ key: 'user' }, { key: 'name' }], message: 'Required field' },
 *   { path: [{ key: 'addresses' }, { key: 0 }, { key: 'city' }], message: 'Invalid city' }
 * ];
 * const errors = valibotIssuesToFlatObject(issues);
 * // {
 * //   "user.name": "Required field",
 * //   "addresses.0.city": "Invalid city"
 * // }
 */
export function valibotIssuesToFlatObject(issues: Array<v.BaseIssue<unknown>>): FlatObject<string> {
  const entries = issues.map((issue) => [
    issue.path?.map((path) => String(path.key)).join(".") ?? "",
    issue.message,
  ]);
  return Object.fromEntries(entries);
}
