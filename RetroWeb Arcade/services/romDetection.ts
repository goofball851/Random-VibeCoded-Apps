import { ConsoleSystem } from '../types';
import { ACCEPTED_EXTENSIONS } from '../constants';

const readBytes = (file: File, start: number, length: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(start, start + length));
  });
};

const hasBytes = (buffer: Uint8Array, sequence: number[]) => {
  if (buffer.length < sequence.length) return false;
  for (let i = 0; i < sequence.length; i++) {
    if (buffer[i] !== sequence[i]) return false;
  }
  return true;
};

// Nintendo Logo (compressed) found in GB/GBC/GBA headers
// Starts at 0x04 for GBA, 0x104 for GB/GBC
const NINTENDO_LOGO_START = [0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B];

export const detectSystem = async (file: File): Promise<ConsoleSystem> => {
  // 1. Magic Numbers / Header Analysis
  
  try {
    // NES: "NES" + 0x1A at 0x00
    const header0 = await readBytes(file, 0, 4);
    if (hasBytes(header0, [0x4E, 0x45, 0x53, 0x1A])) {
        return ConsoleSystem.NES;
    }

    // Genesis: "SEGA" at 0x100
    const header100 = await readBytes(file, 0x100, 4);
    if (hasBytes(header100, [0x53, 0x45, 0x47, 0x41])) { // SEGA
        return ConsoleSystem.GENESIS;
    }

    // GBA: Nintendo Logo at 0x04
    const header04 = await readBytes(file, 0x04, 8);
    if (hasBytes(header04, NINTENDO_LOGO_START)) {
        return ConsoleSystem.GBA;
    }

    // GB/GBC: Nintendo Logo at 0x104
    const header104 = await readBytes(file, 0x104, 8);
    if (hasBytes(header104, NINTENDO_LOGO_START)) {
        // Distinguish GB vs GBC
        // 0x143 contains CGB Flag: 0x80 or 0xC0 means Color support
        const cgbFlag = await readBytes(file, 0x143, 1);
        if (cgbFlag[0] === 0x80 || cgbFlag[0] === 0xC0) {
            return ConsoleSystem.GBC;
        }
        return ConsoleSystem.GAMEBOY;
    }

    // SNES: Checksum Verification (LoROM/HiROM)
    // We check 4 locations: 0x7FDC, 0xFFDC (No Header), 0x81DC, 0x101DC (With Copier Header)
    const checkSnes = async (offset: number) => {
        if (file.size < offset + 4) return false;
        const b = await readBytes(file, offset, 4);
        // Data is little endian
        const complement = b[0] | (b[1] << 8);
        const checksum = b[2] | (b[3] << 8);
        // Valid if sum is 0xFFFF (and not 0/0)
        return (checksum + complement) === 0xFFFF && checksum !== 0;
    };

    if (await checkSnes(0x7FDC)) return ConsoleSystem.SNES;
    if (await checkSnes(0xFFDC)) return ConsoleSystem.SNES;
    if (await checkSnes(0x81DC)) return ConsoleSystem.SNES;
    if (await checkSnes(0x101DC)) return ConsoleSystem.SNES;

  } catch (e) {
      console.warn("Header detection failed, falling back to extension", e);
  }

  // 2. Fallback to Extension
  const ext = "." + file.name.split('.').pop()?.toLowerCase();
  for (const [sys, exts] of Object.entries(ACCEPTED_EXTENSIONS)) {
    if (exts.includes(ext)) {
      return sys as ConsoleSystem;
    }
  }

  throw new Error(`Could not automatically detect system for: ${file.name}. Please ensure the file extension is correct.`);
};