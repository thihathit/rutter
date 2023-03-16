import { CreateHistory } from '$core'
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

  useEffect(() => {
    const cleanup = router.watchSummaryState(setState)

    return cleanup
  }, [])

  return state
}

export const useRoute = () => {
  const [state, setState] = useState(router.routeState)

  useEffect(() => {
    const cleanup = router.watchRouteState(setState)

    return cleanup
  }, [])

  return state
}
