import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { checkbox } from "./checkbox.ts";

describe("checkbox()", () => {
  test("should return true for default checked value", () => {
    assert.strictEqual(v.parse(checkbox(), "on"), true);
  });

  test("should return false for undefined (unchecked)", () => {
    assert.strictEqual(v.parse(checkbox(), undefined), false);
  });

  test("should work with custom trueValue", () => {
    const customCheckbox = checkbox({ trueValue: "yes" });
    assert.strictEqual(v.parse(customCheckbox, "yes"), true);
    assert.strictEqual(v.parse(customCheckbox, undefined), false);
  });

  test("should throw on invalid values", () => {
    assert.throws(() => v.parse(checkbox(), "off"), v.ValiError);
    assert.throws(() => v.parse(checkbox(), "false"), v.ValiError);
    assert.throws(() => v.parse(checkbox(), ""), v.ValiError);
  });

  test("should throw on wrong custom values", () => {
    const customCheckbox = checkbox({ trueValue: "yes" });
    assert.throws(() => v.parse(customCheckbox, "on"), v.ValiError);
    assert.throws(() => v.parse(customCheckbox, "no"), v.ValiError);
  });
});
