import { SetRequired } from 'type-fest'

import { URLBuilderOptions } from '$utility/url'

/** Unique route name */
export type RouteName = string

/** Default value */
export type MetaValue = unknown

type PatternFields = Pick<URLPattern, 'pathname' | 'search' | 'hash'>

type Fields<Meta extends MetaValue> = {
  /**
   * **Usage**: Mark as placeholder route or URL grouping segment.
   *
   * **Example**: In `/auth/:method`, `auth` isn't a route, just a URL grouping path. Since it's not a route, it's considered `404` page when accessed.
   */
  ignore?: boolean

  /**
   * Custom meta data
   */
  meta?: Meta
}

type Value<FieldsMeta extends MetaValue> = SetRequired<
  Partial<PatternFields>,
  'pathname'
> &
  Fields<FieldsMeta>

export type RouteWithPatternValue<FieldsMeta extends MetaValue> =
  Fields<FieldsMeta> & {
    pattern: URLPattern
  } & PatternFields

export type Data<Name extends RouteName, FieldsMeta extends MetaValue> = Record<
  Name,
  Value<FieldsMeta>
>

export type WithPattern<
  Name extends RouteName,
  FieldsMeta extends MetaValue
> = Record<Name, RouteWithPatternValue<FieldsMeta>>

export type DetailsValue<FieldsMeta extends MetaValue> = Value<FieldsMeta> & {
  isMatch: ReturnType<URLPattern['test']>
  detail: ReturnType<URLPattern['exec']>
}

export type RedirectMode = 'pushState' | 'replaceState'

type RedirectOptions = URLBuilderOptions & { replace?: boolean }

export type MainRedirectOptions =
  | RedirectOptions
  | ((currentRouteState: URLBuilderOptions) => RedirectOptions)
