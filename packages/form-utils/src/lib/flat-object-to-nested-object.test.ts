import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flatObjectToNestedObject } from "./flat-object-to-nested-object.ts";

describe("flatObjectToNestedObject()", () => {
  describe("with simple object paths", () => {
    it("should convert flat object with dot notation", () => {
      const flat = {
        "user.name": "John",
        "user.email": "john@example.com",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: {
          name: "John",
          email: "john@example.com",
        },
      });
    });

    it("should handle single level properties", () => {
      const flat = {
        name: "John",
        age: "30",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        name: "John",
        age: "30",
      });
    });

    it("should handle deeply nested properties", () => {
      const flat = {
        "user.profile.address.street": "123 Main St",
        "user.profile.address.city": "New York",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: {
          profile: {
            address: {
              street: "123 Main St",
              city: "New York",
            },
          },
        },
      });
    });
  });

  describe("with array paths", () => {
    it("should convert flat object with array indices", () => {
      const flat = {
        "addresses[0].city": "San Francisco",
        "addresses[0].state": "California",
        "addresses[1].city": "New York",
        "addresses[1].state": "New York",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        addresses: [
          { city: "San Francisco", state: "California" },
          { city: "New York", state: "New York" },
        ],
      });
    });

    it("should handle top-level numeric keys as object", () => {
      const flat = {
        "[0]": "first",
        "[1]": "second",
        "[2]": "third",
      };
      const result = flatObjectToNestedObject(flat);
      // Top-level always returns an object, even with numeric keys
      assert.deepEqual(result, {
        "0": "first",
        "1": "second",
        "2": "third",
      });
    });

    it("should handle nested arrays", () => {
      const flat = {
        "matrix[0][0]": "a",
        "matrix[0][1]": "b",
        "matrix[1][0]": "c",
        "matrix[1][1]": "d",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        matrix: [
          ["a", "b"],
          ["c", "d"],
        ],
      });
    });

    it("should handle sparse arrays", () => {
      const flat = {
        "items[0]": "first",
        "items[5]": "sixth",
      };
      const result = flatObjectToNestedObject(flat);
      const expected: { items: string[] } = { items: [] };
      expected.items[0] = "first";
      expected.items[5] = "sixth";
      assert.deepEqual(result, expected);
    });
  });

  describe("with mixed paths", () => {
    it("should handle arrays inside objects", () => {
      const flat = {
        "user.name": "John",
        "user.addresses[0].city": "SF",
        "user.addresses[0].zip": "94102",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: {
          name: "John",
          addresses: [{ city: "SF", zip: "94102" }],
        },
      });
    });

    it("should handle objects inside arrays", () => {
      const flat = {
        "users[0].name": "Alice",
        "users[0].age": "25",
        "users[1].name": "Bob",
        "users[1].age": "30",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        users: [
          { name: "Alice", age: "25" },
          { name: "Bob", age: "30" },
        ],
      });
    });

    it("should handle complex nested structures", () => {
      const flat = {
        "company.departments[0].name": "Engineering",
        "company.departments[0].employees[0].name": "Alice",
        "company.departments[0].employees[0].role": "Developer",
        "company.departments[1].name": "Sales",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        company: {
          departments: [
            {
              name: "Engineering",
              employees: [{ name: "Alice", role: "Developer" }],
            },
            { name: "Sales" },
          ],
        },
      });
    });
  });

  describe("with different value types", () => {
    it("should preserve string values", () => {
      const flat = {
        "user.name": "John Doe",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { user: { name: "John Doe" } });
    });

    it("should preserve numeric values", () => {
      const flat = {
        "user.age": 30,
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { user: { age: 30 } });
    });

    it("should preserve boolean values", () => {
      const flat = {
        "user.active": true,
        "user.verified": false,
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: { active: true, verified: false },
      });
    });

    it("should preserve null values", () => {
      const flat = {
        "user.middleName": null,
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { user: { middleName: null } });
    });

    it("should preserve undefined values", () => {
      const flat = {
        "user.suffix": undefined,
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { user: { suffix: undefined } });
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      const flat = {};
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {});
    });

    it("should handle single property", () => {
      const flat = { name: "John" };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { name: "John" });
    });

    it("should handle numeric string keys", () => {
      const flat = {
        "items.0": "first",
        "items.1": "second",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { items: ["first", "second"] });
    });

    it("should handle special characters in values", () => {
      const flat = {
        "user.email": "test@example.com",
        "user.password": "p@$$w0rd!",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: {
          email: "test@example.com",
          password: "p@$$w0rd!",
        },
      });
    });

    it("should overwrite values for duplicate paths", () => {
      // Create object with duplicate keys using Object.assign
      const flat = Object.assign({}, { "user.name": "John" }, { "user.name": "Jane" });
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, { user: { name: "Jane" } });
    });
  });

  describe("real-world scenarios", () => {
    it("should convert form errors", () => {
      const flat = {
        "user.name": "Name is required",
        "user.email": "Invalid email format",
        "addresses[0].city": "City is required",
        "addresses[0].zip": "Invalid zip code",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        user: {
          name: "Name is required",
          email: "Invalid email format",
        },
        addresses: [
          {
            city: "City is required",
            zip: "Invalid zip code",
          },
        ],
      });
    });

    it("should convert query parameters", () => {
      const flat = {
        "filter.status": "active",
        "filter.category": "electronics",
        "sort.field": "price",
        "sort.order": "asc",
        page: "1",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        filter: {
          status: "active",
          category: "electronics",
        },
        sort: {
          field: "price",
          order: "asc",
        },
        page: "1",
      });
    });

    it("should convert nested form data", () => {
      const flat = {
        title: "My Post",
        "author.name": "John Doe",
        "author.id": "123",
        "tags[0]": "typescript",
        "tags[1]": "forms",
        "tags[2]": "validation",
        "metadata.createdAt": "2024-01-01",
        "metadata.updatedAt": "2024-01-02",
      };
      const result = flatObjectToNestedObject(flat);
      assert.deepEqual(result, {
        title: "My Post",
        author: {
          name: "John Doe",
          id: "123",
        },
        tags: ["typescript", "forms", "validation"],
        metadata: {
          createdAt: "2024-01-01",
          updatedAt: "2024-01-02",
        },
      });
    });
  });
});
