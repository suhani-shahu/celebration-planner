/** Capitalises the first letter of a string: 'wedding' -> 'Wedding'. */
export function capitalize(text) {
  const value = String(text ?? '')
  return value.charAt(0).toUpperCase() + value.slice(1)
}
