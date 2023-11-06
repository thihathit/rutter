import { Primitive } from 'type-fest'

import { trailingSlash } from '$core/normalizers'

type Value = Exclude<Primitive, symbol>
type Data = {
  [key: string]: Value
}

const baseURL = self.location.origin

export type URLBuilderOptions = {
  params?: Data
  hash?: string
  queryParams?: Data
}

export const buildURL = (
  pathname: string,
  options?: URLBuilderOptions
): URL => {
  const { params = {}, queryParams = {}, hash } = { ...options }

  // Exclude normalized pattern
  if (trailingSlash.matchAny(pathname)) {
    pathname = pathname.split(trailingSlash.pattern)[0]
  }

  const path = pathname
    .split('/')
    .map(v => {
      const tokenName = v.replace(':', '')
      const tokenValue = params[tokenName]

      if (tokenValue && v.startsWith(':')) {
        return v.replace(`:${tokenName}`, `${tokenValue}`)
      }

      return v
    })
    .join('/')

  const url = new URL(path, baseURL)

  Object.keys(queryParams).map(name => {
    url.searchParams.set(name, `${queryParams[name]}`)
  })

  if (hash) {
    url.hash = hash
  }

  return url
}
