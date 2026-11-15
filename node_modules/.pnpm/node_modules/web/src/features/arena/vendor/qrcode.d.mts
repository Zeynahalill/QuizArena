type QRCode = { addData: (data: string) => void; make: () => void; getModuleCount: () => number; isDark: (row: number, col: number) => boolean }
export default function qrcode(type: number, correction: 'L' | 'M' | 'Q' | 'H'): QRCode
