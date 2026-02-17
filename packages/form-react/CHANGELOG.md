# `form-react` CHANGELOG

This is the changelog for [`form-react`](https://github.com/typed-web/typed-web/tree/main/packages/form-react). It follows [semantic versioning](https://semver.org/).

## v0.2.0 (2026-02-17)

- Memoize `subscribe`, `getSnapshot`, and `setValue` callbacks in `useField` and `useFieldArray` with stable path key dependency
- Wrap return values of `useField`, `useFieldArray`, and `useForm` in `useMemo` to prevent unnecessary re-renders
- Memoize array helper methods in `useFieldArray`
- Rename `unshift` to `shift` in `FieldArray` render props and `useFieldArray`

## v0.1.1 (2026-01-27)

- Initial release
- `useForm` - React hook for form state management
- `Field` - Render prop component for individual fields
- `FieldArray` - Component for managing array fields
- `useField` - Hook for subscribing to field changes
- `useFieldArray` - Hook for array field operations
