import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { text } from "./text.ts";

describe("text()", () => {
  test("should parse valid text", () => {
    assert.strictEqual(v.parse(text(), "text"), "text");
  });

  test("should throw on empty strings when required", () => {
    assert.throws(() => v.parse(text(), ""), v.ValiError);
  });

  test("should throw on undefined", () => {
    assert.throws(() => v.parse(text(), undefined), v.ValiError);
  });

  test("should allow empty strings when optional", () => {
    assert.strictEqual(v.parse(text(v.optional(v.string())), ""), undefined);
  });

  test("should work with custom validation", () => {
    const minLength = text(v.pipe(v.string(), v.minLength(3)));
    assert.strictEqual(v.parse(minLength, "hello"), "hello");
    assert.throws(() => v.parse(minLength, "hi"), v.ValiError);
  });
});
