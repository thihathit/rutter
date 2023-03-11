import { FC } from 'react'

import { on, redirect, useRoute } from './router'

export const App: FC = () => {
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

export default App
