import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import * as vfd from "./form-data-schema.ts";

describe("Form Data Schema Validators", () => {
  describe("text()", () => {
    test("should parse valid text", () => {
      assert.strictEqual(v.parse(vfd.text(), "text"), "text");
    });

    test("should throw on empty strings when required", () => {
      assert.throws(() => v.parse(vfd.text(), ""), v.ValiError);
    });

    test("should throw on undefined", () => {
      assert.throws(() => v.parse(vfd.text(), undefined), v.ValiError);
    });

    test("should allow empty strings when optional", () => {
      assert.strictEqual(v.parse(vfd.text(v.optional(v.string())), ""), undefined);
    });

    test("should work with custom validation", () => {
      const minLength = vfd.text(v.pipe(v.string(), v.minLength(3)));
      assert.strictEqual(v.parse(minLength, "hello"), "hello");
      assert.throws(() => v.parse(minLength, "hi"), v.ValiError);
    });
  });

  describe("numeric()", () => {
    test("should parse integer strings", () => {
      assert.strictEqual(v.parse(vfd.numeric(), "123"), 123);
    });

    test("should parse decimal strings", () => {
      assert.strictEqual(v.parse(vfd.numeric(), "123.456"), 123.456);
    });

    test("should throw on empty strings when required", () => {
      assert.throws(() => v.parse(vfd.numeric(), ""), v.ValiError);
    });

    test("should throw on undefined", () => {
      assert.throws(() => v.parse(vfd.numeric(), undefined), v.ValiError);
    });

    test("should throw on non-numeric strings", () => {
      assert.throws(() => v.parse(vfd.numeric(), "abc"), v.ValiError);
      assert.throws(() => v.parse(vfd.numeric(), "24px"), v.ValiError);
      assert.throws(() => v.parse(vfd.numeric(), "hello123"), v.ValiError);
    });

    test("should allow empty strings when optional", () => {
      assert.strictEqual(v.parse(vfd.numeric(v.optional(v.number())), ""), undefined);
    });

    test("should work with custom validation", () => {
      const minValue = vfd.numeric(v.pipe(v.number(), v.minValue(10)));
      assert.strictEqual(v.parse(minValue, "15"), 15);
      assert.throws(() => v.parse(minValue, "5"), v.ValiError);
    });
  });

  describe("checkbox()", () => {
    test("should return true for default checked value", () => {
      assert.strictEqual(v.parse(vfd.checkbox(), "on"), true);
    });

    test("should return false for undefined (unchecked)", () => {
      assert.strictEqual(v.parse(vfd.checkbox(), undefined), false);
    });

    test("should work with custom trueValue", () => {
      const customCheckbox = vfd.checkbox({ trueValue: "yes" });
      assert.strictEqual(v.parse(customCheckbox, "yes"), true);
      assert.strictEqual(v.parse(customCheckbox, undefined), false);
    });

    test("should throw on invalid values", () => {
      assert.throws(() => v.parse(vfd.checkbox(), "off"), v.ValiError);
      assert.throws(() => v.parse(vfd.checkbox(), "false"), v.ValiError);
      assert.throws(() => v.parse(vfd.checkbox(), ""), v.ValiError);
    });

    test("should throw on wrong custom values", () => {
      const customCheckbox = vfd.checkbox({ trueValue: "yes" });
      assert.throws(() => v.parse(customCheckbox, "on"), v.ValiError);
      assert.throws(() => v.parse(customCheckbox, "no"), v.ValiError);
    });
  });

  describe("file()", () => {
    test("should accept valid files", () => {
      const file = new File(["Hello!"], "hello.txt", { type: "text/plain" });
      assert.strictEqual(v.parse(vfd.file(), file), file);
    });

    test("should throw on empty files when required", () => {
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });
      assert.throws(() => v.parse(vfd.file(), emptyFile), v.ValiError);
    });

    test("should throw on non-File objects", () => {
      assert.throws(() => v.parse(vfd.file(), "not-a-file"), v.ValiError);
      assert.throws(() => v.parse(vfd.file(), undefined), v.ValiError);
      assert.throws(() => v.parse(vfd.file(), null), v.ValiError);
    });

    test("should allow empty files when optional", () => {
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });
      assert.strictEqual(v.parse(vfd.file(v.optional(v.instance(File))), emptyFile), undefined);
    });

    test("should work with custom validation", () => {
      const imageFile = vfd.file(v.pipe(v.instance(File), v.mimeType(["image/png"])));
      const pngFile = new File(["data"], "image.png", { type: "image/png" });
      const txtFile = new File(["data"], "file.txt", { type: "text/plain" });

      assert.strictEqual(v.parse(imageFile, pngFile), pngFile);
      assert.throws(() => v.parse(imageFile, txtFile), v.ValiError);
    });
  });

  describe("repeatable()", () => {
    test("should convert single values to arrays", () => {
      assert.deepStrictEqual(v.parse(vfd.repeatable(), "one"), ["one"]);
    });

    test("should pass through arrays unchanged", () => {
      assert.deepStrictEqual(v.parse(vfd.repeatable(), ["one", "two"]), ["one", "two"]);
    });

    test("should convert undefined to empty array", () => {
      assert.deepStrictEqual(v.parse(vfd.repeatable(), undefined), []);
    });

    test("should validate array items with default text schema", () => {
      assert.throws(() => v.parse(vfd.repeatable(), ["valid", ""]), v.ValiError);
      assert.deepStrictEqual(v.parse(vfd.repeatable(), ["valid", "also-valid"]), [
        "valid",
        "also-valid",
      ]);
    });

    test("should work with custom array validation", () => {
      const atLeastOne = vfd.repeatable(v.pipe(v.array(vfd.text()), v.minLength(1)));
      assert.deepStrictEqual(v.parse(atLeastOne, ["item"]), ["item"]);
      assert.throws(() => v.parse(atLeastOne, []), v.ValiError);
      assert.throws(() => v.parse(atLeastOne, undefined), v.ValiError);
    });
  });

  describe("repeatableOfType()", () => {
    test("should work with numeric item schema", () => {
      const repeatableNumbers = vfd.repeatableOfType(vfd.numeric());
      assert.deepStrictEqual(v.parse(repeatableNumbers, ["1", "2"]), [1, 2]);
      assert.deepStrictEqual(v.parse(repeatableNumbers, "42"), [42]);
      assert.deepStrictEqual(v.parse(repeatableNumbers, undefined), []);
    });

    test("should work with custom item validation", () => {
      const repeatableEmails = vfd.repeatableOfType(
        v.pipe(vfd.text(), v.email("Must be valid email")),
      );
      assert.deepStrictEqual(v.parse(repeatableEmails, "test@example.com"), ["test@example.com"]);
      assert.throws(() => v.parse(repeatableEmails, "invalid-email"), v.ValiError);
    });
  });
});

