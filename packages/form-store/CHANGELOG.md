# `form-store` CHANGELOG

This is the changelog for [`form-store`](https://github.com/typed-web/typed-web/tree/main/packages/form-store). It follows [semantic versioning](https://semver.org/).

## v0.2.0 (2026-02-17)

- Rename `unshift` to `shift` in `FormStore` array operations
- Refactor `setNested` from recursive to iterative implementation with shallow copying
- Add smart batch notification deduplication for ancestor/descendant path relationships
- Simplify subscriber initialization in `subscribe`
- Extract `keyToPath` helper to deduplicate path parsing logic
- Fix `swap` bounds checking

## v0.1.1 (2026-01-27)

- Initial release
- `createFormStore` - Create type-safe form stores
- Type-safe tuple paths for nested value access
- Subscriber pattern for reactive updates
- Batch updates support
- TypeScript type definitions: `FormStore`, `TuplePaths`, `TuplePathValue`
