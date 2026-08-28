// A named thing that happened between you two.
//
// Not every exchange earns one. The memory pass (worker/routes/remember.ts)
// names a moment only when something actually happened -- a first meeting, a
// bad night, a day that mattered -- so the list stays short enough to mean
// something.

export interface Moment {
  id: string;
  /** Five words or fewer. "That terrible Tuesday", not a summary. */
  title: string;
  /** ISO timestamp of when it happened. */
  at: string;
}
