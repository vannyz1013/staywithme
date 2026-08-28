// Swaps one screen for another inside #app.
//
// Screens return a node and, optionally, a teardown function -- the chat
// screen has an open EventSource-style fetch stream to abort when you leave.

export type Screen = { node: Node; destroy?: () => void };

let current: Screen | null = null;

export function mount(root: HTMLElement, screen: Screen): void {
  current?.destroy?.();
  root.replaceChildren(screen.node);
  current = screen;
}
