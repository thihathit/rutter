## About

**Rutter** is a framework-agnostic, lightweight router. Built with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) & [History](https://developer.mozilla.org/en-US/docs/Web/API/History_API) API. Internal reactivity is powered by [Signal](https://github.com/preactjs/signals).

> This library doesn't ship polyfill for `URLPattern`. You may consider installing [urlpattern-polyfill](https://www.npmjs.com/package/urlpattern-polyfill).

## Usage

### VanillaJS

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

### ReactJS: Create your own bindings

```ts
// router.(ts|js)

import { CreateHistory } from 'rutter'
import { useEffect, useState } from 'react'

/**
 * Note: you cannot destructure/re-export `router` instance's methods directly.
 *
 * Unless you re-bind `router` instance to the function.
 */
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

export const redirect = router.redirect.bind(router)
export const on = router.on.bind(router)

export const useRouterState = () => {
  const [state, setState] = useState(router.summaryState)

  useEffect(() => router.watchSummaryState(setState), [])

  return state
}

export const useRoute = () => {
  const [state, setState] = useState(router.routeState)

  useEffect(() => router.watchRouteState(setState), [])

  return state
}
```

```tsx
// app.(tsx|jsx)

import { FC } from 'react'

import { on, redirect, useRoute } from './router'

const App: FC = () => {
  const route = useRoute()

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
          {route.is404 ? (
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
          <pre>{JSON.stringify(route, null, 2)}</pre>
        </code>
      </fieldset>
    </>
  )
}
```

## Documentation

Type API: https://paka.dev/npm/rutter/api

## Development

```bash
pnpm i
pnpm dev
```
