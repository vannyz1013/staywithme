// The friend speaking first.
//
// A timer that fires into a silence, backing off each time and stopping
// after a few tries. The shape is the whole feature: someone who says one
// more thing when you go quiet is company, and someone who says five is a
// notification.
//
// Rules it enforces:
//   - only while the tab is actually visible -- no talking to an empty room
//   - the clock restarts the moment you type
//   - three attempts per silence, at 90s, 3min, 6min
//   - the friend may decline any of them, and often should

const DELAYS_MS = [90_000, 180_000, 360_000];

export interface IdleNudge {
  /** Call after every message, yours or theirs. */
  restart(): void;
  stop(): void;
}

export interface IdleNudgeOptions {
  /** Returns the line the friend said, or null if they had nothing. */
  fire: (quietMinutes: number) => Promise<string | null>;
  /** Answered false while a reply is streaming or the screen is busy. */
  ready: () => boolean;
}

export function idleNudge(options: IdleNudgeOptions): IdleNudge {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let stopped = false;

  function clear(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function schedule(): void {
    clear();
    const delay = DELAYS_MS[attempt];
    if (stopped || delay === undefined) return;

    timer = setTimeout(async () => {
      // Not while the tab is in the background: the point is to be there
      // when someone is sitting looking at the screen.
      if (stopped || document.visibilityState !== 'visible' || !options.ready()) {
        schedule();
        return;
      }

      const quietMinutes = DELAYS_MS.slice(0, attempt + 1).reduce((a, b) => a + b, 0) / 60_000;
      attempt += 1;
      await options.fire(quietMinutes);
      schedule();
    }, delay);
  }

  return {
    restart() {
      attempt = 0;
      schedule();
    },
    stop() {
      stopped = true;
      clear();
    },
  };
}
