import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { objectFromPathEntries } from "./object-from-path-entries.ts";

describe("objectFromPathEntries()", () => {
  test("should transform flat entries", () => {
    const entries: Array<[string, string]> = [
      ["name", "John"],
      ["age", "30"],
    ];
    const result = objectFromPathEntries(entries);
    assert.deepStrictEqual(result, { name: "John", age: "30" });
  });

  test("should handle dot notation for nested objects", () => {
    const entries: Array<[string, string]> = [
      ["user.name", "John"],
      ["user.email", "john@example.com"],
      ["user.address.street", "123 Main St"],
      ["user.address.city", "Anytown"],
    ];
    const result = objectFromPathEntries(entries);
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
    const entries: Array<[string, string]> = [
      ["items[0].name", "Item 1"],
      ["items[0].price", "10"],
      ["items[1].name", "Item 2"],
      ["items[1].price", "20"],
    ];
    const result = objectFromPathEntries(entries);
    assert.deepStrictEqual(result, {
      items: [
        { name: "Item 1", price: "10" },
        { name: "Item 2", price: "20" },
      ],
    });
  });

  test("should group multiple values with same key into array", () => {
    const entries: Array<[string, string]> = [
      ["tags", "javascript"],
      ["tags", "typescript"],
      ["tags", "react"],
    ];
    const result = objectFromPathEntries(entries);
    assert.deepStrictEqual(result, {
      tags: ["javascript", "typescript", "react"],
    });
  });

  test("should keep single values as single values", () => {
    const entries: Array<[string, string]> = [
      ["name", "John"],
      ["email", "john@example.com"],
    ];
    const result = objectFromPathEntries(entries);
    assert.deepStrictEqual(result, {
      name: "John",
      email: "john@example.com",
    });
  });

  test("should handle mixed notation", () => {
    const entries: Array<[string, string]> = [
      ["user.name", "John"],
      ["user.hobbies[0]", "reading"],
      ["user.hobbies[1]", "coding"],
      ["settings.theme", "dark"],
    ];
    const result = objectFromPathEntries(entries);
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

  test("should handle empty entries", () => {
    const result = objectFromPathEntries([]);
    assert.deepStrictEqual(result, {});
  });

  test("should handle numeric indices in dot notation", () => {
    const entries: Array<[string, string]> = [
      ["items.0.name", "First"],
      ["items.1.name", "Second"],
    ];
    const result = objectFromPathEntries(entries);
    assert.deepStrictEqual(result, {
      items: [{ name: "First" }, { name: "Second" }],
    });
  });

  test("should handle complex nested structures", () => {
    const entries: Array<[string, string]> = [
      ["users[0].name", "Alice"],
      ["users[0].roles[0]", "admin"],
      ["users[0].roles[1]", "editor"],
      ["users[1].name", "Bob"],
      ["users[1].roles[0]", "viewer"],
    ];
    const result = objectFromPathEntries(entries);
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
