import { mapValues } from 'lodash-es'
import { Signal, signal, computed, effect } from '@preact/signals-core'

import { buildURL } from '$utility/url'

import {
  RouteName,
  WithPattern,
  Data,
  RouteWithPatternValue,
  DetailsValue,
  RedirectMode,
  MainRedirectOptions
} from './types'

type Options<RN extends RouteName> = {
  /** Register your routes here. */
  routes: Data<RN>

  /** Replace with ponyfill. */
  URLPattern?: unknown
}

const getCurrentURL = () => new URL(self.location.toString())

export class CreateHistory<RN extends RouteName> {
  private Pattern = URLPattern

  private url = signal(getCurrentURL())

  /** `Reactive` */
  private routeData: Signal<Data<RN>>

  /** `Reactive` */
  private withPattern = computed(() =>
    mapValues<Data<RN>, RouteWithPatternValue>(
      this.routeData.value,
      ({ pathname, hash = '*', search = '*', ...rest }) => ({
        pathname,
        search,
        hash,
        pattern: new this.Pattern({
          ...this.url,
          pathname,
          hash,
          search
        }),
        ...rest
      })
    )
  )

  /** `Reactive` */
  private details = computed(() =>
    mapValues<WithPattern<RN>, DetailsValue>(
      this.withPattern.value,
      ({ pattern, ...rest }) => ({
        pattern,
        isMatch: pattern.test(this.url.value),
        detail: pattern.exec(this.url.value),
        ...rest
      })
    )
  )

  /** `Reactive` */
  private current = computed(() => {
    const details = this.details.value

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
  private route = computed(() => {
    const url = this.url.value
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
  private summary = computed(() => ({
    url: this.url.value,
    routeData: this.routeData.value,
    withPattern: this.withPattern.value,
    details: this.details.value,
    route: this.route.value,
    current: this.current.value
  }))

  /** Registered events. Invoked upon cleanup process */
  private events: VoidFunction[] = []

  /** Registered effects. Invoked upon cleanup process */
  private watchers: VoidFunction[] = []

  /** History API based router. */
  constructor({ routes, URLPattern }: Options<RN>) {
    // @ts-ignore
    if (URLPattern) this.Pattern = URLPattern

    this.routeData = signal(routes)

    this.events.push(this.autoUpdate())
  }

  /** Update upon URL change */
  private autoUpdate() {
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
    return this.summary.value
  }

  /** Current route detail */
  get routeState() {
    return this.route.value
  }

  public getDetail(name: RN) {
    return this.details.value[name]
  }

  public getCurrentDetail() {
    const name = this.current.value

    if (!name) return

    return { name, ...this.getDetail(name) }
  }

  /** Refresh route information */
  public update() {
    this.url.value = getCurrentURL()
  }

  /** Check current route name */
  public on(name: RN) {
    const currentRN = this.current.value

    if (!currentRN) return false

    const { isMatch } = this.getDetail(currentRN)

    return isMatch && currentRN === name
  }

  /**
   * Same as `on()` but accepts multiple route names.
   *
   * Returns `true` if one of them matches.
   */
  public onOneOf(names: RN[]) {
    const matches = names.map(this.on)

    return !!matches.filter(Boolean).length
  }

  /** Jump between routes. */
  public redirect(name: RN, options: MainRedirectOptions = {}) {
    const { hash, params, queryParams } = this.route.value

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

    const { pathname } = this.getDetail(name)

    const URL = buildURL(pathname, rest)

    const method: RedirectMode = replace ? 'replaceState' : 'pushState'

    history[method](null, '', URL)

    this.update()
  }

  /** Watch: `summaryState` */
  public watchSummaryState(
    callback: (summaryState: CreateHistory<RN>['summaryState']) => void
  ) {
    const cleanup = effect(() => callback(this.summary.value))

    this.watchers.push(cleanup)

    return cleanup
  }

  /** Watch: `routeState` */
  public watchRouteState(
    callback: (routeState: CreateHistory<RN>['routeState']) => void
  ) {
    const cleanup = effect(() => callback(this.route.value))

    this.watchers.push(cleanup)

    return cleanup
  }

  /** De-register events, watchers */
  public destroy() {
    const stoppers = [...this.watchers, ...this.events]

    stoppers.map(stop => stop())

    this.events = []
    this.watchers = []
  }
}

export default CreateHistory
