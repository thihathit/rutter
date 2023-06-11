## About

**Rutter** is a framework-agnostic, lightweight router. Built with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) & [History](https://developer.mozilla.org/en-US/docs/Web/API/History_API) API. Internal reactivity is powered by [Signal](https://github.com/preactjs/signals).

> This library doesn't ship polyfill for `URLPattern`. You may consider installing [urlpattern-polyfill](https://www.npmjs.com/package/urlpattern-polyfill).

## Usage

- [<img src="./docs/logos/javascript.svg" width="14"/> Vanilla JS](#-vanillajs)
- [<img src="./docs/logos/react.svg" width="14"/> React](#-react-bindings-via-usestate)
- [<img src="./docs/logos/svelte.svg" width="14"/> Svelte](#-svelte-bindings-via-readablederived)

### <img src="./docs/logos/javascript.svg" width="14"/> VanillaJS

```ts
import { CreateHistory } from 'rutter'

const router = new CreateHistory({
  routes: {
    index: {
      pathname: '/'
    },
    about: {
      pathname: '/about'
    },
    blog: {
      pathname: '/blog'
    },
    blogDetail: {
      pathname: '/blog/:id'
    }
  }
})

router.on('index') // boolean
router.onOneOf(['index', 'about']) // boolean
```

### <img src="./docs/logos/react.svg" width="14"/> React bindings: via `useState`

```ts
// router.(ts|js)

import { CreateHistory } from 'rutter'
import { useEffect, useState } from 'react'

export const {
  redirect,
  on,
  summaryState,
  routeState,
  watchSummaryState,
  watchRouteState
} = new CreateHistory({
  routes: {
    index: {
      pathname: '/'
    },
    about: {
      pathname: '/about'
    },
    blog: {
      pathname: '/blog'
    },
    blogDetail: {
      pathname: '/blog/:id'
    }
  }
})

export const useRouterState = () => {
  const [state, setState] = useState(summaryState)

  useEffect(() => watchSummaryState(setState), [])

  return state
}

export const useRoute = () => {
  const [state, setState] = useState(routeState)

  useEffect(() => watchRouteState(setState), [])

  return state
}
```

```tsx
// app.(tsx|jsx)

import { FC } from 'react'

import { on, redirect, useRoute } from './router'

const App: FC = () => {
  const { is404, ...restStates } = useRoute()

  return (
    <>
      <nav>
        <button onClick={() => redirect('index')}>Index</button>

        <button onClick={() => redirect('blog')}>Blog</button>

        <a href="/invalid-url">
          <button>404</button>
        </a>
      </nav>

      <fieldset>
        <legend>Body:</legend>

        <div>
          {is404 ? (
            <h1>404 Page</h1>
          ) : (
            <>
              {on('index') && <h1>Index Page</h1>}

              {on('about') && <h1>About Page</h1>}

              {on('blog') && (
                <>
                  <h1>Blog Page</h1>

                  <button
                    onClick={() =>
                      redirect('blogDetail', {
                        params: {
                          id: 123
                        }
                      })
                    }
                  >
                    Blog Detail
                  </button>
                </>
              )}

              {on('blogDetail') && <h1>Blog Detail Page</h1>}
            </>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Current route detail:</legend>

        <code>
          <pre>{JSON.stringify(restStates, null, 2)}</pre>
        </code>
      </fieldset>
    </>
  )
}
```

### <img src="./docs/logos/svelte.svg" width="14"/> Svelte bindings: via `readable`/`derived`

```ts
// router.(ts|js)

import { readable, derived } from 'svelte/store'
import { CreateHistory } from 'rutter'
import { mapValues } from 'lodash-es'

const router = new CreateHistory({
  routes: {
    index: {
      pathname: '/'
    },
    about: {
      pathname: '/about'
    },
    blog: {
      pathname: '/blog'
    },
    blogDetail: {
      pathname: '/blog/:id'
    }
  }
})

const { summaryState, routeState, watchSummaryState, watchRouteState } = router

export const { redirect, on, onOneOf } = router

export const route = readable(routeState, watchRouteState)
export const routerState = readable(summaryState, watchSummaryState)

export const matches = derived(routerState, ({ details }) =>
  mapValues(details, (_, name) => on(name as keyof typeof details))
)
```

```svelte
<script lang="ts">
  // app.svelte

  import { redirect, route, matches } from './router'

  $: ({ is404, ...restState } = $route)
  $: data = JSON.stringify(restState, null, 2)
</script>

<nav>
  <button on:click={() => redirect('index')}>Index</button>

  <button on:click={() => redirect('blog')}>Blog</button>

  <a href="/invalid-url">
    <button>404</button>
  </a>
</nav>

<fieldset>
  <legend>Body:</legend>

  <div>
    {#if is404}
      <h1>404 Page</h1>
    {:else}
      {#if $matches.index}
        <h1>Index Page</h1>
      {/if}

      {#if $matches.about}
        <h1>About Page</h1>
      {/if}

      {#if $matches.blog}
        <h1>Blog Page</h1>

        <button
          on:click={() => redirect('blogDetail', { params: { id: 123 } })}
        >
          Blog Detail
        </button>
      {/if}

      {#if $matches.blogDetail}
        <h1>Blog Detail Page</h1>
      {/if}
    {/if}
  </div>
</fieldset>

<fieldset>
  <legend>Current route detail:</legend>

  <code>
    <pre>{data}</pre>
  </code>
</fieldset>

```

## Documentation

Type API: https://paka.dev/npm/rutter/api

## Development

```bash
pnpm i
pnpm dev
```
