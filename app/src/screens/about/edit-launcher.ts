// Opens the "make them yours" sheet and saves what comes back.

import { loadProfile } from '../../characters/load-profiles';
import { saveProfile } from '../../characters/save-profile';
import type { Character } from '../../characters/types';
import { editFriendPanel } from '../../ui/edit-friend';

export async function openEditor(
  userId: string,
  character: Character,
  mountInto: HTMLElement,
  onSaved: () => void,
): Promise<void> {
  const profile = await loadProfile(userId, character.id);

  const panel = editFriendPanel({
    writtenName: character.name,
    profile,
    onClose: () => panel.remove(),
    onSave: async (next) => {
      await saveProfile(userId, character.id, next);
      panel.remove();
      onSaved();
    },
  });

  mountInto.append(panel);
}
