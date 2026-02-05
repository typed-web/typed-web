# `form-utils` CHANGELOG

This is the changelog for [`form-utils`](https://github.com/typed-web/typed-web/tree/main/packages/form-utils). It follows [semantic versioning](https://semver.org/).

## Unreleased

- Add `objectFromPathEntries` - extracted from `preprocessFormData` to convert path entries array into nested objects
- Update `preprocessFormData` to accept `FormData`, `URLSearchParams`, or plain objects directly

## v0.2.0 (2026-02-05)

- Add `preprocessFormData` - Transform FormData/URLSearchParams entries into nested objects with support for dot notation, bracket notation, and automatic grouping of multiple values

## v0.1.1 (2026-01-27)

- Initial release
- `setValueAtPath` - Set values at nested object paths
- `stringPathToArrayPath` - Parse path strings with dot and bracket notation
- `arrayPathToStringPath` - Convert path arrays to string paths
- `flatObjectToNestedObject` - Convert flat objects to nested structures
- `nestedObjectToFlatObject` - Convert nested objects to flat structures
- `getArraysDiff` - Compute differences between arrays
- TypeScript type definitions: `FlatObject<V>`, `NestedObject<T>`
