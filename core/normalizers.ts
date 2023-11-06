import endsWith from '$utility/functions'

export const trailingSlash = {
  pattern: '{/}?',
  matchers: ['/', '{/}', '{/}?'],
  matchAny(pathname: string) {
    return !!this.matchers.filter(content => endsWith(pathname, content)).length
  }
}
