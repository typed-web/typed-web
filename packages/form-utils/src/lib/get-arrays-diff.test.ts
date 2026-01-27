import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getArraysDiff } from "./get-arrays-diff.ts";

describe("getArraysDiff()", () => {
  describe("with simple additions and removals", () => {
    it("should detect added items", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const after = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.id === b.id && a.name === b.name,
      });

      assert.deepEqual(result.added, [{ id: "3", name: "Charlie" }]);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, []);
    });

    it("should detect removed items", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ];
      const after = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.id === b.id && a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, [{ id: "3", name: "Charlie" }]);
      assert.deepEqual(result.modified, []);
    });

    it("should detect both additions and removals", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const after = [
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.id === b.id && a.name === b.name,
      });

      assert.deepEqual(result.added, [{ id: "3", name: "Charlie" }]);
      assert.deepEqual(result.removed, [{ id: "1", name: "Alice" }]);
      assert.deepEqual(result.modified, []);
    });
  });

  describe("with modifications", () => {
    it("should detect modified items", () => {
      const before = [
        { id: "1", name: "Alice", age: 25 },
        { id: "2", name: "Bob", age: 30 },
      ];
      const after = [
        { id: "1", name: "Alice", age: 26 },
        { id: "2", name: "Bob", age: 30 },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.age === b.age,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { id: "1", name: "Alice", age: 25 },
          after: { id: "1", name: "Alice", age: 26 },
        },
      ]);
    });

    it("should detect multiple modifications", () => {
      const before = [
        { id: "1", name: "Alice", status: "active" },
        { id: "2", name: "Bob", status: "inactive" },
        { id: "3", name: "Charlie", status: "active" },
      ];
      const after = [
        { id: "1", name: "Alice", status: "inactive" },
        { id: "2", name: "Bob", status: "active" },
        { id: "3", name: "Charlie", status: "active" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.status === b.status,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { id: "1", name: "Alice", status: "active" },
          after: { id: "1", name: "Alice", status: "inactive" },
        },
        {
          before: { id: "2", name: "Bob", status: "inactive" },
          after: { id: "2", name: "Bob", status: "active" },
        },
      ]);
    });

    it("should detect all three types of changes", () => {
      const before = [
        { id: "1", name: "Alice", role: "admin" },
        { id: "2", name: "Bob", role: "user" },
        { id: "3", name: "Charlie", role: "user" },
      ];
      const after = [
        { id: "1", name: "Alice", role: "superadmin" },
        { id: "3", name: "Charlie", role: "user" },
        { id: "4", name: "Diana", role: "admin" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.role === b.role,
      });

      assert.deepEqual(result.added, [{ id: "4", name: "Diana", role: "admin" }]);
      assert.deepEqual(result.removed, [{ id: "2", name: "Bob", role: "user" }]);
      assert.deepEqual(result.modified, [
        {
          before: { id: "1", name: "Alice", role: "admin" },
          after: { id: "1", name: "Alice", role: "superadmin" },
        },
      ]);
    });
  });

  describe("with different key types", () => {
    it("should work with numeric keys", () => {
      const before = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
      ];
      const after = [
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.value === b.value,
      });

      assert.deepEqual(result.added, [{ id: 3, value: "c" }]);
      assert.deepEqual(result.removed, [{ id: 1, value: "a" }]);
      assert.deepEqual(result.modified, []);
    });

    it("should work with string keys", () => {
      const before = [
        { uuid: "abc-123", data: "x" },
        { uuid: "def-456", data: "y" },
      ];
      const after = [
        { uuid: "def-456", data: "y" },
        { uuid: "ghi-789", data: "z" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.uuid,
        equals: (a, b) => a.data === b.data,
      });

      assert.deepEqual(result.added, [{ uuid: "ghi-789", data: "z" }]);
      assert.deepEqual(result.removed, [{ uuid: "abc-123", data: "x" }]);
      assert.deepEqual(result.modified, []);
    });

    it("should work with composite keys", () => {
      const before = [
        { userId: "1", postId: "100", likes: 5 },
        { userId: "2", postId: "200", likes: 10 },
      ];
      const after = [
        { userId: "1", postId: "100", likes: 5 },
        { userId: "2", postId: "200", likes: 15 },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => `${item.userId}-${item.postId}`,
        equals: (a, b) => a.likes === b.likes,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { userId: "2", postId: "200", likes: 10 },
          after: { userId: "2", postId: "200", likes: 15 },
        },
      ]);
    });
  });

  describe("with custom equality functions", () => {
    it("should use custom equality for deep comparison", () => {
      const before = [
        { id: "1", data: { count: 5, tags: ["a", "b"] } },
        { id: "2", data: { count: 10, tags: ["c"] } },
      ];
      const after = [
        { id: "1", data: { count: 5, tags: ["a", "b"] } },
        { id: "2", data: { count: 10, tags: ["c", "d"] } },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => JSON.stringify(a.data) === JSON.stringify(b.data),
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { id: "2", data: { count: 10, tags: ["c"] } },
          after: { id: "2", data: { count: 10, tags: ["c", "d"] } },
        },
      ]);
    });

    it("should use custom equality for partial comparison", () => {
      const before = [
        { id: "1", name: "Alice", metadata: { timestamp: 100 } },
        { id: "2", name: "Bob", metadata: { timestamp: 200 } },
      ];
      const after = [
        { id: "1", name: "Alice", metadata: { timestamp: 150 } },
        { id: "2", name: "Robert", metadata: { timestamp: 200 } },
      ];

      // Only compare name, ignore metadata
      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { id: "2", name: "Bob", metadata: { timestamp: 200 } },
          after: { id: "2", name: "Robert", metadata: { timestamp: 200 } },
        },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty before array", () => {
      const before: Array<{ id: string; name: string }> = [];
      const after = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, after);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, []);
    });

    it("should handle empty after array", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const after: Array<{ id: string; name: string }> = [];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, before);
      assert.deepEqual(result.modified, []);
    });

    it("should handle both arrays empty", () => {
      const before: Array<{ id: string; name: string }> = [];
      const after: Array<{ id: string; name: string }> = [];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, []);
    });

    it("should handle identical arrays", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const after = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, []);
    });

    it("should handle arrays with different order", () => {
      const before = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const after = [
        { id: "2", name: "Bob" },
        { id: "1", name: "Alice" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, []);
    });

    it("should handle single item arrays", () => {
      const before = [{ id: "1", value: "a" }];
      const after = [{ id: "1", value: "b" }];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.value === b.value,
      });

      assert.deepEqual(result.added, []);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified, [
        {
          before: { id: "1", value: "a" },
          after: { id: "1", value: "b" },
        },
      ]);
    });
  });

  describe("real-world scenarios", () => {
    it("should track form field changes", () => {
      const before = [
        { fieldId: "name", value: "John", touched: false },
        { fieldId: "email", value: "john@example.com", touched: false },
        { fieldId: "age", value: "30", touched: true },
      ];
      const after = [
        { fieldId: "name", value: "John Doe", touched: true },
        { fieldId: "email", value: "john@example.com", touched: false },
        { fieldId: "phone", value: "555-1234", touched: false },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.fieldId,
        equals: (a, b) => a.value === b.value && a.touched === b.touched,
      });

      assert.deepEqual(result.added, [{ fieldId: "phone", value: "555-1234", touched: false }]);
      assert.deepEqual(result.removed, [{ fieldId: "age", value: "30", touched: true }]);
      assert.deepEqual(result.modified, [
        {
          before: { fieldId: "name", value: "John", touched: false },
          after: { fieldId: "name", value: "John Doe", touched: true },
        },
      ]);
    });

    it("should track repeatable form data", () => {
      const before = [
        { id: "1", name: "Item 1", quantity: 1 },
        { id: "2", name: "Item 2", quantity: 2 },
      ];
      const after = [
        { id: "1", name: "Item 1", quantity: 3 },
        { id: "2", name: "Item 2 Updated", quantity: 2 },
        { id: "3", name: "Item 3", quantity: 1 },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.id,
        equals: (a, b) => a.name === b.name && a.quantity === b.quantity,
      });

      assert.deepEqual(result.added, [{ id: "3", name: "Item 3", quantity: 1 }]);
      assert.deepEqual(result.removed, []);
      assert.deepEqual(result.modified.length, 2);
      assert.deepEqual(result.modified[0]?.before, {
        id: "1",
        name: "Item 1",
        quantity: 1,
      });
      assert.deepEqual(result.modified[0]?.after, {
        id: "1",
        name: "Item 1",
        quantity: 3,
      });
      assert.deepEqual(result.modified[1]?.before, {
        id: "2",
        name: "Item 2",
        quantity: 2,
      });
      assert.deepEqual(result.modified[1]?.after, {
        id: "2",
        name: "Item 2 Updated",
        quantity: 2,
      });
    });

    it("should track user list changes", () => {
      const before = [
        { userId: "u1", username: "alice", role: "admin" },
        { userId: "u2", username: "bob", role: "user" },
        { userId: "u3", username: "charlie", role: "user" },
      ];
      const after = [
        { userId: "u1", username: "alice", role: "admin" },
        { userId: "u2", username: "robert", role: "user" },
        { userId: "u4", username: "diana", role: "moderator" },
      ];

      const result = getArraysDiff({
        before,
        after,
        key: (item) => item.userId,
        equals: (a, b) => a.username === b.username && a.role === b.role,
      });

      assert.deepEqual(result.added, [{ userId: "u4", username: "diana", role: "moderator" }]);
      assert.deepEqual(result.removed, [{ userId: "u3", username: "charlie", role: "user" }]);
      assert.deepEqual(result.modified, [
        {
          before: { userId: "u2", username: "bob", role: "user" },
          after: { userId: "u2", username: "robert", role: "user" },
        },
      ]);
    });
  });
});
