const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i
const SRGB_THRESHOLD = 0.03928
const SRGB_SCALE = 12.92
const CONTRAST_TEXT_AA = 4.5
const CONTRAST_NON_TEXT_AA = 3

function expandHex(hex: string): string {
  if (!HEX_COLOR_PATTERN.test(hex)) throw new Error(`Cor hexadecimal inválida: ${hex}`)
  if (hex.length === 4) return hex.slice(0, 1) + [...hex.slice(1)].map((digit) => digit + digit).join('')
  return hex
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255
  if (normalized <= SRGB_THRESHOLD) return normalized / SRGB_SCALE
  return ((normalized + 0.055) / 1.055) ** 2.4
}

function parseChannels(hex: string): number[] {
  const expanded = expandHex(hex).slice(1)
  return [0, 2, 4].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16))
}

export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseChannels(hex)
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue)
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const foreground = relativeLuminance(foregroundHex)
  const background = relativeLuminance(backgroundHex)
  const lighter = Math.max(foreground, background)
  const darker = Math.min(foreground, background)
  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsTextAA(foregroundHex: string, backgroundHex: string): boolean {
  return contrastRatio(foregroundHex, backgroundHex) >= CONTRAST_TEXT_AA
}

export function meetsNonTextAA(foregroundHex: string, backgroundHex: string): boolean {
  return contrastRatio(foregroundHex, backgroundHex) >= CONTRAST_NON_TEXT_AA
}
