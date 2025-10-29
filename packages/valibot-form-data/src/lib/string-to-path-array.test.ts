import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stringToPathArray } from "./string-to-path-array.ts";

describe('The "stringToPathArray" function', () => {
  describe("with empty path", () => {
    it("should return empty array for empty string", () => {
      assert.deepStrictEqual(stringToPathArray(""), []);
    });
  });

  describe("with bracket notation", () => {
    it("should parse single bracket notation with string key", () => {
      assert.deepStrictEqual(stringToPathArray("[key]"), ["key"]);
    });

    it("should parse single bracket notation with numeric key", () => {
      assert.deepStrictEqual(stringToPathArray("[0]"), [0]);
    });

    it("should parse bracket notation with multiple numeric keys", () => {
      assert.deepStrictEqual(stringToPathArray("[0][1][2]"), [0, 1, 2]);
    });

    it("should parse bracket notation with mixed string and numeric keys", () => {
      assert.deepStrictEqual(stringToPathArray("[users][0][name]"), ["users", 0, "name"]);
    });

    it("should parse bracket notation with large numbers", () => {
      assert.deepStrictEqual(stringToPathArray("[123][456]"), [123, 456]);
    });

    it("should parse bracket notation with alphanumeric keys", () => {
      assert.deepStrictEqual(stringToPathArray("[user1][item2a]"), ["user1", "item2a"]);
    });
  });

  describe("with dot notation", () => {
    it("should parse single property without leading dot", () => {
      assert.deepStrictEqual(stringToPathArray("name"), ["name"]);
    });

    it("should parse single property with leading dot", () => {
      assert.deepStrictEqual(stringToPathArray(".name"), ["name"]);
    });

    it("should parse multiple properties with dots", () => {
      assert.deepStrictEqual(stringToPathArray("user.profile.name"), ["user", "profile", "name"]);
    });

    it("should parse properties starting with dot", () => {
      assert.deepStrictEqual(stringToPathArray(".user.profile.name"), ["user", "profile", "name"]);
    });

    it("should parse numeric strings as numbers in dot notation", () => {
      assert.deepStrictEqual(stringToPathArray("user.123.name"), ["user", 123, "name"]);
    });
  });

  describe("with mixed notation", () => {
    it("should parse combination of dot and bracket notation", () => {
      assert.deepStrictEqual(stringToPathArray("users[0].profile.name"), [
        "users",
        0,
        "profile",
        "name",
      ]);
    });

    it("should parse bracket notation followed by dot notation", () => {
      assert.deepStrictEqual(stringToPathArray("[0].title"), [0, "title"]);
    });

    it("should parse dot notation followed by bracket notation", () => {
      assert.deepStrictEqual(stringToPathArray("users.0[name]"), ["users", 0, "name"]);
    });

    it("should parse complex mixed paths", () => {
      assert.deepStrictEqual(stringToPathArray("data.items[0].metadata[config].value"), [
        "data",
        "items",
        0,
        "metadata",
        "config",
        "value",
      ]);
    });

    it("should parse path starting with bracket and continuing with dots", () => {
      assert.deepStrictEqual(stringToPathArray("[users].profile.settings"), [
        "users",
        "profile",
        "settings",
      ]);
    });
  });

  describe("with edge cases", () => {
    it("should handle single character keys", () => {
      assert.deepStrictEqual(stringToPathArray("a.b.c"), ["a", "b", "c"]);
      assert.deepStrictEqual(stringToPathArray("[a][b][c]"), ["a", "b", "c"]);
    });

    it("should handle underscores and dashes in property names", () => {
      assert.deepStrictEqual(stringToPathArray("user_name.first-name"), [
        "user_name",
        "first-name",
      ]);
    });

    it("should handle keys with special characters in bracket notation", () => {
      assert.deepStrictEqual(stringToPathArray("[user-name][first_name]"), [
        "user-name",
        "first_name",
      ]);
    });

    it("should handle zero as numeric key", () => {
      assert.deepStrictEqual(stringToPathArray("[0]"), [0]);
      assert.deepStrictEqual(stringToPathArray("items[0].name"), ["items", 0, "name"]);
    });
  });

  describe("with invalid syntax", () => {
    it("should handle double opening brackets", () => {
      assert.deepStrictEqual(stringToPathArray("invalid[[path"), ["invalid[[path"]);
    });

    it("should handle double closing brackets", () => {
      assert.deepStrictEqual(stringToPathArray("test]]"), ["test]]"]);
    });

    it("should handle empty brackets", () => {
      assert.deepStrictEqual(stringToPathArray("[]"), ["[]"]);
    });

    it("should handle unclosed brackets", () => {
      assert.deepStrictEqual(stringToPathArray("[unclosed"), ["[unclosed"]);
    });

    it("should handle unopened brackets", () => {
      assert.deepStrictEqual(stringToPathArray("unopened]"), ["unopened]"]);
    });

    it("should handle brackets with only opening bracket at start", () => {
      assert.deepStrictEqual(stringToPathArray("[user.name"), ["[user.name"]);
    });

    it("should handle mixed invalid patterns in middle of path", () => {
      assert.deepStrictEqual(stringToPathArray("valid.[[invalid"), ["valid.[[invalid"]);
    });

    it("should handle empty brackets in middle of path", () => {
      assert.deepStrictEqual(stringToPathArray("user[].name"), ["user[].name"]);
    });
  });
});
