import { type z } from "zod";

/**
 * Helper to extract issues from Zod errors, including union errors.
 * Union errors contain nested errors that need to be flattened.
 */
export function getIssuesForError(error: z.ZodError): Array<z.ZodIssue> {
  return error.issues.flatMap((issue) => {
    if (issue.code === "invalid_union") {
      return issue.errors.flat();
    }
    return [issue];
  });
}
