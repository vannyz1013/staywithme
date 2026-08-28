// Choosing who to talk to.
//
// The cards show the companions as you have made them -- renamed, if you
// renamed them -- because seeing the written name here and your name in the
// chat would read as two different people.

import type { User } from '../auth/user';
import { CHARACTERS } from '../characters/list';
import { resolveAll } from '../characters/resolve';
import type { FriendProfile } from '../characters/profile';
import { el } from '../core/el';
import type { Screen } from '../core/mount';
import { t } from '../i18n/current';
import { characterCard } from '../ui/card';
import { languagePicker } from '../ui/language-picker';
import { realHelpPanel } from '../ui/real-help';

export interface FriendsActions {
  onPick: (characterId: string) => void;
  onSignOut: () => void;
  /** Re-render, for when the language changes under us. */
  onRefresh: () => void;
}

export function friendsScreen(
  user: User,
  profiles: Record<string, FriendProfile>,
  actions: FriendsActions,
): Screen {
  const strings = t();

  const grid = el(
    'div',
    { class: 'card-grid' },
    resolveAll(CHARACTERS, profiles).map((character) => characterCard(character, actions.onPick)),
  );

  const node = el('main', { class: 'screen screen-friends' }, [
    el('header', { class: 'friends-header' }, [
      el('div', {}, [
        el('h1', { class: 'wordmark', text: 'Stay With Me' }),
        el('p', { class: 'lede', text: `${user.name} — ${strings.whoTonight}` }),
      ]),
      el('div', { class: 'friends-tools' }, [
        languagePicker(actions.onRefresh),
        el('button', { class: 'link', type: 'button', text: strings.signOut, onclick: actions.onSignOut }),
      ]),
    ]),

    grid,

    el('button', {
      class: 'help-link help-link-standalone',
      type: 'button',
      text: strings.realPerson,
      onclick: () => {
        const sheet = realHelpPanel(() => sheet.remove());
        node.append(sheet);
      },
    }),
  ]);

  return { node };
}
