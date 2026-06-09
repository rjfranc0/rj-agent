# React Standards

Franco's synthesis from Vercel's React best practices.
Apply all of these by default.

## Derived state lives in render, not in effects

If a value can be computed from props or state, compute it during render.
Do not store it in state, do not sync it with `useEffect`.

```tsx
// Wrong — redundant state + effect
const [fullName, setFullName] = useState('')
useEffect(() => setFullName(`${first} ${last}`), [first, last])

// Right — derive during render
const fullName = `${first} ${last}`
```

## Async: start early, await late

For independent async operations, run them in parallel:

```tsx
// Wrong — sequential waterfall
const user = await fetchUser(id)
const posts = await fetchPosts(id)

// Right — parallel
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)])
```

Use Suspense boundaries to stream data-driven sections:
wrap only the component that needs the data, not the whole page.
The layout renders immediately — only the data-dependent section waits.

## Transitions for non-urgent updates

Non-urgent state updates (scroll position, deferred search results, tab switches) should be wrapped in `startTransition` to keep the UI responsive:

```tsx
startTransition(() => setActiveTab(tab))
```

Use `useTransition` when you need the `isPending` flag for a loading indicator.

## Hoist static JSX outside components

JSX defined at module level is created once, not on every render:

```tsx
// Wrong — new object every render
function Page() {
  const icon = <Icon name="star" />
  return <Button icon={icon} />
}

// Right — created once
const icon = <Icon name="star" />
function Page() {
  return <Button icon={icon} />
}
```

## Dynamic imports for heavy components

Components not needed on initial render should be dynamically imported:

```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
})
```

## Avoid barrel file imports

Import directly from the source file, not from index re-exports:

```tsx
// Wrong — loads entire barrel
import { Button } from '@/components'

// Right — direct import
import { Button } from '@/components/Button'
```

## Functional setState for stable callbacks

When new state depends on previous state, always use the functional form:

```tsx
// Wrong — stale closure risk
setCount(count + 1)

// Right — always correct
setCount(prev => prev + 1)
```

## Animate SVG wrapper, not the SVG element

Animating a `div` wrapper avoids SVG rendering quirks and browser inconsistencies:

```tsx
// Wrong
<motion.svg>...</motion.svg>

// Right
<motion.div><svg>...</svg></motion.div>
```

## Use Set and Map for lookups

O(1) lookup over O(n) array search for repeated membership checks:

```tsx
const selectedIds = new Set(selected.map(item => item.id))
const isSelected = selectedIds.has(item.id) // O(1)
```

## Early exit for guard clauses

Reduce nesting — return early when a condition isn't met:

```tsx
// Wrong — nested
if (user) {
  if (user.isActive) { return <Dashboard /> }
}

// Right — early exit
if (!user || !user.isActive) return null
return <Dashboard />
```
