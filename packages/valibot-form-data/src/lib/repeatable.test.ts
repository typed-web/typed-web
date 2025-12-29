import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { numeric } from "./numeric.ts";
import { repeatable, repeatableOfType } from "./repeatable.ts";
import { text } from "./text.ts";

describe("repeatable()", () => {
  test("should convert single values to arrays", () => {
    assert.deepStrictEqual(v.parse(repeatable(), "one"), ["one"]);
  });

  test("should pass through arrays unchanged", () => {
    assert.deepStrictEqual(v.parse(repeatable(), ["one", "two"]), ["one", "two"]);
  });

  test("should convert undefined to empty array", () => {
    assert.deepStrictEqual(v.parse(repeatable(), undefined), []);
  });

  test("should validate array items with default text schema", () => {
    assert.throws(() => v.parse(repeatable(), ["valid", ""]), v.ValiError);
    assert.deepStrictEqual(v.parse(repeatable(), ["valid", "also-valid"]), ["valid", "also-valid"]);
  });

  test("should work with custom array validation", () => {
    const atLeastOne = repeatable(v.pipe(v.array(text()), v.minLength(1)));
    assert.deepStrictEqual(v.parse(atLeastOne, ["item"]), ["item"]);
    assert.throws(() => v.parse(atLeastOne, []), v.ValiError);
    assert.throws(() => v.parse(atLeastOne, undefined), v.ValiError);
  });
});

describe("repeatableOfType()", () => {
  test("should work with numeric item schema", () => {
    const repeatableNumbers = repeatableOfType(numeric());
    assert.deepStrictEqual(v.parse(repeatableNumbers, ["1", "2"]), [1, 2]);
    assert.deepStrictEqual(v.parse(repeatableNumbers, "42"), [42]);
    assert.deepStrictEqual(v.parse(repeatableNumbers, undefined), []);
  });

  test("should work with custom item validation", () => {
    const repeatableEmails = repeatableOfType(v.pipe(text(), v.email("Must be valid email")));
    assert.deepStrictEqual(v.parse(repeatableEmails, "test@example.com"), ["test@example.com"]);
    assert.throws(() => v.parse(repeatableEmails, "invalid-email"), v.ValiError);
  });
});
