export const normalize = (set, range = [0, 1]) => {
  if (range.length > 2 || !Array.isArray(set) || !Array.isArray(range))
    throw new Error('invalid arguments to normalize')

  const min = Math.min(...set)
  let newSet = set.map(n => n - min)
  const max = Math.max(...newSet)
  newSet = newSet.map(n => n / max)

  // newSet is now in range [0, 1]

  let newRange = range[1] - range[0]
  let initial = range[0]

  // normalized = (array * new range) + range[0];

  return newSet.map(n => n * newRange + initial)
}
