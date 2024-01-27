import { CreateHistory } from '$core'
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

export const useRouterState = () => {
  const [state, setState] = useState(summaryState)

  useEffect(() => {
    const cleanup = watchSummaryState(setState)

    return cleanup
  }, [])

  return state
}

export const useRoute = () => {
  const [state, setState] = useState(routeState)

  useEffect(() => {
    const cleanup = watchRouteState(setState)

    return cleanup
  }, [])

  return state
}
