export const mapValues = <Value extends object, Result extends object>(
  original: Value,
  iteratee: (
    value: Value[keyof Value],
    key: keyof Value,
    original: Value
  ) => Result
) => {
  type Key = keyof Value
  type NewValues = Record<Key, Result>

  const values = Object(original)
  const newValues = {} as NewValues

  Object.keys(values).forEach(key => {
    newValues[key as Key] = iteratee(values[key], key as Key, values)
  })

  return newValues
}

/**
 * Checks if `string` ends with the given target string.
 */
const endsWith = (string: string, target: string, position?: number) => {
  const { length } = string
  position = position === undefined ? length : +position
  if (position < 0 || position !== position) {
    position = 0
  } else if (position > length) {
    position = length
  }
  const end = position
  position -= target.length
  return position >= 0 && string.slice(position, end) === target
}

export default endsWith
