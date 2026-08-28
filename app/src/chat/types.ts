// What the Worker expects on the wire, and what a callback gets while a
// reply is arriving.

export interface WireMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** Called once per streamed piece, with the reply so far. */
export type OnChunk = (soFar: string) => void;
