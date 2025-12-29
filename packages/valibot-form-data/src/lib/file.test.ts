import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import * as v from "valibot";
import { file } from "./file.ts";

describe("file()", () => {
  test("should accept valid files", () => {
    const fileObj = new File(["Hello!"], "hello.txt", { type: "text/plain" });
    assert.strictEqual(v.parse(file(), fileObj), fileObj);
  });

  test("should throw on empty files when required", () => {
    const emptyFile = new File([], "empty.txt", { type: "text/plain" });
    assert.throws(() => v.parse(file(), emptyFile), v.ValiError);
  });

  test("should throw on non-File objects", () => {
    assert.throws(() => v.parse(file(), "not-a-file"), v.ValiError);
    assert.throws(() => v.parse(file(), undefined), v.ValiError);
    assert.throws(() => v.parse(file(), null), v.ValiError);
  });

  test("should allow empty files when optional", () => {
    const emptyFile = new File([], "empty.txt", { type: "text/plain" });
    assert.strictEqual(v.parse(file(v.optional(v.instance(File))), emptyFile), undefined);
  });

  test("should work with custom validation", () => {
    const imageFile = file(v.pipe(v.instance(File), v.mimeType(["image/png"])));
    const pngFile = new File(["data"], "image.png", { type: "image/png" });
    const txtFile = new File(["data"], "file.txt", { type: "text/plain" });

    assert.strictEqual(v.parse(imageFile, pngFile), pngFile);
    assert.throws(() => v.parse(imageFile, txtFile), v.ValiError);
  });
});
