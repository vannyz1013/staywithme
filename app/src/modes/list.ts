// The five ways to be in a conversation.
//
// One conversation, one memory -- the mode changes how the companion is in
// it, not what it remembers. Switching mid-thread is normal and keeps
// everything; see worker/prompt/mode.ts for what each one actually does.

export type ModeId = 'talk' | 'vent' | 'advice' | 'listen' | 'stay';

export interface Mode {
  id: ModeId;
  icon: string;
  label: string;
  /** Shown when you switch, so the change is visible rather than implied. */
  blurb: string;
}

export const MODES: Mode[] = [
  { id: 'talk', icon: '💬', label: 'Talk', blurb: 'Just talking. Nothing has to go anywhere.' },
  { id: 'vent', icon: '💭', label: 'Vent', blurb: 'Get it out. No solutions, no silver linings.' },
  { id: 'advice', icon: '💡', label: 'Advice', blurb: "Tell them what's wrong and get a real opinion." },
  { id: 'listen', icon: '👂', label: 'Listen', blurb: "You talk. They'll keep the space open." },
  { id: 'stay', icon: '🌙', label: 'Stay', blurb: "You don't have to say anything. Someone's here." },
];

export const DEFAULT_MODE: ModeId = 'talk';

export function getMode(id: string): Mode {
  return MODES.find((mode) => mode.id === id) ?? MODES[0]!;
}
