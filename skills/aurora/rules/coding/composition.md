# Composition Patterns

Load this file only when **creating new components**, not when assembling existing ones.

Franco's synthesis from Vercel's React composition patterns.

## No boolean prop proliferation

Each boolean prop doubles possible states and creates unmaintainable conditionals.
When a component needs to behave differently in different contexts — create explicit variants.

```tsx
// Wrong — what does this actually render?
<Composer isThread isEditing={false} showAttachments channelId="abc" />

// Right — self-documenting
<ThreadComposer channelId="abc" />
<EditComposer messageId="xyz" />
```

Each variant composes the pieces it needs. No hidden conditionals, no impossible states.

## Compound components for complex UI

Structure complex components as compound components with shared context.
Subcomponents access shared state via context — not prop drilling.

```tsx
const Composer = {
  Provider: ComposerProvider,  // owns state
  Frame: ComposerFrame,        // structural wrapper
  Input: ComposerInput,        // reads context
  Submit: ComposerSubmit,      // reads context
  Footer: ComposerFooter,
}

// Consumer composes exactly what it needs
<Composer.Provider state={state} actions={actions} meta={meta}>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Footer>
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

## Context interface: state / actions / meta

Define a generic interface that any provider can implement.
UI components consume the interface — not the implementation.
This enables dependency injection: swap the provider, keep the UI.

```tsx
interface ComposerContextValue {
  state: ComposerState       // current data
  actions: ComposerActions   // what can change
  meta: ComposerMeta         // refs, ids, non-reactive values
}
```

Providers implement the interface. The same `<Composer.Input />` works
with a local state provider and a global synced provider — because it only
knows the interface.

## Children over render props

Composition through `children` is simpler and more flexible than `renderX` props:

```tsx
// Wrong — render prop
<Card renderHeader={() => <Title>Hello</Title>} />

// Right — children
<Card>
  <Card.Header><Title>Hello</Title></Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

## Lift state to providers

When sibling components need shared state, lift it into a provider:

```tsx
// Wrong — prop drilling or duplicated state
<Parent>
  <ComponentA value={value} onChange={setValue} />
  <ComponentB value={value} />
</Parent>

// Right — provider owns the state
<FeatureProvider>
  <ComponentA />  {/* reads from context */}
  <ComponentB />  {/* reads from context */}
</FeatureProvider>
```

## React 19: no forwardRef

In React 19, refs are passed as regular props. `forwardRef` is deprecated.

```tsx
// Wrong (React 19)
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} {...props} />
))

// Right (React 19)
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

Use `use(Context)` instead of `useContext(Context)` for cleaner reads.
