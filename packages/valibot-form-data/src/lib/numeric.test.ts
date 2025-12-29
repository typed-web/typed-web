import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { numeric } from "./numeric.ts";

describe("numeric()", () => {
  test("should parse integer strings", () => {
    assert.strictEqual(v.parse(numeric(), "123"), 123);
  });

  test("should parse decimal strings", () => {
    assert.strictEqual(v.parse(numeric(), "123.456"), 123.456);
  });

  test("should throw on empty strings when required", () => {
    assert.throws(() => v.parse(numeric(), ""), v.ValiError);
  });

  test("should throw on undefined", () => {
    assert.throws(() => v.parse(numeric(), undefined), v.ValiError);
  });

  test("should throw on non-numeric strings", () => {
    assert.throws(() => v.parse(numeric(), "abc"), v.ValiError);
    assert.throws(() => v.parse(numeric(), "24px"), v.ValiError);
    assert.throws(() => v.parse(numeric(), "hello123"), v.ValiError);
  });

  test("should allow empty strings when optional", () => {
    assert.strictEqual(v.parse(numeric(v.optional(v.number())), ""), undefined);
  });

  test("should work with custom validation", () => {
    const minValue = numeric(v.pipe(v.number(), v.minValue(10)));
    assert.strictEqual(v.parse(minValue, "15"), 15);
    assert.throws(() => v.parse(minValue, "5"), v.ValiError);
  });
});
