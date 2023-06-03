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
