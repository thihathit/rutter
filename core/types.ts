import { SetRequired } from 'type-fest'

import { URLBuilderOptions } from '$utility/url'
import { EditorFriendly } from '$utility/types'

type PatternFields = Pick<URLPattern, 'pathname' | 'search' | 'hash'>

type Fields = {
  /**
   * **Usage**: Mark as placeholder route or URL grouping segment.
   *
   * **Example**: In `/auth/:method`, `auth` isn't a route, just a URL grouping path. Since it's not a route, it's considered `404` page when accessed.
   */
  ignore?: boolean

  /**
   * Custom meta data
   */
  meta?: unknown
}

type Value = EditorFriendly<
  SetRequired<Partial<PatternFields>, 'pathname'> & Fields
>

/** Unique route name */
export type RouteName = string

export type RouteWithPatternValue = Fields & {
  pattern: URLPattern
} & PatternFields

export type Data<Name extends RouteName> = Record<Name, Value>

export type WithPattern<Name extends RouteName> = Record<
  Name,
  RouteWithPatternValue
>

export type DetailsValue = Value & {
  isMatch: ReturnType<URLPattern['test']>
  detail: ReturnType<URLPattern['exec']>
}

export type RedirectMode = 'pushState' | 'replaceState'

type RedirectOptions = EditorFriendly<URLBuilderOptions & { replace?: boolean }>

export type MainRedirectOptions =
  | RedirectOptions
  | ((currentRouteState: URLBuilderOptions) => RedirectOptions)
