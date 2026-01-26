import { ConsoleSystem } from './types';

export const SYSTEM_LABELS: Record<ConsoleSystem, string> = {
  [ConsoleSystem.NES]: 'NES',
  [ConsoleSystem.SNES]: 'Super Nintendo',
  [ConsoleSystem.GENESIS]: 'Sega Genesis',
  [ConsoleSystem.GAMEGEAR]: 'Game Gear',
  [ConsoleSystem.GAMEBOY]: 'Game Boy',
  [ConsoleSystem.GBC]: 'Game Boy Color',
  [ConsoleSystem.GBA]: 'Game Boy Advance',
  [ConsoleSystem.NDS]: 'Nintendo DS',
};

export const ACCEPTED_EXTENSIONS: Record<ConsoleSystem, string[]> = {
  [ConsoleSystem.NES]: ['.nes'],
  [ConsoleSystem.SNES]: ['.smc', '.sfc', '.fig'],
  [ConsoleSystem.GENESIS]: ['.bin', '.smd', '.gen', '.md'],
  [ConsoleSystem.GAMEGEAR]: ['.gg'],
  [ConsoleSystem.GAMEBOY]: ['.gb'],
  [ConsoleSystem.GBC]: ['.gbc'],
  [ConsoleSystem.GBA]: ['.gba'],
  [ConsoleSystem.NDS]: ['.nds'],
};

export const KEYBOARD_CONTROLS = [
  { keys: ['Arrow Keys'], action: 'D-Pad Movement' },
  { keys: ['Z'], action: 'A Button' },
  { keys: ['X'], action: 'B Button' },
  { keys: ['A'], action: 'Y Button' },
  { keys: ['S'], action: 'X Button' },
  { keys: ['Q'], action: 'L Trigger' },
  { keys: ['W'], action: 'R Trigger' },
  { keys: ['Enter'], action: 'Start' },
  { keys: ['Shift'], action: 'Select' },
  { keys: ['ESC'], action: 'Pause Menu' },
  { keys: ['M'], action: 'Mute/Unmute' },
  { keys: ['Shift + F2'], action: 'Save State' },
  { keys: ['Shift + F4'], action: 'Load State' },
];

export const GAMEPAD_CONTROLS = [
  { keys: ['D-Pad', 'Left Stick'], action: 'Movement' },
  { keys: ['A', 'B', 'X', 'Y'], action: 'Action Buttons' },
  { keys: ['Start'], action: 'Start' },
  { keys: ['Select', 'Back'], action: 'Select' },
  { keys: ['LB', 'RB'], action: 'L / R Bumpers' },
  { keys: ['LT', 'RT'], action: 'L / R Triggers' },
];