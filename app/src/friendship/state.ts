// How this conversation is going, right now.
//
// Read by the model each turn (worker/routes/state.ts) rather than guessed
// from keywords. It exists for one reason: "wants advice: no, wants company:
// yes" is the difference between a friend who helps and a friend who lectures.

export interface ConversationState {
  /** One word: tired, low, angry, hopeful, flat, okay... */
  mood: string;
  energy: 'low' | 'medium' | 'high';
  wantsAdvice: boolean;
  wantsCompany: boolean;
}

/** What we assume before the first read comes back. */
export const UNKNOWN_STATE: ConversationState = {
  mood: 'unknown',
  energy: 'medium',
  wantsAdvice: false,
  wantsCompany: true,
};

/** Narrows whatever the Worker returned; anything odd falls back to unknown. */
export function parseState(value: unknown): ConversationState {
  if (typeof value !== 'object' || value === null) return UNKNOWN_STATE;
  const raw = value as Record<string, unknown>;
  const energy = raw.energy;

  return {
    mood: typeof raw.mood === 'string' && raw.mood ? raw.mood.slice(0, 24) : UNKNOWN_STATE.mood,
    energy: energy === 'low' || energy === 'high' || energy === 'medium' ? energy : 'medium',
    wantsAdvice: raw.wantsAdvice === true,
    wantsCompany: raw.wantsCompany !== false,
  };
}
