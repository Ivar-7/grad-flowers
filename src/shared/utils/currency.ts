const kshFormatter = new Intl.NumberFormat('en-KE', {
  maximumFractionDigits: 0,
})

export function formatKsh(amount: number): string {
  return `KSh ${kshFormatter.format(amount)}`
}
