import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { preprocessFormData } from "./preprocess-form-data.ts";

describe("preprocessFormData()", () => {
  test("should transform flat fields", () => {
    const formData = new URLSearchParams([
      ["name", "John"],
      ["age", "30"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, { name: "John", age: "30" });
  });

  test("should handle dot notation for nested objects", () => {
    const formData = new URLSearchParams([
      ["user.name", "John"],
      ["user.email", "john@example.com"],
      ["user.address.street", "123 Main St"],
      ["user.address.city", "Anytown"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      user: {
        name: "John",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "Anytown",
        },
      },
    });
  });

  test("should handle bracket notation for arrays", () => {
    const formData = new URLSearchParams([
      ["items[0].name", "Item 1"],
      ["items[0].price", "10"],
      ["items[1].name", "Item 2"],
      ["items[1].price", "20"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      items: [
        { name: "Item 1", price: "10" },
        { name: "Item 2", price: "20" },
      ],
    });
  });

  test("should group multiple values with same key into array", () => {
    const formData = new URLSearchParams([
      ["tags", "javascript"],
      ["tags", "typescript"],
      ["tags", "react"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      tags: ["javascript", "typescript", "react"],
    });
  });

  test("should keep single values as single values", () => {
    const formData = new URLSearchParams([
      ["name", "John"],
      ["email", "john@example.com"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      name: "John",
      email: "john@example.com",
    });
  });

  test("should handle mixed notation", () => {
    const formData = new URLSearchParams([
      ["user.name", "John"],
      ["user.hobbies[0]", "reading"],
      ["user.hobbies[1]", "coding"],
      ["settings.theme", "dark"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      user: {
        name: "John",
        hobbies: ["reading", "coding"],
      },
      settings: {
        theme: "dark",
      },
    });
  });

  test("should handle empty FormData", () => {
    const formData = new URLSearchParams([]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {});
  });

  test("should work with FormData (not just URLSearchParams)", () => {
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

  test("should handle numeric indices in dot notation", () => {
    const formData = new URLSearchParams([
      ["items.0.name", "First"],
      ["items.1.name", "Second"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      items: [{ name: "First" }, { name: "Second" }],
    });
  });

  test("should handle complex nested structures", () => {
    const formData = new URLSearchParams([
      ["users[0].name", "Alice"],
      ["users[0].roles[0]", "admin"],
      ["users[0].roles[1]", "editor"],
      ["users[1].name", "Bob"],
      ["users[1].roles[0]", "viewer"],
    ]);
    const result = preprocessFormData(formData);
    assert.deepStrictEqual(result, {
      users: [
        {
          name: "Alice",
          roles: ["admin", "editor"],
        },
        {
          name: "Bob",
          roles: ["viewer"],
        },
      ],
    });
  });
});
