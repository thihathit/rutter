import { Signal, signal, computed, effect } from '@preact/signals-core'

import { mapValues, buildURL } from '$utility'

import {
  RouteName,
  Data,
  RedirectMode,
  MainRedirectOptions,
  MetaValue
} from './types'
import { trailingSlash } from './normalizers'

type Options<RN extends RouteName, FieldsMeta extends MetaValue> = {
  /** Register your routes here. */
  routes: Data<RN, FieldsMeta>

  /** Replace with ponyfill. */
  URLPattern?: unknown
}

const getCurrentURL = () => new URL(self.location.toString())

export class CreateHistory<RN extends RouteName, FieldsMeta = MetaValue> {
  #Pattern = URLPattern

  #url = signal(getCurrentURL())

  /** `Reactive` */
  #routeData: Signal<Data<RN, FieldsMeta>>

  /** `Reactive` */
  #withPattern = computed(() =>
    mapValues(
      this.#routeData.value,
      ({ pathname, hash, search, normalize = true, ...rest }) => {
        const patternOptions = { hash, search, pathname }

        if (normalize) {
          if (!trailingSlash.matchAny(pathname)) {
            patternOptions.pathname = `${pathname}{/}?`
          }
        }

        const pattern = new this.#Pattern(patternOptions)

        return {
          pattern,
          normalize,
          ...rest
        }
      }
    )
  )

  /** `Reactive` */
  #details = computed(() =>
    mapValues(this.#withPattern.value, routeData => ({
      ...routeData,

      /** `Matched against current route` */
      isMatch: routeData.pattern.test(this.#url.value),

      /** `Matched against current route. In details` */
      detail: routeData.pattern.exec(this.#url.value)
    }))
  )

  /** `Reactive` */
  #current = computed(() => {
    const details = this.#details.value

    const routeNames = Object.keys(details) as RN[]

    const route = routeNames
      .map(name => ({
        name,
        route: details[name]
      }))
      .filter(({ route }) => !route.ignore)
      .find(({ route }) => route.isMatch)

    return route?.name
  })

  /** `Reactive` */
  #route = computed(() => {
    const url = this.#url.value
    const info = this.getCurrentDetail()

    const detail = info?.detail
    const name = info?.name

    const is404 = info === undefined
    const params = {
      ...detail?.pathname.groups
    }
    const hash = url.hash

    const search = new URLSearchParams(url.search)
    const queryParams = Object.fromEntries(search)

    return {
      name,
      is404,
      params,
      queryParams,
      hash,
      info
    }
  })

  /** `Reactive` */
  #summary = computed(() => ({
    url: this.#url.value,
    routeData: this.#routeData.value,
    withPattern: this.#withPattern.value,
    details: this.#details.value,
    route: this.#route.value,
    current: this.#current.value
  }))

  /** Registered events. Invoked upon cleanup process */
  #events: VoidFunction[] = []

  /** Registered effects. Invoked upon cleanup process */
  #watchers: VoidFunction[] = []

  /** History API based router. */
  constructor({ routes, URLPattern }: Options<RN, FieldsMeta>) {
    // @ts-ignore
    if (URLPattern) this.#Pattern = URLPattern

    this.#routeData = signal(routes)

    this.#events.push(this.#autoUpdate())
  }

  #getWatcherCleaner = (watcher: VoidFunction) => {
    return () => {
      watcher()

      this.#watchers = this.#watchers.filter(effect => effect !== watcher)
    }
  }

  /** Update upon URL change */
  #autoUpdate = () => {
    const action = () => {
      this.update()
    }

    self.addEventListener('popstate', action)

    // Produce cleanup code
    return () => {
      self.removeEventListener('popstate', action)
    }
  }

  /** Overall detail */
  get summaryState() {
    return this.#summary.value
  }

  /** Current route detail */
  get routeState() {
    return this.#route.value
  }

  getDetail = (name: RN) => {
    return this.#details.value[name]
  }

  getCurrentDetail = () => {
    const name = this.#current.value

    if (!name) return

    return { name, ...this.getDetail(name) }
  }

  /** Refresh route information */
  update = () => {
    this.#url.value = getCurrentURL()
  }

  /** Check current route name */
  on = (name: RN) => {
    const currentRN = this.#current.value

    if (!currentRN) return false

    const { isMatch } = this.getDetail(currentRN)

    return isMatch && currentRN === name
  }

  /**
   * Same as `on()` but accepts multiple route names.
   *
   * Returns `true` if one of them matches.
   */
  onOneOf = (names: RN[]) => {
    const matches = names.map(name => this.on(name))

    return !!matches.filter(Boolean).length
  }

  /**
   * Similar to `on()` except this only check for route pattern.
   *
   * Whereas `on` consider options such as `ignore`.
   */
  onRouteMatch = (name: RN) => {
    return this.getDetail(name).isMatch
  }

  /** Jump between routes. */
  redirect = (name: RN, options: MainRedirectOptions = {}) => {
    const { hash, params, queryParams } = this.#route.value

    const { replace = false, ...rest } = (() => {
      if (typeof options == 'function') {
        return options({
          hash,
          params,
          queryParams
        })
      }

      return options
    })()

    const { pattern } = this.getDetail(name)

    const URL = buildURL(pattern.pathname, rest)

    const method: RedirectMode = replace ? 'replaceState' : 'pushState'

    history[method](null, '', URL)

    this.update()
  }

  /** Watch: `summaryState` */
  watchSummaryState = (
    callback: (
      summaryState: CreateHistory<RN, FieldsMeta>['summaryState']
    ) => void
  ) => {
    const watcher = effect(() => callback(this.#summary.value))

    this.#watchers.push(watcher)

    return this.#getWatcherCleaner(watcher)
  }

  /** Watch: `routeState` */
  watchRouteState = (
    callback: (routeState: CreateHistory<RN, FieldsMeta>['routeState']) => void
  ) => {
    const watcher = effect(() => callback(this.#route.value))

    this.#watchers.push(watcher)

    return this.#getWatcherCleaner(watcher)
  }

  /** De-register events, watchers */
  destroy = () => {
    this.#watchers.forEach(stop => stop())
    this.#events.forEach(stop => stop())

    this.#events = []
    this.#watchers = []
  }
}

export default CreateHistory
