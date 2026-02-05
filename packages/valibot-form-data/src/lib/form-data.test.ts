import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { checkbox } from "./checkbox.ts";
import { file } from "./file.ts";
import { formData } from "./form-data.ts";
import { numeric } from "./numeric.ts";
import { repeatable, repeatableOfType } from "./repeatable.ts";
import { text } from "./text.ts";

const vfd = { checkbox, file, formData, numeric, repeatable, repeatableOfType, text };

describe("formData()", () => {
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

  describe("plain object support", () => {
    test("should accept plain objects", () => {
      const data = {
        name: "John",
        age: "30",
      };
      const result = v.parse(
        vfd.formData({
          name: vfd.text(),
          age: vfd.numeric(),
        }),
        data,
      );
      assert.deepStrictEqual(result, { name: "John", age: 30 });
    });

    test("should handle nested objects from plain objects", () => {
      const data = {
        user: {
          name: "John",
          email: "john@example.com",
        },
      };
      const result = v.parse(
        vfd.formData({
          user: v.object({
            name: vfd.text(),
            email: vfd.text(),
          }),
        }),
        data,
      );
      assert.deepStrictEqual(result, {
        user: {
          name: "John",
          email: "john@example.com",
        },
      });
    });

    test("should handle arrays in plain objects", () => {
      const data = {
        tags: ["javascript", "typescript"],
      };
      const result = v.parse(
        vfd.formData({
          tags: vfd.repeatable(),
        }),
        data,
      );
      assert.deepStrictEqual(result, { tags: ["javascript", "typescript"] });
    });

    test("should add missing fields with undefined for plain objects", () => {
      const data = {
        name: "John",
      };
      const result = v.parse(
        vfd.formData({
          name: vfd.text(),
          age: vfd.numeric(v.optional(v.number())),
          hobbies: vfd.repeatable(),
        }),
        data,
      );
      assert.deepStrictEqual(result, {
        name: "John",
        age: undefined,
        hobbies: [],
      });
    });

    test("should work with mixed plain object and validator logic", () => {
      const data = {
        name: "John",
        subscribe: "on",
        age: "25",
      };
      const result = v.parse(
        vfd.formData({
          name: vfd.text(),
          subscribe: vfd.checkbox(),
          age: vfd.numeric(),
        }),
        data,
      );
      assert.deepStrictEqual(result, {
        name: "John",
        subscribe: true,
        age: 25,
      });
    });
  });
});
