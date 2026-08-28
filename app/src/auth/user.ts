// The one shape the rest of the app knows a person by, whichever of the two
// backends produced it.

export interface User {
  id: string;
  /** What the friends call them. */
  name: string;
  email?: string;
}
