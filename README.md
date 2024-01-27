## About

**Rutter** is a framework-agnostic, lightweight router. Built with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) & [History](https://developer.mozilla.org/en-US/docs/Web/API/History_API) API. Internal reactivity is powered by [Signal](https://github.com/preactjs/signals).

> This library doesn't ship polyfill for `URLPattern`. You may consider installing [urlpattern-polyfill](https://www.npmjs.com/package/urlpattern-polyfill).

## Usage

- [<img src="./docs/logos/javascript.svg" width="14"/> Vanilla JS](#-vanillajs)
- [<img src="./docs/logos/vue.svg" width="14"/> Vue](#-vue-bindings-via-shallowrefcomputed)
- [<img src="./docs/logos/react.svg" width="14"/> React](#-react-bindings-via-usestatecontext)
- [<img src="./docs/logos/svelte.svg" width="14"/> Svelte](#-svelte-bindings-via-readablederived)

### <img src="./docs/logos/javascript.svg" width="14"/> VanillaJS

```ts
import { CreateHistory } from 'rutter'

const router = new CreateHistory({
  routes: {
    index: {
      pathname: ''
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

### <img src="./docs/logos/react.svg" width="14"/> React bindings: via `useState`/`context`

```tsx
// router.(tsx|jsx)

import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { CreateHistory } from 'rutter'

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
      pathname: ''
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

/**
 * Although using with `context` is recommended for performance reason, you can directly use this hook if you don't want to store all the states in `context` tree.
 */
export const useRouterValues = () => {
  const [routeStateValue, setRouteStateState] = useState(routeState)
  const [summaryStateValue, setSummaryStateState] = useState(summaryState)

  useEffect(() => watchRouteState(setRouteStateState), [])
  useEffect(() => watchSummaryState(setSummaryStateState), [])

  return {
    routeState: routeStateValue,
    summaryState: summaryStateValue
  }
}

const context = createContext({
  routeState,
  summaryState
})

const useRouterContext = () => useContext(context)

export const RouterProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useRouterValues()

  return <context.Provider value={value}>{children}</context.Provider>
}

export const useRoute = () => {
  const { routeState } = useRouterContext()

  return routeState
}
```

```tsx
// app.(tsx|jsx)

import { FC } from 'react'

import { on, redirect, useRoute, RouterProvider } from './router'

const Routing: FC = () => {
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

const App: FC = () => (
  <RouterProvider>
    <Routing />
  </RouterProvider>
)
```

### <img src="./docs/logos/vue.svg" width="14"/> Vue bindings: via `shallowRef`/`computed`

```ts
// router.(ts|js)

import { computed, shallowRef } from 'vue'
import { CreateHistory } from 'rutter'

import { mapValues } from 'lodash-es'

const router = new CreateHistory({
  routes: {
    index: {
      pathname: ''
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

const {
  //
  summaryState,
  routeState,
  watchSummaryState,
  watchRouteState,
  on
} = router

export const { redirect } = router

export const routerState = shallowRef(summaryState)
export const route = shallowRef(routeState)

export const is404 = computed(() => route.value.is404)

export const matches = computed(() => {
  const { details } = routerState.value

  type RouteNames = keyof typeof details

  return mapValues(details, (_, name) => on(name as RouteNames))
})

watchSummaryState(state => {
  routerState.value = state
})

watchRouteState(state => {
  route.value = state
})
```

```vue
<script setup lang="ts">
// app.vue
import { redirect, route, matches, is404 } from './router'
</script>

<template>
  <nav>
    <button @click="() => redirect('index')">Index</button>

    <button @click="() => redirect('blog')">Blog</button>

    <a href="/invalid-url">
      <button>404</button>
    </a>
  </nav>

  <fieldset>
    <legend>Body:</legend>
    <div>
      <h1 v-if="is404">404 Page</h1>

      <template v-else>
        <h1 v-if="matches.index">Index Page</h1>

        <h1 v-if="matches.about">About Page</h1>

        <template v-if="matches.blog">
          <h1>Blog Page</h1>

          <button
            @click="() => redirect('blogDetail', { params: { id: 123 } })"
          >
            Blog Detail
          </button>
        </template>

        <h1 v-if="matches.blogDetail">Blog Detail Page</h1>
      </template>
    </div>
  </fieldset>

  <fieldset>
    <legend>Current route detail:</legend>

    <code>
      <pre>{{ route }}</pre>
    </code>
  </fieldset>
</template>
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
      pathname: ''
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