describe("FormData Integration", () => {
  describe("basic field parsing", () => {
    test("should parse text fields", () => {
      const formData = new URLSearchParams([["name", "John Doe"]]);
      const result = v.parse(vfd.formData({ name: vfd.text() }), formData);
      assert.deepStrictEqual(result, { name: "John Doe" });
    });

    test("should parse numeric fields", () => {
      const formData = new URLSearchParams([["age", "25"]]);
      const result = v.parse(vfd.formData({ age: vfd.numeric() }), formData);
      assert.deepStrictEqual(result, { age: 25 });
    });

    test("should parse checkbox fields", () => {
      const formData = new URLSearchParams([["subscribe", "on"]]);
      const result = v.parse(vfd.formData({ subscribe: vfd.checkbox() }), formData);
      assert.deepStrictEqual(result, { subscribe: true });
    });

    test("should parse repeatable fields", () => {
      const formData = new URLSearchParams([
        ["hobbies", "reading"],
        ["hobbies", "traveling"],
      ]);
      const result = v.parse(
        vfd.formData({
          hobbies: v.pipe(vfd.repeatable(), v.array(v.string())),
        }),
        formData,
      );
      assert.deepStrictEqual(result, { hobbies: ["reading", "traveling"] });
    });
  });

  describe("nested object support", () => {
    test("should parse nested object fields", () => {
      const formData = new URLSearchParams([
        ["name", "John"],
        ["address.street", "123 Main St"],
        ["address.city", "Anytown"],
      ]);

      const result = v.parse(
        vfd.formData({
          name: vfd.text(),
          address: v.object({
            street: vfd.text(),
            city: vfd.text(),
          }),
        }),
        formData,
      );
      assert.deepStrictEqual(result, {
        name: "John",
        address: {
          street: "123 Main St",
          city: "Anytown",
        },
      });
    });

    test("should parse indexed array objects", () => {
      const formData = new URLSearchParams([
        ["locations.0.country", "USA"],
        ["locations.0.city", "New York"],
        ["locations.1.country", "Canada"],
        ["locations.1.city", "Toronto"],
      ]);
      const result = v.parse(
        vfd.formData({
          locations: v.array(
            v.object({
              country: vfd.text(),
              city: vfd.text(),
            }),
          ),
        }),
        formData,
      );
      assert.deepStrictEqual(result, {
        locations: [
          { country: "USA", city: "New York" },
          { country: "Canada", city: "Toronto" },
        ],
      });
    });
  });

  describe("missing field handling", () => {
    describe("text fields", () => {
      test("required should throw when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        assert.throws(
          () => v.parse(vfd.formData({ requiredText: vfd.text() }), formData),
          v.ValiError,
        );
      });

      test("optional should return undefined when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        const result = v.parse(
          vfd.formData({ optionalText: vfd.text(v.optional(v.string())) }),
          formData,
        );
        assert.deepStrictEqual(result, { optionalText: undefined });
      });
    });

    describe("numeric fields", () => {
      test("required should throw when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        assert.throws(
          () => v.parse(vfd.formData({ requiredNumber: vfd.numeric() }), formData),
          v.ValiError,
        );
      });

      test("optional should return undefined when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        const result = v.parse(
          vfd.formData({ optionalNumber: vfd.numeric(v.optional(v.number())) }),
          formData,
        );
        assert.deepStrictEqual(result, { optionalNumber: undefined });
      });
    });

    describe("checkbox fields", () => {
      test("should return false when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        const result = v.parse(vfd.formData({ checkbox: vfd.checkbox() }), formData);
        assert.deepStrictEqual(result, { checkbox: false });
      });
    });

    describe("file fields", () => {
      test("required should throw when missing", () => {
        const formData = new FormData();
        formData.append("other", "value");
        assert.throws(
          () => v.parse(vfd.formData({ requiredFile: vfd.file() }), formData),
          v.ValiError,
        );
      });

      test("optional should return undefined when missing", () => {
        const formData = new FormData();
        formData.append("other", "value");
        const result = v.parse(
          vfd.formData({
            optionalFile: vfd.file(v.optional(v.instance(File))),
          }),
          formData,
        );
        assert.deepStrictEqual(result, { optionalFile: undefined });
      });
    });

    describe("repeatable fields", () => {
      test("should return empty array when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        const result = v.parse(vfd.formData({ repeatableField: vfd.repeatable() }), formData);
        assert.deepStrictEqual(result, { repeatableField: [] });
      });

      test("repeatableOfType should return empty array when missing", () => {
        const formData = new URLSearchParams([["other", "value"]]);
        const result = v.parse(
          vfd.formData({
            repeatableNumbers: vfd.repeatableOfType(vfd.numeric()),
          }),
          formData,
        );
        assert.deepStrictEqual(result, { repeatableNumbers: [] });
      });
    });
  });

  describe("complex scenarios", () => {
    test("should handle mixed present and missing fields", () => {
      const formData = new URLSearchParams([
        ["presentText", "hello"],
        ["presentNumber", "42"],
        ["checkedBox", "on"],
      ]);
      const result = v.parse(
        vfd.formData({
          presentText: vfd.text(),
          missingOptionalText: vfd.text(v.optional(v.string())),
          presentNumber: vfd.numeric(),
          missingOptionalNumber: vfd.numeric(v.optional(v.number())),
          checkedBox: vfd.checkbox(),
          uncheckedBox: vfd.checkbox(),
          missingRepeatable: vfd.repeatable(),
        }),
        formData,
      );
      assert.deepStrictEqual(result, {
        presentText: "hello",
        missingOptionalText: undefined,
        presentNumber: 42,
        missingOptionalNumber: undefined,
        checkedBox: true,
        uncheckedBox: false,
        missingRepeatable: [],
      });
    });
  });
});
