# @typed-web/form-react

React hooks and components for type-safe form state management.

## Installation

```bash
npm install @typed-web/form-react @typed-web/form-store
```

## Exports

- `useForm` - Create and manage form state
- `Field` - Render prop component for individual fields
- `FieldArray` - Manage array fields
- `useField` - Hook for subscribing to field changes
- `useFieldArray` - Hook for array field operations

## Usage

```typescript
import { useForm } from '@typed-web/form-react'

type User = {
  name: string
  addresses: Array<{ city: string }>
}

function UserForm() {
  const form = useForm<User>({ name: '', addresses: [] })

  const handleSubmit = () => {
    console.log(form.store.get([])) // Get all values
    form.store.reset() // Reset to initial
  }

  return (
    <form onSubmit={handleSubmit}>
      <form.Field path={['name']}>
        {({ value, setValue }) => (
          <input value={value} onChange={e => setValue(e.target.value)} />
        )}
      </form.Field>

      <form.FieldArray path={['addresses']}>
        {(items, { push, remove }) => (
          <>
            {items.map((_, index) => (
              <div key={index}>
                <form.Field path={['addresses', index, 'city']}>
                  {({ value, setValue }) => (
                    <input value={value} onChange={e => setValue(e.target.value)} />
                  )}
                </form.Field>
                <button onClick={() => remove(index)}>Remove</button>
              </div>
            ))}
            <button onClick={() => push({ city: '' })}>Add</button>
          </>
        )}
      </form.FieldArray>
    </form>
  )
}
```

## License

MIT
