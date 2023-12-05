export function convertToCurrency({
  value,
  divinePrice,
  toCurrency
}: {
  value: number
  divinePrice: number
  toCurrency: 'chaos' | 'divine'
}) {
  if (toCurrency === 'chaos') {
    return value
  }
  return value / divinePrice
}
