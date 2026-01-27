import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nestedObjectToFlatObject } from "./nested-object-to-flat-object.ts";

describe("nestedObjectToFlatObject()", () => {
  describe("with simple object structures", () => {
    it("should convert nested object with single level", () => {
      const nested = {
        name: "John",
        email: "john@example.com",
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        name: "John",
        email: "john@example.com",
      });
    });

    it("should convert nested object with multiple levels", () => {
      const nested = {
        user: {
          name: "John",
          email: "john@example.com",
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.name": "John",
        "user.email": "john@example.com",
      });
    });

    it("should handle deeply nested properties", () => {
      const nested = {
        user: {
          profile: {
            address: {
              street: "123 Main St",
              city: "New York",
            },
          },
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.profile.address.street": "123 Main St",
        "user.profile.address.city": "New York",
      });
    });
  });

  describe("with array structures", () => {
    it("should convert arrays with bracket notation", () => {
      const nested = {
        addresses: [
          { city: "San Francisco", state: "California" },
          { city: "New York", state: "New York" },
        ],
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "addresses[0].city": "San Francisco",
        "addresses[0].state": "California",
        "addresses[1].city": "New York",
        "addresses[1].state": "New York",
      });
    });

    it("should handle top-level arrays", () => {
      const nested = ["first", "second", "third"];
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "[0]": "first",
        "[1]": "second",
        "[2]": "third",
      });
    });

    it("should handle nested arrays", () => {
      const nested = {
        matrix: [
          ["a", "b"],
          ["c", "d"],
        ],
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "matrix[0][0]": "a",
        "matrix[0][1]": "b",
        "matrix[1][0]": "c",
        "matrix[1][1]": "d",
      });
    });

    it("should handle sparse arrays", () => {
      const nested: { items: string[] } = { items: [] };
      nested.items[0] = "first";
      nested.items[5] = "sixth";
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "items[0]": "first",
        "items[5]": "sixth",
      });
    });

    it("should handle arrays of primitives", () => {
      const nested = {
        tags: ["typescript", "forms", "validation"],
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "tags[0]": "typescript",
        "tags[1]": "forms",
        "tags[2]": "validation",
      });
    });
  });

  describe("with mixed structures", () => {
    it("should handle objects inside arrays", () => {
      const nested = {
        users: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
        ],
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "users[0].name": "Alice",
        "users[0].age": 25,
        "users[1].name": "Bob",
        "users[1].age": 30,
      });
    });

    it("should handle arrays inside objects", () => {
      const nested = {
        user: {
          name: "John",
          addresses: [{ city: "SF", zip: "94102" }],
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.name": "John",
        "user.addresses[0].city": "SF",
        "user.addresses[0].zip": "94102",
      });
    });

    it("should handle complex nested structures", () => {
      const nested = {
        company: {
          departments: [
            {
              name: "Engineering",
              employees: [{ name: "Alice", role: "Developer" }],
            },
            { name: "Sales" },
          ],
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "company.departments[0].name": "Engineering",
        "company.departments[0].employees[0].name": "Alice",
        "company.departments[0].employees[0].role": "Developer",
        "company.departments[1].name": "Sales",
      });
    });
  });

  describe("with different value types", () => {
    it("should preserve string values", () => {
      const nested = {
        user: { name: "John Doe" },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, { "user.name": "John Doe" });
    });

    it("should preserve numeric values", () => {
      const nested = {
        user: { age: 30 },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, { "user.age": 30 });
    });

    it("should preserve boolean values", () => {
      const nested = {
        user: { active: true, verified: false },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.active": true,
        "user.verified": false,
      });
    });

    it("should preserve null values", () => {
      const nested = {
        user: { middleName: null },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, { "user.middleName": null });
    });

    it("should preserve undefined values", () => {
      const nested = {
        user: { suffix: undefined },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, { "user.suffix": undefined });
    });

    it("should handle mixed value types", () => {
      const nested = {
        data: {
          string: "text",
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "data.string": "text",
        "data.number": 42,
        "data.boolean": true,
        "data.null": null,
        "data.undefined": undefined,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      const nested = {};
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {});
    });

    it("should handle empty array", () => {
      const nested = { items: [] };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {});
    });

    it("should handle single property", () => {
      const nested = { name: "John" };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, { name: "John" });
    });

    it("should handle special characters in values", () => {
      const nested = {
        user: {
          email: "test@example.com",
          password: "p@$$w0rd!",
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.email": "test@example.com",
        "user.password": "p@$$w0rd!",
      });
    });

    it("should handle numeric string keys", () => {
      const nested = {
        items: ["first", "second"],
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "items[0]": "first",
        "items[1]": "second",
      });
    });
  });

  describe("round-trip conversion", () => {
    it("should be reversible with flatToNested for simple objects", () => {
      const original = {
        user: {
          name: "John",
          email: "john@example.com",
        },
      };
      const flattened = nestedObjectToFlatObject(original);
      assert.deepEqual(flattened, {
        "user.name": "John",
        "user.email": "john@example.com",
      });
    });

    it("should be reversible with flatToNested for arrays", () => {
      const original = {
        addresses: [
          { city: "SF", state: "CA" },
          { city: "NY", state: "NY" },
        ],
      };
      const flattened = nestedObjectToFlatObject(original);
      assert.deepEqual(flattened, {
        "addresses[0].city": "SF",
        "addresses[0].state": "CA",
        "addresses[1].city": "NY",
        "addresses[1].state": "NY",
      });
    });

    it("should be reversible with flatToNested for complex structures", () => {
      const original = {
        company: {
          name: "Acme Inc",
          departments: [
            { name: "Engineering", headCount: 50 },
            { name: "Sales", headCount: 30 },
          ],
        },
      };
      const flattened = nestedObjectToFlatObject(original);
      assert.deepEqual(flattened, {
        "company.name": "Acme Inc",
        "company.departments[0].name": "Engineering",
        "company.departments[0].headCount": 50,
        "company.departments[1].name": "Sales",
        "company.departments[1].headCount": 30,
      });
    });
  });

  describe("real-world scenarios", () => {
    it("should convert form errors to flat format", () => {
      const nested = {
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
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "user.name": "Name is required",
        "user.email": "Invalid email format",
        "addresses[0].city": "City is required",
        "addresses[0].zip": "Invalid zip code",
      });
    });

    it("should convert nested configuration", () => {
      const nested = {
        server: {
          host: "localhost",
          port: 3000,
        },
        database: {
          connection: {
            host: "db.example.com",
            port: 5432,
          },
        },
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        "server.host": "localhost",
        "server.port": 3000,
        "database.connection.host": "db.example.com",
        "database.connection.port": 5432,
      });
    });

    it("should convert blog post structure", () => {
      const nested = {
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
      };
      const result = nestedObjectToFlatObject(nested);
      assert.deepEqual(result, {
        title: "My Post",
        "author.name": "John Doe",
        "author.id": "123",
        "tags[0]": "typescript",
        "tags[1]": "forms",
        "tags[2]": "validation",
        "metadata.createdAt": "2024-01-01",
        "metadata.updatedAt": "2024-01-02",
      });
    });
  });
});
