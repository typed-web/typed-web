import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setPath } from "./set-path.ts";

describe('The "setPath" function', () => {
  describe("with object paths", () => {
    it("should set a simple property on an empty object", () => {
      const obj = {};
      const result = setPath(obj, "name", "John");

      assert.deepStrictEqual(result, { name: "John" });
      assert.strictEqual(result, obj);
    });

    it("should set a nested property creating intermediate objects", () => {
      const obj = {};
      setPath(obj, "user.profile.name", "Alice");

      assert.deepStrictEqual(obj, {
        user: {
          profile: {
            name: "Alice",
          },
        },
      });
    });

    it("should overwrite existing properties", () => {
      const obj = { user: { name: "Old Name" } };
      setPath(obj, "user.name", "New Name");

      assert.deepStrictEqual(obj, {
        user: {
          name: "New Name",
        },
      });
    });

    it("should preserve existing properties when setting new ones", () => {
      const obj = { user: { name: "John", age: 30 } };
      setPath(obj, "user.email", "john@example.com");

      assert.deepStrictEqual(obj, {
        user: {
          name: "John",
          age: 30,
          email: "john@example.com",
        },
      });
    });
  });

  describe("with array paths", () => {
    it("should create and set array element", () => {
      const obj = {};
      setPath(obj, "users[0]", "Alice");

      assert.deepStrictEqual(obj, {
        users: ["Alice"],
      });
    });

    it("should set multiple array elements", () => {
      const obj = {};
      setPath(obj, "users[0]", "Alice");
      setPath(obj, "users[1]", "Bob");
      setPath(obj, "users[2]", "Charlie");

      assert.deepStrictEqual(obj, {
        users: ["Alice", "Bob", "Charlie"],
      });
    });

    it("should create sparse arrays when setting non-consecutive indices", () => {
      const obj: Record<string, unknown> = {};
      setPath(obj, "items[0]", "first");
      setPath(obj, "items[3]", "fourth");

      // Check array length and specific indices since sparse arrays have empty slots
      const items = obj.items as unknown[];
      assert.strictEqual(items.length, 4);
      assert.strictEqual(items[0], "first");
      assert.strictEqual(items[3], "fourth");
      // Empty slots are not strictly equal to undefined but accessing them returns undefined
      assert.strictEqual(items[1], undefined);
      assert.strictEqual(items[2], undefined);
    });

    it("should set nested array properties", () => {
      const obj = {};
      setPath(obj, "users[0].name", "Alice");
      setPath(obj, "users[0].age", 25);

      assert.deepStrictEqual(obj, {
        users: [
          {
            name: "Alice",
            age: 25,
          },
        ],
      });
    });

    it("should handle multi-dimensional arrays", () => {
      const obj = {};
      setPath(obj, "matrix[0][0]", 1);
      setPath(obj, "matrix[0][1]", 2);
      setPath(obj, "matrix[1][0]", 3);
      setPath(obj, "matrix[1][1]", 4);

      assert.deepStrictEqual(obj, {
        matrix: [
          [1, 2],
          [3, 4],
        ],
      });
    });
  });

  describe("with mixed notation paths", () => {
    it("should handle object followed by array", () => {
      const obj = {};
      setPath(obj, "users[0].hobbies[0]", "reading");
      setPath(obj, "users[0].hobbies[1]", "swimming");

      assert.deepStrictEqual(obj, {
        users: [
          {
            hobbies: ["reading", "swimming"],
          },
        ],
      });
    });

    it("should handle array followed by object", () => {
      const obj = {};
      setPath(obj, "data.items[0].metadata.type", "document");

      assert.deepStrictEqual(obj, {
        data: {
          items: [
            {
              metadata: {
                type: "document",
              },
            },
          ],
        },
      });
    });

    it("should handle complex mixed paths", () => {
      const obj = {};
      setPath(obj, "config[database][connections][0].host", "localhost");
      setPath(obj, "config[database][connections][0].port", 5432);

      assert.deepStrictEqual(obj, {
        config: {
          database: {
            connections: [
              {
                host: "localhost",
                port: 5432,
              },
            ],
          },
        },
      });
    });
  });

  describe("with numeric string keys in dot notation", () => {
    it("should create array elements for numeric strings", () => {
      const obj = {};
      setPath(obj, "data.0.value", "first");
      setPath(obj, "data.1.value", "second");

      assert.deepStrictEqual(obj, {
        data: [{ value: "first" }, { value: "second" }],
      });
    });

    it("should handle mixed numeric and string keys in separate paths", () => {
      const obj = {};
      setPath(obj, "data.items.0[name]", "Item Zero");
      setPath(obj, "data.meta.first.name", "First Item");

      assert.deepStrictEqual(obj, {
        data: {
          items: [{ name: "Item Zero" }],
          meta: { first: { name: "First Item" } },
        },
      });
    });
  });

  describe("with different value types", () => {
    it("should set string values", () => {
      const obj = {};
      setPath(obj, "text", "Hello World");
      assert.deepStrictEqual(obj, { text: "Hello World" });
    });

    it("should set number values", () => {
      const obj = {};
      setPath(obj, "count", 42);
      assert.deepStrictEqual(obj, { count: 42 });
    });

    it("should set boolean values", () => {
      const obj = {};
      setPath(obj, "isEnabled", true);
      assert.deepStrictEqual(obj, { isEnabled: true });
    });

    it("should set null values", () => {
      const obj = {};
      setPath(obj, "nullable", null);
      assert.deepStrictEqual(obj, { nullable: null });
    });

    it("should set undefined values", () => {
      const obj = {};
      setPath(obj, "optional", undefined);
      assert.deepStrictEqual(obj, { optional: undefined });
    });

    it("should set object values", () => {
      const obj = {};
      const complexValue = { nested: { data: "value" } };
      setPath(obj, "complex", complexValue);
      assert.deepStrictEqual(obj, { complex: complexValue });
    });

    it("should set array values", () => {
      const obj = {};
      const arrayValue = [1, 2, 3];
      setPath(obj, "list", arrayValue);
      assert.deepStrictEqual(obj, { list: arrayValue });
    });
  });

  describe("error cases", () => {
    it("should throw error for empty path", () => {
      const obj = {};
      assert.throws(() => setPath(obj, "", "value"), {
        message: "Cannot set value on empty path",
      });
    });

    it("should throw error when trying to navigate through non-object", () => {
      const obj = { user: "string value" };
      assert.throws(() => setPath(obj, "user.name", "John"), {
        message: 'Cannot navigate through path: expected object at segment "user", got string',
      });
    });

    it("should throw error when trying to navigate through explicitly set null", () => {
      const obj = {};
      // First, explicitly set a property to null
      setPath(obj, "user", null);

      // Then try to navigate through that null value - should throw
      assert.throws(() => setPath(obj, "user.name", "John"), {
        message: 'Cannot navigate through path: expected object at segment "user", got object',
      });
    });

    it("should throw error when trying to navigate through explicitly set undefined", () => {
      const obj = {};
      // First, explicitly set a property to undefined
      setPath(obj, "config", undefined);

      // Then try to navigate through that undefined value - should throw
      assert.throws(() => setPath(obj, "config.database.host", "localhost"), {
        message: 'Cannot navigate through path: expected object at segment "config", got undefined',
      });
    });

    it("should throw error when trying to navigate through primitive values", () => {
      const obj = { count: 42 };
      assert.throws(() => setPath(obj, "count.value", "test"), {
        message: 'Cannot navigate through path: expected object at segment "count", got number',
      });
    });
  });

  describe("property existence vs value checking", () => {
    it("should respect explicitly set null values", () => {
      const obj = {};
      // Set a property to null intentionally
      setPath(obj, "data", null);

      // Verify it's actually null
      assert.deepStrictEqual(obj, { data: null });

      // Trying to navigate through null should throw (not create new object)
      assert.throws(() => setPath(obj, "data.nested", "value"));
    });

    it("should respect explicitly set undefined values", () => {
      const obj = {};
      // Set a property to undefined intentionally
      setPath(obj, "optional", undefined);

      // Verify it's actually undefined
      assert.deepStrictEqual(obj, { optional: undefined });
      assert.strictEqual("optional" in obj, true); // Property exists but is undefined

      // Trying to navigate through undefined should throw (not create new object)
      assert.throws(() => setPath(obj, "optional.nested", "value"));
    });

    it("should create new properties when they truly don't exist", () => {
      const obj = {};
      // This should work because 'user' property doesn't exist yet
      setPath(obj, "user.profile.name", "John");

      assert.deepStrictEqual(obj, {
        user: { profile: { name: "John" } },
      });
    });
  });

  describe("edge cases", () => {
    it("should handle single character paths", () => {
      const obj = {};
      setPath(obj, "a", "value");
      assert.deepStrictEqual(obj, { a: "value" });
    });

    it("should handle paths with special characters", () => {
      const obj = {};
      setPath(obj, "user-name", "John");
      setPath(obj, "user_email", "john@example.com");

      assert.deepStrictEqual(obj, {
        "user-name": "John",
        user_email: "john@example.com",
      });
    });

    it("should handle zero index properly", () => {
      const obj = {};
      setPath(obj, "items[0]", "first");
      setPath(obj, "data.0", "zero");

      assert.deepStrictEqual(obj, {
        items: ["first"],
        data: ["zero"],
      });
    });

    it("should overwrite different types", () => {
      const obj = { data: "string" };
      setPath(obj, "data", [1, 2, 3]);

      assert.deepStrictEqual(obj, { data: [1, 2, 3] });
    });

    it("should work with existing arrays", () => {
      const obj = { users: ["Alice"] };
      setPath(obj, "users[1]", "Bob");

      assert.deepStrictEqual(obj, { users: ["Alice", "Bob"] });
    });
  });

  describe("return value behavior", () => {
    it("should return the same object reference", () => {
      const obj = {};
      const result = setPath(obj, "test", "value");

      assert.strictEqual(result, obj);
    });

    it("should return the mutated object", () => {
      const obj = { existing: "value" };
      const result = setPath(obj, "new", "property");

      assert.deepStrictEqual(result, {
        existing: "value",
        new: "property",
      });
      assert.strictEqual(result, obj);
    });
  });
});
