export interface Character {
  /** Must match a key in worker/prompt/persona.ts. */
  id: string;
  name: string;
  /** One line on the card. */
  tagline: string;
  /** Two lines under it -- what talking to them is actually like. */
  blurb: string;
  /** What they open with, before the model is ever called. */
  greeting: string;
  /** Base hue, 0-360. The card and the bubbles are built from it. */
  hue: number;
}
