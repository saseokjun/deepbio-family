export const stringToColor = (str: string) => {
  let hash = 0
  let i

  for (i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let colors = []

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    colors.push(value)
  }
  return `rgba(${colors.join(',')}, 0.3)`
}