export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

export function validatePlayerName(name: string): boolean {
  return name.length >= 2 && name.length <= 20 && /^[a-zA-Z0-9\s]+$/.test(name)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}