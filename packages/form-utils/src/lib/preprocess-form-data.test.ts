import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { preprocessFormData } from "./preprocess-form-data.ts";

describe("preprocessFormData()", () => {
  test("should work with URLSearchParams", () => {
    const formData = new URLSearchParams([
      ["name", "John"],
      ["age", "30"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, { name: "John", age: "30" });
  });

  test("should work with FormData", () => {
    const formData = new FormData();
    formData.append("name", "John");
    formData.append("age", "30");
    formData.append("tags", "js");
    formData.append("tags", "ts");
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      name: "John",
      age: "30",
      tags: ["js", "ts"],
    });
  });

  test("should work with plain objects", () => {
    const data = { name: "John", age: "30" };
    const result = preprocessFormData(data);
    assert.deepStrictEqual(result, { name: "John", age: "30" });
  });

  test("should handle nested paths in plain objects", () => {
    const data = {
      "user.name": "John",
      "user.email": "john@example.com",
    };
    const result = preprocessFormData(data);
    assert.deepStrictEqual(result, {
      user: {
        name: "John",
        email: "john@example.com",
      },
    });
  });

  test("should handle dot notation with URLSearchParams", () => {
    const formData = new URLSearchParams([
      ["user.name", "John"],
      ["user.address.street", "123 Main St"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      user: {
        name: "John",
        address: {
          street: "123 Main St",
        },
      },
    });
  });

  test("should handle empty FormData", () => {
    const formData = new URLSearchParams([]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {});
  });

  test("should handle empty plain object", () => {
    const result = preprocessFormData({});
    assert.deepStrictEqual(result, {});
  });
});
