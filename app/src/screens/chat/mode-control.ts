// Choosing how you want to talk.
//
// Persists the choice, tells the session, and says out loud what changed --
// a mode switch whose only visible effect is a highlighted button looks
// broken even when it is working.

import { setMode } from '../../modes/current';
import { getMode, type ModeId } from '../../modes/list';
import { modeBar, type ModeBar } from '../../ui/mode-bar';
import { toast } from '../../ui/toast';
import type { ChatSession } from './session';

export function modeControl(session: ChatSession, onChange: () => void): ModeBar {
  const bar = modeBar(session.mode, (picked: ModeId) => {
    session.mode = picked;
    setMode(session.user.id, session.character.id, picked);
    bar.set(picked);

    const mode = getMode(picked);
    toast(`${mode.icon}  ${mode.blurb}`);
    onChange();
  });

  return bar;
}
