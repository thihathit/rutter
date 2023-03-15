import { Primitive } from 'type-fest'

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

export const buildURL = <T extends string>(
  path: T,
  options?: URLBuilderOptions
): URL => {
  const { params = {}, queryParams = {}, hash } = { ...options }

  const pathname = path
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

  const url = new URL(pathname, baseURL)

  Object.keys(queryParams).map(name => {
    url.searchParams.set(name, `${queryParams[name]}`)
  })

  if (hash) {
    url.hash = hash
  }

  return url
}
