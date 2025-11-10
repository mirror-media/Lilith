export function validateTaiwanNationalId(id: string): boolean {
  if (!id || typeof id !== 'string') return false

  const idPattern = /^[A-Z][12]\d{8}$/
  if (!idPattern.test(id)) return false

  const letterValues: Record<string, number> = {
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
    G: 16,
    H: 17,
    I: 34,
    J: 18,
    K: 19,
    L: 20,
    M: 21,
    N: 22,
    O: 35,
    P: 23,
    Q: 24,
    R: 25,
    S: 26,
    T: 27,
    U: 28,
    V: 29,
    W: 32,
    X: 30,
    Y: 31,
    Z: 33,
  }

  const firstLetter = id.charAt(0)
  const letterValue = letterValues[firstLetter]
  if (!letterValue) return false

  const digits = id.slice(1).split('').map(Number)
  const weights = [9, 8, 7, 6, 5, 4, 3, 2, 1, 1]

  let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * weights[i]
  }

  return sum % 10 === 0
}
